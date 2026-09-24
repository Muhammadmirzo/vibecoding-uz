import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(), getVisitorConversation: vi.fn(), listMessages: vi.fn(),
  markConversationRead: vi.fn(), sendVisitorMessage: vi.fn(), getChatSettings: vi.fn(),
  getDbSession: vi.fn(), getOrCreateVisitorToken: vi.fn(), visitorTokenFromRequest: vi.fn(() => "visitor-token"),
  requireAdmin: vi.fn(), getThread: vi.fn(), listConversations: vi.fn(), postReply: vi.fn(),
  notifyVisitorMessage: vi.fn(),
}));

vi.mock("next/server", async (importOriginal) => ({
  ...await importOriginal<typeof import("next/server")>(),
  after: (callback: () => Promise<unknown>) => { void callback(); },
}));
vi.mock("@/lib/security/rateLimit", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/security/rateLimit")>(),
  checkRateLimit: mocks.checkRateLimit,
  getClientIp: () => "127.0.0.1",
}));
vi.mock("@/features/chat/server/chat.service", () => ({
  getVisitorConversation: mocks.getVisitorConversation,
  listMessages: mocks.listMessages,
  markConversationRead: mocks.markConversationRead,
  sendVisitorMessage: mocks.sendVisitorMessage,
  getThread: mocks.getThread,
  listConversations: mocks.listConversations,
  postReply: mocks.postReply,
}));
vi.mock("@/features/chat/server/settings.service", () => ({ getChatSettings: mocks.getChatSettings }));
vi.mock("@/features/chat/server/visitor-token", () => ({
  visitorTokenFromRequest: mocks.visitorTokenFromRequest,
  getOrCreateVisitorToken: mocks.getOrCreateVisitorToken,
}));
vi.mock("@/lib/auth/require-auth", () => ({ requireAdmin: mocks.requireAdmin, getDbSession: mocks.getDbSession }));
vi.mock("@/features/chat/server/ai-orchestrator.service", () => ({ orchestrateAiReply: vi.fn() }));
vi.mock("@/lib/telegram/chat-bridge", () => ({ notifyVisitorMessage: mocks.notifyVisitorMessage }));
vi.mock("@/features/analytics/server/track", () => ({ trackServerEvent: vi.fn() }));

import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/chat/messages/route";
import { GET as ADMIN_GET, PATCH as ADMIN_PATCH } from "@/app/api/v1/admin/chat/conversations/route";
import { POST as ADMIN_POST } from "@/app/api/v1/admin/chat/messages/route";
import { ServiceError } from "@/lib/http/errors";

const uuid = "11111111-1111-4111-8111-111111111111";
const conversation = { id: uuid, displayName: "Mehmon", status: "pending", aiMode: "assist", assignedAdminId: null, userId: null, leadId: null, lastMessageAt: new Date().toISOString(), unreadForAdmin: 1, unreadForVisitor: 0, sourcePath: "/", device: "test", contactPhone: null, contactTelegram: null, createdAt: new Date().toISOString() };

