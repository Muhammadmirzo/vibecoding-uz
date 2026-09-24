import { withTransactionLock } from "@/db";
import { normalizePhone } from "@/lib/auth/password";
import { ServiceError } from "@/lib/http/errors";
import type { ChangePasswordInput } from "@/lib/validations/auth";
import type { DbExecutor } from "@/features/payments/server/payments.repository";
import type { AuthUserRepository, CredentialsPatch } from "./auth-user.repository";

export interface CredentialsHasher {
  hash(password: string): Promise<string>;
  verify(password: string, storedHash: string): Promise<boolean>;
}

export interface ChangeCredentialsOutcome {
  passwordUpdated: boolean;
  phoneUpdated: boolean;
  emailUpdated: boolean;
}

/**
 * Self-service credential change. Uniqueness pre-checks run first; the
 * user update + audit row are applied in one advisory-locked transaction
 * so the audit trail can never diverge from the write.
 */
export async function changeCredentials(
  users: AuthUserRepository,
  hasher: CredentialsHasher,
  userId: string,
  input: ChangePasswordInput,
  ip: string,
): Promise<ChangeCredentialsOutcome> {
  const user = await users.findById(userId);
  if (!user) {
    throw new ServiceError("NOT_FOUND", "Foydalanuvchi topilmadi", 404);
  }
  if (user.passwordHash) {
    const matches = await hasher.verify(input.oldPassword, user.passwordHash);
    if (!matches) {
      throw new ServiceError("BAD_OLD_PASSWORD", "Eski parol noto'g'ri kiritildi", 400);
    }
  }

  const patch: CredentialsPatch = {};
  if (input.newPassword) {
    patch.passwordHash = await hasher.hash(input.newPassword);
  }
  if (input.phone) {
    const normalized = normalizePhone(input.phone);
    if (normalized !== user.phone) {
      const taken = await users.findByPhone(normalized);
      if (taken && taken.id !== user.id) {
        throw new ServiceError(
          "PHONE_TAKEN",
          "Ushbu telefon raqam boshqa foydalanuvchi tomonidan ishlatilmoqda",
          400,
        );
      }
      patch.phone = normalized;
    }
  }
  if (input.email !== undefined) {
    const formatted = input.email ? input.email.trim() : null;
    if (formatted !== user.email) {
      if (formatted) {
        const taken = await users.findByEmail(formatted);
        if (taken && taken.id !== user.id) {
          throw new ServiceError(
            "EMAIL_TAKEN",
            "Ushbu email adresi boshqa foydalanuvchi tomonidan ishlatilmoqda",
            400,
          );
        }
      }
      patch.email = formatted;
    }
  }

  const outcome: ChangeCredentialsOutcome = {
    passwordUpdated: patch.passwordHash !== undefined,
    phoneUpdated: patch.phone !== undefined,
    emailUpdated: patch.email !== undefined,
  };

  await withTransactionLock(`credentials:${user.id}`, async (tx) => {
    const ex = tx as DbExecutor | null | undefined;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Ma'lumotlar bazasi tranzaksiyasi mavjud emas", 503);
    if (Object.keys(patch).length > 0) {
      await users.updateCredentialsTx(ex, user.id, patch);
    }
    await users.insertAuthAuditTx(ex, {
      action: "auth.change_password",
      entityType: "user",
      entityId: user.id,
      details: {
        userId: user.id,
        passwordUpdated: outcome.passwordUpdated,
        phoneUpdated: outcome.phoneUpdated,
        emailUpdated: outcome.emailUpdated,
      },
      ip,
    });
  });
  return outcome;
}
