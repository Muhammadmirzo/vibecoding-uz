import { describe, expect, it } from "vitest";
import { signSessionToken } from "@/lib/auth/session/token";
import {
  getDbSession,
  requireAdmin,
  requireAuth,
  requireMentor,
} from "@/lib/auth/require-auth";

const SECRET = "w1-sec-gate-secret";

interface FakeRecord {
  id: string;
  userId: string;
  expiresAt: Date;
}

function sessionDeps(role: string | null, record: FakeRecord | null | "default" = "default") {
  const rec: FakeRecord | null =
    record === "default"
      ? { id: "sess-1", userId: "user-1", expiresAt: new Date(Date.now() + 3600_000) }
      : record;
  return {
    verifyToken: async (token: string | null | undefined) =>
      token === "valid.token" && rec
        ? { userId: rec.userId, role: role ?? "student", sessionId: rec.id }
        : null,
    findSessionById: async (): Promise<FakeRecord | null> => rec,
    findUserRole: async (): Promise<{role: string, mcpAccess: boolean} | null> => role ? ({role, mcpAccess: false}) : null,
  };
}

function authedRequest(url: string, init?: RequestInit): Request {
  return new Request(url, {
    ...init,
    headers: { ...(init?.headers as Record<string, string> | undefined), host: "app.test" },
  });
}

describe("W1-SEC: DB-backed authorization gates", () => {
  it("requireAuth: 401 without a session cookie", async () => {
    const res = await requireAuth(undefined, {
      cookieHeader: null,
      ...sessionDeps("student"),
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.response.status).toBe(401);
  });

  it("getDbSession: null when the sessions row is gone (revoked)", async () => {
    const deps = sessionDeps("student");
    deps.findSessionById = async () => null;
    await expect(getDbSession("session_token=valid.token", deps)).resolves.toBeNull();
  });

  it("getDbSession: null for expired rows", async () => {
    const deps = sessionDeps("student", {
      id: "sess-1",
      userId: "user-1",
      expiresAt: new Date(Date.now() - 1000),
    });
    await expect(getDbSession("session_token=valid.token", deps)).resolves.toBeNull();
  });

  it("requireAdmin: allows admin, forbids student (fresh DB role wins)", async () => {
    const ok = await requireAdmin(undefined, {
      cookieHeader: "session_token=valid.token",
      ...sessionDeps("admin"),
    });
    expect(ok.ok).toBe(true);

    const denied = await requireAdmin(undefined, {
      cookieHeader: "session_token=valid.token",
      ...sessionDeps("student"),
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.response.status).toBe(403);
  });

  it("requireMentor: allows mentor, forbids student", async () => {
    const ok = await requireMentor(undefined, {
      cookieHeader: "session_token=valid.token",
      ...sessionDeps("mentor"),
    });
    expect(ok.ok).toBe(true);
    const denied = await requireMentor(undefined, {
      cookieHeader: "session_token=valid.token",
      ...sessionDeps("student"),
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.response.status).toBe(403);
  });

  it("CSRF: cross-origin POST is rejected, GET passes", async () => {
    const crossPost = authedRequest("https://app.test/api/admin/leads", {
      method: "POST",
      headers: { origin: "https://evil.test" },
    });
    const denied = await requireAdmin(crossPost, {
      cookieHeader: "session_token=valid.token",
      ...sessionDeps("admin"),
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.response.status).toBe(403);

    const crossGet = authedRequest("https://app.test/api/admin/leads", {
      headers: { origin: "https://evil.test" },
    });
    const allowed = await requireAdmin(crossGet, {
      cookieHeader: "session_token=valid.token",
      ...sessionDeps("admin"),
    });
    expect(allowed.ok).toBe(true);
  });

  it("real HMAC tokens flow through the gate", async () => {
    const token = await signSessionToken(
      { userId: "user-9", sessionId: "sess-9", role: "admin", expiresAt: Date.now() + 60000 },
      SECRET
    );
    const res = await requireAdmin(undefined, {
      cookieHeader: `session_token=${token}`,
      verifyToken: (t: string | null | undefined) =>
        import("@/lib/auth/session/token").then((m) => m.verifySessionToken(t, SECRET)),
      findSessionById: async () => ({
        id: "sess-9",
        userId: "user-9",
        expiresAt: new Date(Date.now() + 60000),
      }),
      findUserRole: async () => ({role: "admin", mcpAccess: true}),
    });
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.session.userId).toBe("user-9");
  });

});
