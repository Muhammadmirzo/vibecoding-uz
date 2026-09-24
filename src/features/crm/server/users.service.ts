import { withTransactionLock } from "@/db";
import { hashPassword, normalizePhone } from "@/lib/auth/password";
import { ServiceError } from "@/lib/http/errors";
import type { CreateStaffInput, UpdateUserRoleInput, UsersAdminQuery } from "@/lib/validations";
import { paginate, type PageResult } from "../domain/pagination";
import type { DbExecutor, StaffRole, UserListItem, UserPublicRow, UsersRepository } from "./users.repository";

export async function listUsers(
  repo: UsersRepository,
  query: UsersAdminQuery,
): Promise<PageResult<UserListItem> & { users: UserListItem[] }> {
  const all = await repo.listUsers({ role: query.role, search: query.search });
  const page = paginate(all, query.page, query.limit);
  return { ...page, users: page.items };
}

export interface CreateStaffOutcome {
  user: UserPublicRow;
}

/**
 * Creates a staff user. The insert + audit log are wrapped in ONE
 * transaction so a failed audit never leaves an unaudited account.
 */
export async function createStaff(
  repo: UsersRepository,
  input: CreateStaffInput,
  opts: { ip: string },
): Promise<CreateStaffOutcome> {
  const normalized = normalizePhone(input.phone);
  const byPhone = await repo.findByPhone(normalized);
  if (byPhone) {
    throw new ServiceError("CONFLICT", "Ushbu telefon raqamli foydalanuvchi allaqachon mavjud", 409);
  }
  const email = input.email?.trim() ? input.email.trim() : null;
  if (email) {
    const byEmail = await repo.findByEmail(email);
    if (byEmail) {
      throw new ServiceError("CONFLICT", "Ushbu email adresi boshqa foydalanuvchi tomonidan ishlatilmoqda", 409);
    }
  }
  const passwordHash = await hashPassword(input.password);
  return withTransactionLock(`user-create:${normalized}`, async (tx) => {
    const ex = tx as DbExecutor;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Baza tranzaksiyasi mavjud emas", 503);
    const user = await repo.createUserTx(ex, {
      phone: normalized,
      fullName: input.fullName,
      email,
      passwordHash,
      role: input.role as StaffRole,
    });
    await repo.recordAuditTx(ex, {
      action: "user.create",
      entityType: "user",
      entityId: user.id,
      details: { fullName: user.fullName, phone: user.phone, role: user.role },
      ip: opts.ip,
    });
    return { user };
  });
}

export async function changeUserRole(
  repo: UsersRepository,
  id: string,
  input: UpdateUserRoleInput,
  opts: { ip: string },
): Promise<UserPublicRow> {
  return withTransactionLock(`user-role:${id}`, async (tx) => {
    const ex = tx as DbExecutor;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Baza tranzaksiyasi mavjud emas", 503);
    const updated = await repo.setRoleTx(ex, id, input.role as StaffRole);
    if (!updated) throw new ServiceError("NOT_FOUND", "Foydalanuvchi topilmadi", 404);
    await repo.recordAuditTx(ex, {
      action: "user.role_change",
      entityType: "user",
      entityId: updated.id,
      details: { userFullName: updated.fullName, userPhone: updated.phone, newRole: updated.role },
      ip: opts.ip,
    });
    return updated;
  });
}
