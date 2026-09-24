import { withTransactionLock } from "@/db";
import { normalizePhone } from "@/lib/auth/password";
import { ServiceError } from "@/lib/http/errors";
import type { DbExecutor } from "@/features/payments/server/payments.repository";
import type { AuthUser, AuthUserRepository } from "./auth-user.repository";
import type { AuthSessionRepository } from "./auth-session.repository";

export interface PasswordVerifier {
  verify(password: string, storedHash: string): Promise<boolean>;
}

export interface SessionSigner {
  sign(input: { sessionId: string; userId: string; role: string; expiresAt: number }): Promise<string>;
}

export interface LoginInput {
  /** Raw phone-or-email identity as submitted by the client. */
  identity: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export interface PublicAuthUser {
  id: string;
  phone: string;
  fullName: string;
  email: string | null;
  role: string;
  avatarUrl: string | null;
}

export interface LoginOutcome {
  user: PublicAuthUser;
  token: string;
  expiresAt: Date;
}

export function toPublicUser(user: AuthUser): PublicAuthUser {
  return {
    id: user.id,
    phone: user.phone,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Phone/email + password login. Profile-ensure, session insert and
 * last-login touch run inside one advisory-locked transaction so a
 * crash can never leave a session without a profile (or vice versa).
 */
export async function loginWithPassword(
  users: AuthUserRepository,
  sessionsRepo: AuthSessionRepository,
  auth: PasswordVerifier,
  signer: SessionSigner,
  input: LoginInput,
): Promise<LoginOutcome> {
  const trimmed = input.identity.trim();
  const normalizedPhone = normalizePhone(trimmed);
  const user = await users.findByPhoneOrEmail(normalizedPhone, trimmed.toLowerCase());

  if (!user || !user.passwordHash) {
    throw new ServiceError("INVALID_CREDENTIALS", "Telefon raqam, email yoki parol noto'g'ri", 401);
  }
  const valid = await auth.verify(input.password, user.passwordHash);
  if (!valid) {
    throw new ServiceError("INVALID_CREDENTIALS", "Telefon raqami, email yoki parol noto'g'ri", 401);
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const sessionId = await withTransactionLock(`login:${user.id}`, async (tx) => {
    const ex = tx as DbExecutor | null | undefined;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Ma'lumotlar bazasi tranzaksiyasi mavjud emas", 503);
    await users.ensureProfileTx(ex, user.id);
    const session = await sessionsRepo.createSessionTx(ex, {
      userId: user.id,
      expiresAt,
      userAgent: input.userAgent,
      ip: input.ip,
    });
    await users.updateLoginFieldsTx(ex, user.id, { lastLoginAt: new Date() });
    return session?.id ?? user.id;
  });

  const token = await signer.sign({
    sessionId,
    userId: user.id,
    role: user.role,
    expiresAt: expiresAt.getTime(),
  });
  return { user: toPublicUser(user), token, expiresAt };
}
