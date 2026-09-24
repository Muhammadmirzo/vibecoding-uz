import { describe, expect, it, vi } from "vitest";
import { usersAdminQuerySchema } from "@/lib/validations/crm";
import { changeUserRole, createStaff, listUsers } from "@/features/crm/server/users.service";
import type { UserListItem, UserPublicRow, UsersRepository } from "@/features/crm/server/users.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

function makePublic(overrides: Partial<UserPublicRow> = {}): UserPublicRow {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    phone: "+998901234567",
    email: null,
    fullName: "Staff Member",
    role: "admin",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeItem(overrides: Partial<UserListItem> = {}): UserListItem {
  return {
    id: "44444444-4444-4444-8444-444444444444",
    phone: "+998901234567",
    email: null,
    fullName: "Staff Member",
    avatarUrl: null,
    tgUsername: null,
    role: "admin",
    lastLoginAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    enrolledCount: 0,
    ...overrides,
  };
}

describe("users service", () => {
  function baseRepo(overrides: Partial<UsersRepository> = {}): UsersRepository {
    const fake: UsersRepository = {
      listUsers: async () => [],
      findByPhone: async () => null,
      findByEmail: async () => null,
      createUserTx: async (_ex, input) => makePublic({ phone: input.phone, fullName: input.fullName }),
      setRoleTx: async (_ex, id) => (id === "missing" ? null : makePublic({ id })),
      recordAuditTx: async () => undefined,
      ...overrides,
    };
    return fake;
  }

  it("rejects a duplicate phone with CONFLICT", async () => {
    const repo = baseRepo({ findByPhone: async () => ({ id: "existing" }) });
    await expect(
      createStaff(repo, { phone: "+998901234567", fullName: "Dup", password: "password123", role: "admin" }, { ip: "1.1.1.1" }),
    ).rejects.toMatchObject({ code: "CONFLICT", status: 409 });
  });

  it("rejects a duplicate email with CONFLICT", async () => {
    const repo = baseRepo({ findByEmail: async () => ({ id: "existing" }) });
    await expect(
      createStaff(
        repo,
        { phone: "+998909999999", fullName: "Dup", email: "dup@example.com", password: "password123", role: "manager" },
        { ip: "1.1.1.1" },
      ),
    ).rejects.toMatchObject({ code: "CONFLICT", status: 409 });
  });

  it("creates a staff user and writes an audit record in the same transaction", async () => {
    const audits: { action: string }[] = [];
    const seen: string[] = [];
    const repo = baseRepo({
      createUserTx: async (_ex, input) => {
        seen.push(input.phone);
        return makePublic({ phone: input.phone });
      },
    });
    // Re-wire audit capture: base helper keeps its own array, so wrap explicitly.
    const capturing: UsersRepository = {
      ...repo,
      recordAuditTx: async (_ex, input) => {
        audits.push({ action: input.action });
      },
    };
    const { user } = await createStaff(
      capturing,
      { phone: "+998 90 123 45 67", fullName: "New Staff", password: "password123", role: "mentor" },
      { ip: "1.1.1.1" },
    );
    expect(user.phone).toBe("+998901234567");
    expect(seen).toEqual(["+998901234567"]);
    expect(audits).toEqual([{ action: "user.create" }]);
  });

  it("changes a role with audit, and rejects missing users", async () => {
    const audits: { action: string }[] = [];
    const repo = baseRepo({ recordAuditTx: async (_ex, input) => { audits.push({ action: input.action }); } });
    const updated = await changeUserRole(repo, makePublic().id, { role: "mentor" }, { ip: "1.1.1.1" });
    expect(updated.id).toBe(makePublic().id);
    expect(audits).toEqual([{ action: "user.role_change" }]);
    await expect(changeUserRole(repo, "missing", { role: "mentor" }, { ip: "1.1.1.1" })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("paginates the user list", async () => {
    const items = Array.from({ length: 3 }, (_, i) => makeItem({ id: `u-${i}` }));
    const repo = baseRepo({ listUsers: async () => items });
    const page = await listUsers(repo, { search: undefined, role: "all", page: 1, limit: 2 });
    expect(page.users).toHaveLength(2);
    expect(page.total).toBe(3);
  });

  it("validates the users query (role default, coerced page)", () => {
    expect(usersAdminQuerySchema.parse({})).toMatchObject({ role: "all", page: 1, limit: 100 });
    expect(usersAdminQuerySchema.parse({ role: "mentor", page: "3" })).toMatchObject({ role: "mentor", page: 3 });
  });
});
