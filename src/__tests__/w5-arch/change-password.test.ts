import { describe, expect, it, vi } from "vitest";
import { changeCredentials } from "@/features/auth/server/change-password.service";
import type {
  AuthUser,
  AuthUserRepository,
  CredentialsPatch,
} from "@/features/auth/server/auth-user.repository";
import type { ChangePasswordInput } from "@/lib/validations/auth";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    phone: "+998901234567",
    email: "old@example.com",
    passwordHash: "salt:hash",
    fullName: "Test User",
    avatarUrl: null,
    tgUserId: null,
    tgUsername: null,
    role: "student",
    locale: "uz",
    lastLoginAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

interface State {
  users: Record<string, AuthUser>;
  updates: { userId: string; patch: CredentialsPatch }[];
  audits: { action: string; details: Record<string, unknown> }[];
}

function makeRepo(state: State): AuthUserRepository {
  return {
    findByPhoneOrEmail: async () => null,
    findById: async (id) => state.users[id] ?? null,
    findByPhone: async (phone) =>
      Object.values(state.users).find((u) => u.phone === phone) ?? null,
    findByEmail: async (email) =>
      Object.values(state.users).find((u) => u.email === email) ?? null,
    findByTgId: async () => null,
    ensureProfileTx: async () => {},
    updateLoginFieldsTx: async () => {},
    updateCredentialsTx: async (_ex, userId, patch) => {
      state.updates.push({ userId, patch });
    },
    insertAuthAuditTx: async (_ex, input) => {
      state.audits.push({ action: input.action, details: input.details });
    },
  };
}

const hasher = {
  hash: async (password: string) => `hashed:${password}`,
  verify: async (password: string, stored: string) => stored === `hashed:${password}` || (password === "old-pass" && stored === "salt:hash"),
};

function makeInput(overrides: Partial<ChangePasswordInput> = {}): ChangePasswordInput {
  return {
    oldPassword: "old-pass",
    newPassword: "brand-new-password",
    confirmPassword: "brand-new-password",
    ...overrides,
  };
}

describe("changeCredentials", () => {
  it("updates password-only and writes the audit row", async () => {
    const state: State = { users: { [makeUser().id]: makeUser() }, updates: [], audits: [] };
    const outcome = await changeCredentials(makeRepo(state), hasher, makeUser().id, makeInput(), "1.2.3.4");
    expect(outcome).toEqual({ passwordUpdated: true, phoneUpdated: false, emailUpdated: false });
    expect(state.updates).toHaveLength(1);
    expect(state.updates[0].patch).toMatchObject({ passwordHash: "hashed:brand-new-password" });
    expect(state.audits).toEqual([
      {
        action: "auth.change_password",
        details: expect.objectContaining({ passwordUpdated: true, userId: makeUser().id }),
      },
    ]);
  });

  it("updates phone and email when they change and are free", async () => {
    const state: State = { users: { [makeUser().id]: makeUser() }, updates: [], audits: [] };
    const outcome = await changeCredentials(
      makeRepo(state),
      hasher,
      makeUser().id,
      makeInput({ phone: "+998907654321", email: "new@example.com" }),
      "1.2.3.4",
    );
    expect(outcome).toEqual({ passwordUpdated: true, phoneUpdated: true, emailUpdated: true });
    expect(state.updates[0].patch).toMatchObject({ phone: "+998907654321", email: "new@example.com" });
  });

  it("skips unchanged phone/email without uniqueness checks", async () => {
    const state: State = { users: { [makeUser().id]: makeUser() }, updates: [], audits: [] };
    await changeCredentials(
      makeRepo(state),
      hasher,
      makeUser().id,
      makeInput({ phone: "+998901234567", email: "old@example.com" }),
      "1.2.3.4",
    );
    expect(state.updates[0].patch).not.toHaveProperty("phone");
    expect(state.updates[0].patch).not.toHaveProperty("email");
  });

  it("rejects unknown users, wrong old passwords and taken contacts", async () => {
    const other = makeUser({ id: "other-id", phone: "+998900000001", email: "taken@example.com" });
    const state: State = { users: { [makeUser().id]: makeUser(), [other.id]: other }, updates: [], audits: [] };
    const repo = makeRepo(state);

    await expect(
      changeCredentials(repo, hasher, "missing-id", makeInput(), "1.2.3.4"),
    ).rejects.toMatchObject({ code: "NOT_FOUND", status: 404 });

    await expect(
      changeCredentials(repo, hasher, makeUser().id, makeInput({ oldPassword: "nope" }), "1.2.3.4"),
    ).rejects.toMatchObject({ code: "BAD_OLD_PASSWORD", status: 400 });

    await expect(
      changeCredentials(repo, hasher, makeUser().id, makeInput({ phone: "+998900000001" }), "1.2.3.4"),
    ).rejects.toMatchObject({ code: "PHONE_TAKEN", status: 400 });

    await expect(
      changeCredentials(repo, hasher, makeUser().id, makeInput({ email: "taken@example.com" }), "1.2.3.4"),
    ).rejects.toMatchObject({ code: "EMAIL_TAKEN", status: 400 });
    expect(state.updates).toHaveLength(0);
    expect(state.audits).toHaveLength(0);
  });

  it("skips old-password verification for passwordless accounts", async () => {
    const state: State = {
      users: { [makeUser().id]: makeUser({ passwordHash: null }) },
      updates: [],
      audits: [],
    };
    const verify = vi.fn(async () => false);
    const outcome = await changeCredentials(
      makeRepo(state),
      { hash: hasher.hash, verify },
      makeUser().id,
      makeInput(),
      "1.2.3.4",
    );
    expect(verify).not.toHaveBeenCalled();
    expect(outcome.passwordUpdated).toBe(true);
  });
});