function request(url: string, body?: unknown) {
  return new NextRequest(`http://localhost${url}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.checkRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() + 1000 });
  mocks.getChatSettings.mockResolvedValue({ enabled: true, telegramNotify: true });
  mocks.notifyVisitorMessage.mockResolvedValue({ sent: true });
  mocks.getVisitorConversation.mockResolvedValue(conversation);
  mocks.listMessages.mockResolvedValue([]);
  mocks.sendVisitorMessage.mockResolvedValue({ id: "message", conversationId: uuid, clientId: "client", sender: "visitor", body: "Salom", createdAt: new Date().toISOString(), readAt: null, isDraft: false });
  mocks.getDbSession.mockResolvedValue(null);
  mocks.requireAdmin.mockResolvedValue({ ok: true, session: { userId: "admin", role: "admin", sessionId: "session" } });
});

describe("visitor chat routes", () => {
  it("validates the 2000 character boundary", async () => {
    const response = await POST(request("/api/v1/chat/messages", { clientId: crypto.randomUUID(), body: "x".repeat(2001) }));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("validation_error");
  });

  it("returns a v1 429 with Retry-After", async () => {
    mocks.checkRateLimit.mockResolvedValueOnce({ success: false, limit: 1, remaining: 0, reset: Date.now() + 1000, retryAfterSec: 1 });
    const response = await POST(request("/api/v1/chat/messages", { clientId: crypto.randomUUID(), body: "Salom" }));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("1");
    expect((await response.json()).error.code).toBe("rate_limited");
  });

  it("persists a message and notifies Telegram only when enabled", async () => {
    const response = await POST(request("/api/v1/chat/messages", { clientId: crypto.randomUUID(), body: "Salom" }));
    expect(response.status).toBe(201);
    expect(mocks.notifyVisitorMessage).toHaveBeenCalledOnce();
    mocks.notifyVisitorMessage.mockClear();
    mocks.getChatSettings.mockResolvedValueOnce({ enabled: true, telegramNotify: false });
    await POST(request("/api/v1/chat/messages", { clientId: crypto.randomUUID(), body: "Yana salom" }));
    expect(mocks.notifyVisitorMessage).not.toHaveBeenCalled();
  });

  it("accepts a bot honeypot without persisting it", async () => {
    const response = await POST(request("/api/v1/chat/messages", { clientId: crypto.randomUUID(), body: "bot", honeypot: "filled" }));
    expect(response.status).toBe(201);
    expect(mocks.sendVisitorMessage).not.toHaveBeenCalled();
  });

  it("degrades a missing chat migration to a safe 503", async () => {
    mocks.sendVisitorMessage.mockRejectedValueOnce(Object.assign(new Error("missing table"), { code: "42P01" }));
    const response = await POST(request("/api/v1/chat/messages", { clientId: crypto.randomUUID(), body: "Salom" }));
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe("database_unavailable");
  });

  it("prevents token A from reading token B conversation", async () => {
    const response = await GET(request(`/api/v1/chat/messages?conversationId=${crypto.randomUUID()}`));
    expect(response.status).toBe(404);
  });
});

describe("admin chat routes", () => {
  it("rejects unauthenticated and forbidden requests", async () => {
    mocks.requireAdmin.mockResolvedValueOnce({ ok: false, response: Response.json({ error: "no" }, { status: 401 }) });
    expect((await ADMIN_GET(request("/api/v1/admin/chat/conversations"))).status).toBe(401);
    mocks.requireAdmin.mockResolvedValueOnce({ ok: false, response: Response.json({ error: "no" }, { status: 403 }) });
    expect((await ADMIN_POST(request("/api/v1/admin/chat/messages", {}))).status).toBe(403);
  });

  it("validates admin query and maps missing threads to 404", async () => {
    expect((await ADMIN_GET(request("/api/v1/admin/chat/conversations?status=unknown"))).status).toBe(400);
    mocks.getThread.mockRejectedValue(new ServiceError("NOT_FOUND", "Suhbat topilmadi", 404));
    expect((await ADMIN_GET(request(`/api/v1/admin/chat/conversations?id=${uuid}`))).status).toBe(404);
  });

  it("rejects invalid admin mutations and accepts valid replies", async () => {
    expect((await ADMIN_POST(request("/api/v1/admin/chat/messages", { conversationId: "bad", body: "Salom" }))).status).toBe(400);
    expect((await ADMIN_PATCH(new NextRequest("http://localhost/api/v1/admin/chat/conversations", { method: "PATCH", headers: { "content-type": "application/json", origin: "http://localhost" }, body: JSON.stringify({ conversationId: uuid }) }))).status).toBe(400);
    mocks.postReply.mockResolvedValue({ id: "reply", conversationId: uuid, clientId: "client", sender: "admin", body: "Salom", createdAt: new Date().toISOString(), readAt: null, isDraft: false });
    expect((await ADMIN_POST(request("/api/v1/admin/chat/messages", { conversationId: uuid, body: "Salom" }))).status).toBe(200);
  });
});
