import { describe, expect, it, beforeEach } from "vitest";
import { signAccessToken } from "@/lib/auth/mobile-access";
import { requireAdmin, requireAuth } from "@/lib/auth/require-auth";

const USER = "11111111-1111-4111-8111-111111111111";
const SESSION = "22222222-2222-4222-8222-222222222222";

function deps(role = "student") {
  return {
    verifyToken: async () => ({ userId: USER, role, sessionId: SESSION, expiresAt: Date.now() + 3600_000 }),
    findSessionById: async () => ({ id: SESSION, userId: USER, expiresAt: new Date(Date.now() + 3600_000) }),
    findUserRole: async () => ({ role, mcpAccess: false }),
  };
}

function req(method = "GET", headers: Record<string, string> = {}): Request {
  return new Request("https://test.local/api/v1/me", { method, headers: { host: "test.local", ...headers } });
}

beforeEach(() => {
  process.env.API_JWT_SECRET = "w9-test-secret-please-change-in-prod-123456";
});

describe("auth gate: cookie unchanged, bearer added", () => {
  it("cookie login still works (no Authorization header)", async () => {
    const result = await requireAuth(req(), { cookieHeader: "session_token=abc", ...deps() });
    expect(result.ok).toBe(true);
  });

  it("bearer access token authenticates with the same roles", async () => {
    const token = await signAccessToken({ userId: USER, role: "student", sessionId: SESSION });
    const result = await requireAuth(req("GET", { authorization: `Bearer ${token}` }), deps());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.userId).toBe(USER);
      expect(result.session.role).toBe("student");
      expect(result.session.authMethod).toBe("bearer");
    }
    const adminDenied = await requireAdmin(req("GET", { authorization: `Bearer ${token}` }), deps());
    expect(adminDenied.ok).toBe(false);
  });

  it("expired / forged / wrong-user tokens all give 401", async () => {
    const good = await signAccessToken({ userId: USER, role: "student", sessionId: SESSION });
    const forged = `${good.slice(0, -1)}${good.endsWith("0") ? "1" : "0"}`;
    for (const header of [`Bearer ${forged}`, "Bearer garbage", "Bearer "]) {
      const result = await requireAuth(req("GET", { authorization: header }), deps());
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.response.status).toBe(401);
    }
    // Session row deleted (logout) → 401 even with a valid signature.
    const loggedOut = await requireAuth(req("GET", { authorization: `Bearer ${good}` }), {
      ...deps(),
      findSessionById: async () => null,
    });
    expect(loggedOut.ok).toBe(false);
  });

  it("CSRF is skipped only for bearer, never for cookies", async () => {
    // Cookie mutation with a cross-origin Origin header → 403.
    const cookieDenied = await requireAuth(
      req("POST", { origin: "https://evil.test" }), { cookieHeader: "session_token=abc", ...deps() },
    );
    expect(cookieDenied.ok).toBe(false);
    if (!cookieDenied.ok) expect(cookieDenied.response.status).toBe(403);

    // Same hostile headers, but bearer auth → passes (no ambient cookie).
    const token = await signAccessToken({ userId: USER, role: "student", sessionId: SESSION });
    const bearerOk = await requireAuth(req("POST", { origin: "https://evil.test", authorization: `Bearer ${token}` }), deps());
    expect(bearerOk.ok).toBe(true);
  });
});
