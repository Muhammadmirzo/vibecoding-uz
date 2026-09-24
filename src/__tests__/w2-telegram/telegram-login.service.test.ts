import { describe, expect, it, vi } from "vitest";
import { withTransactionLock } from "@/db";
import type { AuthUser } from "@/features/auth/server/auth-user.repository";
import type {
  TelegramLoginRequest,
  TelegramLoginRequestRepository,
} from "@/features/auth/server/telegram-login.repository";
import {
  approveTelegramLogin,
  beginTelegramLogin,
  getTelegramLoginStatus,
  hashTelegramLoginToken,
  startTelegramLogin,
  type TelegramLoginDependencies,
} from "@/features/auth/server/telegram-login.service";

const requestId = "11111111-1111-4111-8111-111111111111";
const token = "abcdefghijklmnopqrstuvwxyzABCDEFG";

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    phone: "+998901234567",
    email: null,
    passwordHash: null,
    fullName: "Ali Valiyev",
    avatarUrl: null,
    tgUserId: "555",
    tgUsername: "ali",
    role: "student",
    locale: "uz",
    lastLoginAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeRequest(overrides: Partial<TelegramLoginRequest> = {}): TelegramLoginRequest {
  return {
    id: requestId,
    nonceHash: hashTelegramLoginToken(token),
    status: "pending",
    userId: null,
    tgUserId: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    expiresAt: new Date(Date.now() + 60_000),
    approvedAt: null,
    consumedAt: null,
    ip: "127.0.0.1",
    userAgent: "vitest",
    ...overrides,
  };
}

function makeRepository(overrides: Partial<TelegramLoginRequestRepository> = {}): TelegramLoginRequestRepository {
  return {
    create: vi.fn(async () => ({ id: requestId, nonceHash: hashTelegramLoginToken(token) })),
    findById: vi.fn(async () => null),
    bindTelegramUser: vi.fn(async () => null),
    approve: vi.fn(async () => true),
    markConsumedTx: vi.fn(async () => true),
    findNewestPendingByTelegramIdTx: vi.fn(async () => null),
    findUserByPhoneTx: vi.fn(async () => null),
    createTelegramUserTx: vi.fn(async () => makeUser()),
    ensureProfileTx: vi.fn(async () => undefined),
    insertTelegramSignupAuditTx: vi.fn(async () => undefined),
    linkTelegramUserTx: vi.fn(async (_ex, _id) => makeUser()),
    approveBoundTx: vi.fn(async () => true),
    ...overrides,
  };
}

type TelegramTransaction = NonNullable<Parameters<Parameters<typeof withTransactionLock>[1]>[0]>;
const executor = {} as TelegramTransaction;
const transaction: TelegramLoginDependencies["transaction"] = async (_key, fn) => fn(executor);
const users: TelegramLoginDependencies["users"] = {
  findById: async () => makeUser(),
  findByTgId: async () => null,
};
const sessions: TelegramLoginDependencies["sessions"] = {
  createSessionTx: vi.fn(async () => ({ id: "session-1" })),
};
const signer = { sign: vi.fn(async (input: { sessionId: string }) => `signed:${input.sessionId}`) };

function deps(requests: TelegramLoginRequestRepository, overrides: Partial<TelegramLoginDependencies> = {}): Partial<TelegramLoginDependencies> {
  return { requests, users, sessions, transaction, ...overrides };
}

