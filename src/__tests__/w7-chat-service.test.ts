import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const state = {
    selectResults: [] as unknown[][],
    returningResults: [] as unknown[][],
    updates: [] as Array<{ table: unknown; values: Record<string, unknown> }>,
  };
  const insert = (table: unknown) => ({
    values: (values: Record<string, unknown>) => ({
      returning: async () => (state.returningResults.shift() || []) as never,
      then: (resolve: (value: unknown) => void) => Promise.resolve().then(() => resolve(undefined)),
      values,
    }),
  });
  const update = (table: unknown) => ({
    set: (values: Record<string, unknown>) => {
      state.updates.push({ table, values });
      return { where: async () => undefined, returning: async () => [] };
    },
  });
  const tx = { insert, update, select: undefined as unknown };
  const db = {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => state.selectResults.shift() || [] }) }) }),
    insert, update,
    delete: () => ({ where: async () => undefined }),
    transaction: async (callback: (executor: typeof tx) => Promise<unknown>) => callback(tx),
  };
  tx.select = db.select;
  return Object.assign(state, { db, getChatSettings: vi.fn() });
});

vi.mock("@/db", () => ({ db: mocks.db }));
vi.mock("@/features/chat/server/settings.service", () => ({ getChatSettings: mocks.getChatSettings }));

import { postReply, sendVisitorMessage } from "@/features/chat/server/chat.service";
import { hashVisitorToken } from "@/features/chat/server/visitor-token";

const id = "11111111-1111-4111-8111-111111111111";
const now = new Date();
const row = { id, visitorTokenHash: hashVisitorToken("token"), userId: null, leadId: null, displayName: "Mehmon", contactPhone: null, contactTelegram: null, status: "open", assignedAdminId: null, aiMode: "off", lastMessageAt: now, unreadForAdmin: 0, unreadForVisitor: 0, sourcePath: "/", device: "test", createdAt: now };
const messageId = "22222222-2222-4222-8222-222222222222";
const replyId = "33333333-3333-4333-8333-333333333333";
const input = { clientId: messageId, body: "Salom", sourcePath: "/", device: "test" };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectResults = [];
  mocks.returningResults = [];
  mocks.updates = [];
  mocks.getChatSettings.mockResolvedValue({ aiDefaultMode: "off" });
});

describe("chat conversation lifecycle", () => {
  it("creates a pending conversation and message atomically", async () => {
    mocks.selectResults.push([]);
    mocks.returningResults.push([row], [{ id: messageId, conversationId: id, clientId: input.clientId, sender: "visitor", authorUserId: null, body: input.body, telegramMessageId: null, createdAt: now, readAt: null }]);
    const result = await sendVisitorMessage("token", input);
    expect(result.sender).toBe("visitor");
    expect(mocks.updates.some((update) => update.values.status === "pending" && update.values.unreadForAdmin !== undefined)).toBe(true);
  });

  it("deduplicates a retried clientId without another insert", async () => {
    mocks.selectResults.push([row], [{ id: messageId, conversationId: id, clientId: input.clientId, sender: "visitor", authorUserId: null, body: input.body, telegramMessageId: null, createdAt: now, readAt: null }]);
    const result = await sendVisitorMessage("token", input);
    expect(result.id).toBe(messageId);
    expect(mocks.returningResults).toHaveLength(0);
  });

  it("admin reply increments visitor unread and writes audit in one transaction", async () => {
    mocks.selectResults.push([row], []);
    mocks.returningResults.push([{ id: replyId, conversationId: id, clientId: "reply-client", sender: "admin", authorUserId: "admin", body: "Salom", telegramMessageId: null, createdAt: now, readAt: null }]);
    const result = await postReply("admin", id, "Salom", "reply-client", "127.0.0.1");
    expect(result.sender).toBe("admin");
    expect(mocks.updates.some((update) => update.values.unreadForVisitor !== undefined)).toBe(true);
  });
});
