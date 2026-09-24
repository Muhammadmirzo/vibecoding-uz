import { describe, expect, it, vi } from "vitest";
import { loginWithTelegram } from "@/features/auth/server/telegram-auth.service";
import type { AuthSessionRepository } from "@/features/auth/server/auth-session.repository";
import type { AuthUser, AuthUserRepository } from "@/features/auth/server/auth-user.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    phone: "+998907654321",
    email: null,
    passwordHash: null,
    fullName: "Old Name",
    avatarUrl: "https://old.avatar/x.png",
    tgUserId: "12345",
    tgUsername: "old_nick",
    role: "student",
    locale: "uz",
    lastLoginAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeRepos(user: AuthUser | null): {
  users: AuthUserRepository;
  sessions: AuthSessionRepository;
  patches: Record<string, unknown>[];
} {
  const patches: Record<string, unknown>[] = [];
  return {
    users: {
      findByPhoneOrEmail: async () => user,
      findById: async () => user,
      findByPhone: async () => user,
      findByEmail: async () => user,
      findByTgId: async () => user,
      ensureProfileTx: async () => {},
      updateLoginFieldsTx: async (_ex, _id, patch) => {
        patches.push(patch as Record<string, unknown>);
      },
      updateCredentialsTx: async () => {},
      insertAuthAuditTx: async () => {},
    },
    sessions: {
      createSession: async () => ({ id: "sess-tg" }),
      createSessionTx: async () => ({ id: "sess-tg" }),
      deleteSession: async () => {},
    },
    patches,
  };
}

const signer = { sign: async (payload: { sessionId: string }) => `token:${payload.sessionId}` };
const freshVerifier = {
  verify: async () => true,
  isFresh: () => true,
};

const baseInput = {
  id: 12345,
  first_name: "Ali",
  last_name: "Valiyev",
  username: "ali_v",
  photo_url: "https://avatar/x.png",
  auth_date: Math.floor(Date.now() / 1000),
  hash: "deadbeef",
};

describe("loginWithTelegram", () => {
  it("updates telegram fields, creates a session and signs a token", async () => {
    const { users, sessions, patches } = makeRepos(makeUser());
    const result = await loginWithTelegram(users, sessions, freshVerifier, signer, "bot-token", {
      ...baseInput,
      ip: "9.9.9.9",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.outcome.user).toMatchObject({ id: makeUser().id, phone: "+998907654321" });
    expect(result.outcome.user.avatarUrl).toBe("https://avatar/x.png");
    expect(result.outcome.token).toBe("token:sess-tg");
    expect(patches).toHaveLength(1);
    expect(patches[0]).toMatchObject({ tgUsername: "ali_v", lastLoginAt: expect.any(Date) });
  });

  it("keeps stored username/avatar when the widget omits them", async () => {
    const { users, sessions, patches } = makeRepos(makeUser());
    const { id, first_name, auth_date, hash } = baseInput;
    const result = await loginWithTelegram(users, sessions, freshVerifier, signer, "bot-token", {
      id,
      first_name,
      auth_date,
      hash,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.outcome.user.avatarUrl).toBe("https://old.avatar/x.png");
    expect(patches[0]).toMatchObject({ tgUsername: "old_nick" });
  });

  it("returns phone_link_required data for unknown telegram ids", async () => {
    const { users, sessions } = makeRepos(null);
    const result = await loginWithTelegram(users, sessions, freshVerifier, signer, "bot-token", baseInput);
    expect(result).toEqual({
      ok: false,
      reason: "phone_link_required",
      tgUserId: "12345",
      tgUsername: "ali_v",
      fullName: "Ali Valiyev",
    });
  });

  it("fails closed without a bot token, and rejects bad hashes and stale dates", async () => {
    const { users, sessions } = makeRepos(makeUser());
    await expect(
      loginWithTelegram(users, sessions, freshVerifier, signer, null, baseInput),
    ).rejects.toMatchObject({ status: 500 });
    await expect(
      loginWithTelegram(users, sessions, { ...freshVerifier, verify: async () => false }, signer, "t", baseInput),
    ).rejects.toMatchObject({ code: "INVALID_SIGNATURE", status: 401 });
    await expect(
      loginWithTelegram(users, sessions, { ...freshVerifier, isFresh: () => false }, signer, "t", baseInput),
    ).rejects.toMatchObject({ code: "STALE_AUTH_DATA", status: 401 });
    const verify = vi.fn(async () => true);
    await expect(
      loginWithTelegram(users, sessions, { verify, isFresh: () => true }, signer, "t", baseInput),
    ).resolves.toMatchObject({ ok: true });
    expect(verify).toHaveBeenCalledTimes(1);
  });
});