describe("Telegram deep-link service", () => {
  it("stores only a SHA-256 nonce and returns the deep-link token", async () => {
    const create = vi.fn(async (input: { nonceHash: string }) => ({ id: requestId, nonceHash: input.nonceHash }));
    const requests = makeRepository({ create });
    const result = await startTelegramLogin({ ip: "1.1.1.1" }, "naqsh_bot", deps(requests));

    expect(result.deepLink).toBe(`https://t.me/naqsh_bot?start=login_${result.token}`);
    expect(create.mock.calls[0]?.[0].nonceHash).toBe(hashTelegramLoginToken(result.token));
    expect(create.mock.calls[0]?.[0].nonceHash).not.toBe(result.token);
  });

  it("maps a start database outage to 503", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const requests = makeRepository({ create: vi.fn(async () => { throw new Error("db down"); }) });
    await expect(startTelegramLogin({}, "bot", deps(requests))).rejects.toMatchObject({ status: 503 });
    error.mockRestore();
  });

  it("binds /start to Telegram and prompts unlinked users for contact", async () => {
    const request = makeRequest();
    const bind = vi.fn(async () => ({ ...request, tgUserId: "555" }));
    const requests = makeRepository({ bindTelegramUser: bind });
    const result = await beginTelegramLogin(token, "555", deps(requests));

    expect(bind).toHaveBeenCalledWith(hashTelegramLoginToken(token), "555");
    expect(result).toEqual({ outcome: "contact_required" });
  });

  it("approves immediately when Telegram is already linked", async () => {
    const requests = makeRepository({
      bindTelegramUser: vi.fn(async () => makeRequest({ tgUserId: "555" })),
      approve: vi.fn(async () => true),
    });
    const result = await beginTelegramLogin(token, "555", deps(requests, {
      users: { findById: async () => makeUser(), findByTgId: async () => makeUser() },
    }));

    expect(result.outcome).toBe("approved");
    expect(requests.approve).toHaveBeenCalledWith(requestId, "555", makeUser().id);
  });

  it("rejects expired or replayed /start requests", async () => {
    const requests = makeRepository({ bindTelegramUser: vi.fn(async () => null) });
    await expect(beginTelegramLogin(token, "555", deps(requests))).rejects.toMatchObject({ status: 410 });
  });

  it("creates a new user, profile and signup audit in one contact transaction", async () => {
    const user = makeUser({ id: "33333333-3333-4333-8333-333333333333" });
    const requests = makeRepository({
      findNewestPendingByTelegramIdTx: vi.fn(async () => makeRequest({ tgUserId: "555" })),
      createTelegramUserTx: vi.fn(async () => user),
    });
    const result = await approveTelegramLogin({ tgUserId: "555", fullName: "Ali", phone: "901234567" }, deps(requests));

    expect(result.id).toBe(user.id);
    expect(requests.createTelegramUserTx).toHaveBeenCalledOnce();
    expect(requests.ensureProfileTx).toHaveBeenCalledWith(executor, user.id);
    expect(requests.insertTelegramSignupAuditTx).toHaveBeenCalledWith(executor, { userId: user.id, ip: "127.0.0.1" });
  });

  it("links an existing phone to the requesting Telegram user", async () => {
    const existing = makeUser({ tgUserId: null });
    const linked = makeUser();
    const requests = makeRepository({
      findNewestPendingByTelegramIdTx: vi.fn(async () => makeRequest({ tgUserId: "555" })),
      findUserByPhoneTx: vi.fn(async () => existing),
      linkTelegramUserTx: vi.fn(async () => linked),
    });
    await approveTelegramLogin({ tgUserId: "555", fullName: "Ali", phone: "+998901234567" }, deps(requests));
    expect(requests.linkTelegramUserTx).toHaveBeenCalledOnce();
    expect(requests.createTelegramUserTx).not.toHaveBeenCalled();
  });

  it("returns a clear conflict when the phone belongs to another Telegram user", async () => {
    const requests = makeRepository({
      findNewestPendingByTelegramIdTx: vi.fn(async () => makeRequest({ tgUserId: "555" })),
      findUserByPhoneTx: vi.fn(async () => makeUser({ tgUserId: "999" })),
    });
    await expect(approveTelegramLogin({ tgUserId: "555", fullName: "Ali", phone: "901234567" }, deps(requests)))
      .rejects.toMatchObject({ code: "CONFLICT", status: 409 });
  });

  it("rejects contact when no pending unexpired request is bound to the Telegram user", async () => {
    const requests = makeRepository({ findNewestPendingByTelegramIdTx: vi.fn(async () => null) });
    await expect(approveTelegramLogin({ tgUserId: "555", fullName: "Ali", phone: "901234567" }, deps(requests)))
      .rejects.toMatchObject({ code: "INVALID_TOKEN", status: 410 });
  });

  it("rejects a wrong initiator cookie, expiry and consumed replay as unknown or terminal", async () => {
    const approved = makeRequest({ status: "approved", userId: makeUser().id });
    const pending = makeRequest();
    const expired = makeRequest({ expiresAt: new Date(Date.now() - 1_000) });
    const consumed = makeRequest({ status: "consumed", userId: makeUser().id });

    expect(await getTelegramLoginStatus(requestId, "wrong-token", signer, deps(makeRepository({ findById: async () => approved }))))
      .toEqual({ state: "unknown" });
    expect(await getTelegramLoginStatus(requestId, token, signer, deps(makeRepository({ findById: async () => expired }))))
      .toEqual({ state: "expired" });
    expect(await getTelegramLoginStatus(requestId, token, signer, deps(makeRepository({ findById: async () => consumed }))))
      .toEqual({ state: "consumed" });
    expect(await getTelegramLoginStatus(requestId, token, signer, deps(makeRepository({ findById: async () => pending }))))
      .toEqual({ state: "pending" });
  });

  it("atomically creates exactly one session under concurrent approved status calls", async () => {
    let available = true;
    const request = makeRequest({ status: "approved", userId: makeUser().id });
    const createSessionTx = vi.fn(async () => ({ id: "session-1" }));
    const markConsumedTx = vi.fn(async () => {
      if (!available) return false;
      available = false;
      return true;
    });
    let queue = Promise.resolve();
    const serializedTransaction: TelegramLoginDependencies["transaction"] = async (_key, fn) => {
      const previous = queue;
      let release: () => void = () => {};
      queue = new Promise<void>((resolve) => { release = resolve; });
      await previous;
      try { return await fn(executor); } finally { release(); }
    };
    const requests = makeRepository({ findById: async () => request, markConsumedTx });
    const result = await Promise.all([
      getTelegramLoginStatus(requestId, token, signer, deps(requests, { sessions: { createSessionTx }, transaction: serializedTransaction })),
      getTelegramLoginStatus(requestId, token, signer, deps(requests, { sessions: { createSessionTx }, transaction: serializedTransaction })),
    ]);

    expect(result.filter((item) => item.state === "approved")).toHaveLength(1);
    expect(result.filter((item) => item.state === "consumed")).toHaveLength(1);
    expect(createSessionTx).toHaveBeenCalledOnce();
    expect(signer.sign).toHaveBeenCalledOnce();
  });
});
