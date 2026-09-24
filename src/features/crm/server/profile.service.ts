import { withTransactionLock } from "@/db";
import { ServiceError } from "@/lib/http/errors";
import type { UpdateMyProfileInput } from "@/lib/validations/student";
import type { StudentChangePasswordInput } from "@/lib/validations/student";
import type { DbExecutor, MeRecord, ProfileFields, ProfileRepository, UserFields } from "./profile.repository";

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, storedHash: string): Promise<boolean>;
}

function splitProfileInput(input: UpdateMyProfileInput): { userPatch: UserFields; profilePatch: ProfileFields } {
  const userPatch: UserFields = {};
  if (input.fullName !== undefined) userPatch.fullName = input.fullName;
  if (input.email !== undefined) userPatch.email = input.email === "" ? null : input.email;
  if (input.avatarUrl !== undefined) userPatch.avatarUrl = input.avatarUrl === "" ? null : input.avatarUrl;

  const profilePatch: ProfileFields = {};
  if (input.city !== undefined) profilePatch.city = input.city;
  if (input.profession !== undefined) profilePatch.profession = input.profession;
  if (input.goal !== undefined) profilePatch.goal = input.goal;
  if (input.bio !== undefined) profilePatch.bio = input.bio;
  if (input.birthDate !== undefined) profilePatch.birthDate = input.birthDate ? new Date(input.birthDate) : null;
  return { userPatch, profilePatch };
}

/**
 * Updates users + user_profiles atomically. Single-write inputs still go
 * through the same path (one transaction, no partial writes ever).
 */
export async function updateMyProfile(
  repo: ProfileRepository,
  userId: string,
  input: UpdateMyProfileInput,
): Promise<MeRecord> {
  const { userPatch, profilePatch } = splitProfileInput(input);
  const touchesUsers = Object.keys(userPatch).length > 0;
  const touchesProfile = Object.keys(profilePatch).length > 0;

  await withTransactionLock(`profile:${userId}`, async (tx: DbExecutor | null | undefined) => {
    const ex = tx ?? null;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Ma'lumotlar bazasi tranzaksiyasi mavjud emas", 503);
    if (touchesUsers) await repo.updateUserFieldsTx(ex, userId, userPatch);
    if (touchesProfile) await repo.upsertProfileFieldsTx(ex, userId, profilePatch);
  });

  const updated = await repo.findMe(userId);
  if (!updated) throw new ServiceError("NOT_FOUND", "Foydalanuvchi topilmadi", 404);
  return updated;
}

/** Password change with identical semantics to the legacy route handler. */
export async function changeMyPassword(
  repo: ProfileRepository,
  hasher: PasswordHasher,
  userId: string,
  input: StudentChangePasswordInput,
): Promise<void> {
  const record = await repo.findPasswordHash(userId);
  if (!record) throw new ServiceError("NOT_FOUND", "Foydalanuvchi topilmadi", 404);
  if (record.passwordHash) {
    const valid = await hasher.verify(input.currentPassword, record.passwordHash);
    if (!valid) throw new ServiceError("BAD_PASSWORD", "Joriy parol noto'g'ri kiritildi", 400);
  }
  const nextHash = await hasher.hash(input.newPassword);
  await repo.setPasswordHash(userId, nextHash);
}
