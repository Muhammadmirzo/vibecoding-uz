import { describe, expect, it, vi } from "vitest";
import { loginWithPassword } from "@/features/auth/server/password-auth.service";
import type { AuthSessionRepository } from "@/features/auth/server/auth-session.repository";
import type { AuthUser, AuthUserRepository } from "@/features/auth/server/auth-user.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    phone: "+998901234567",
    email: "test@example.com",
    passwordHash: "salt:hash",
    fullName: "Test User",
    avatarUrl: null,
    tgUserId: null,
    tgUsername: null,
    role: "student",
    mcpAccess: false, locale: "uz",
    lastLoginAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

interface CallLog {
  ensured: string[];
  sessions: { userId: string }[];
  touched: { userId: string; patch: Record<string, unknown> }[];
}

function makeRepos(user: AuthUser | null, log: CallLog): {
  users: AuthUserRepository;
  sessions: AuthSessionRepository;
} {
  return {
    users: {
      findByPhoneOrEmail: async () => user,
      findById: async () => user,
      findByPhone: async () => user,
      findByEmail: async () => user,
      findByTgId: async () => user,
      ensureProfileTx: async (_ex, userId) => {
        log.ensured.push(userId);
      },
      updateLoginFieldsTx: async (_ex, userId, patch) => {
        log.touched.push({ userId, patch: patch as Record<string, unknown> });
      },
      updateCredentialsTx: async () => {},
      insertAuthAuditTx: async () => {},
    },
    sessions: {
      createSession: async () => ({ id: "sess-1" }),
      createSessionTx: async (_ex, input) => {
        log.sessions.push({ userId: input.userId });
        return { id: "sess-1" };
      },
      deleteSession: async () => {},
    },
  };
}

const signer = { sign: async (payload: { sessionId: string }) => `token:${payload.sessionId}` };

describe("loginWithPassword", () => {
  it("returns the public user, token and expiry on success", async () => {
    const log: CallLog = { ensured: [], sessions: [], touched: [] };
    const { users, sessions } = makeRepos(makeUser(), log);
    const outcome = await loginWithPassword(
      users,
      sessions,
      { verify: async () => true },
      signer,
      { identity: " +998901234567 ", password: "secret123", ip: "1.2.3.4", userAgent: "vitest" },
    );
    expect(outcome.user).toMatchObject({ id: makeUser().id, phone: "+998901234567", role: "student" });
    expect(outcome.user).not.toHaveProperty("passwordHash");
    expect(outcome.token).toBe("token:sess-1");
    expect(outcome.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(log.ensured).toEqual([makeUser().id]);
    expect(log.sessions).toEqual([{ userId: makeUser().id }]);
    expect(log.touched).toHaveLength(1);
    expect(log.touched[0].patch).toHaveProperty("lastLoginAt");
  });

  it("rejects unknown users with 401 without verifying", async () => {
    const log: CallLog = { ensured: [], sessions: [], touched: [] };
    const { users, sessions } = makeRepos(null, log);
    const verify = vi.fn(async () => true);
    await expect(
      loginWithPassword(users, sessions, { verify }, signer, { identity: "+998900000000", password: "x" }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS", status: 401 });
    expect(verify).not.toHaveBeenCalled();
    expect(log.sessions).toHaveLength(0);
  });

  it("rejects passwordless accounts and wrong passwords with 401", async () => {
    const log: CallLog = { ensured: [], sessions: [], touched: [] };
    const noHash = makeRepos(makeUser({ passwordHash: null }), log);
    await expect(
      loginWithPassword(noHash.users, noHash.sessions, { verify: async () => true }, signer, {
        identity: "+998901234567",
        password: "x",
      }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS", status: 401 });

    const wrong = makeRepos(makeUser(), log);
    await expect(
      loginWithPassword(wrong.users, wrong.sessions, { verify: async () => false }, signer, {
        identity: "+998901234567",
        password: "wrong",
      }),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS", status: 401 });
    expect(log.sessions).toHaveLength(0);
  });
});
