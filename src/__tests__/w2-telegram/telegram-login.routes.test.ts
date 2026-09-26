import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  status: vi.fn(),
  rateLimit: vi.fn(async () => ({ success: true, remaining: 10, reset: Date.now() + 60_000 })),
}));

vi.mock("@/features/auth/server/telegram-login.service", () => ({
  startTelegramLogin: mocks.start,
  getTelegramLoginStatus: mocks.status,
}));
vi.mock("@/lib/security/rateLimit", () => ({
  checkRateLimit: mocks.rateLimit,
  createRateLimitResponse: vi.fn(() => new Response(null, { status: 429 })),
  getClientIp: vi.fn(() => "127.0.0.1"),
  PRESETS: { LOGIN: { windowMs: 60_000 } },
}));

import { POST as startRoute } from "@/app/api/auth/telegram/start/route";
import { GET as statusRoute } from "@/app/api/auth/telegram/status/route";

const requestId = "11111111-1111-4111-8111-111111111111";
const user = {
  id: "22222222-2222-4222-8222-222222222222",
  phone: "+998901234567",
  fullName: "Ali Valiyev",
  email: null,
  role: "student",
  avatarUrl: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Telegram auth routes", () => {
  it("sets a proper httpOnly initiator cookie without Secure=false", async () => {
    mocks.start.mockResolvedValue({
      id: requestId,
      token: "abcdefghijklmnopqrstuvwxyzABCDEFG",
      deepLink: "https://t.me/bot?start=login_abcdefghijklmnopqrstuvwxyzABCDEFG",
      expiresAt: new Date(Date.now() + 300_000),
    });
    const response = await startRoute(new Request("https://site.test/api/auth/telegram/start", { method: "POST" }));
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(setCookie).toContain(`tg_login_${requestId}=`);
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=lax");
    expect(setCookie).not.toContain("Secure=false");
  });

  it("rejects a malformed status id with 400 before the service", async () => {
    const response = await statusRoute(new Request("https://site.test/api/auth/telegram/status?id=not-a-uuid"));
    expect(response.status).toBe(400);
    expect(mocks.status).not.toHaveBeenCalled();
  });

  it("passes a missing initiator cookie to the service as unknown", async () => {
    mocks.status.mockResolvedValue({ state: "unknown" });
    const response = await statusRoute(new Request(`https://site.test/api/auth/telegram/status?id=${requestId}`));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ state: "unknown" });
    expect(mocks.status).toHaveBeenCalledWith(requestId, null, expect.any(Object), undefined, { refCode: "" });
  });

  it("sets the session cookie and clears the initiator cookie on approval", async () => {
    mocks.status.mockResolvedValue({ state: "approved", user, token: "signed-session" });
    const response = await statusRoute(new Request(
      `https://site.test/api/auth/telegram/status?id=${requestId}`,
      { headers: { cookie: `tg_login_${requestId}=initiator-token` } },
    ));
    const setCookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(setCookie).toContain("session_token=signed-session");
    expect(setCookie).toContain(`tg_login_${requestId}=`);
    expect(setCookie).toContain("HttpOnly");
    expect(response.cookies.get("session_token")?.value).toBe("signed-session");
    expect(response.cookies.get(`tg_login_${requestId}`)?.maxAge).toBe(0);
  });

  it("returns a JSON 503 when the status service reports a database outage", async () => {
    mocks.status.mockRejectedValue(Object.assign(new Error("db down"), {
      code: "PROVIDER_UNAVAILABLE",
      status: 503,
    }));
    const response = await statusRoute(new Request(`https://site.test/api/auth/telegram/status?id=${requestId}`));
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: "PROVIDER_UNAVAILABLE" });
  });
});
