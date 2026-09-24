import { withTransactionLock } from "@/db";
import { trackServerEvent } from "@/features/analytics/server/track";
import { ServiceError } from "@/lib/http/errors";
import type { TelegramAuthInput } from "@/lib/validations/telegram";
import type { DbExecutor } from "@/features/payments/server/payments.repository";
import type { AuthSessionRepository } from "./auth-session.repository";
import type { AuthUserRepository } from "./auth-user.repository";
import { toPublicUser, type PublicAuthUser, type SessionSigner } from "./password-auth.service";

export interface TelegramVerifier {
  verify(data: Record<string, string | number | undefined>, botToken: string): Promise<boolean>;
  isFresh(authDate: number | string): boolean;
}

export interface TelegramLoginInput extends TelegramAuthInput {
  ip?: string;
  userAgent?: string;
}

export interface TelegramLoginOutcome {
  user: PublicAuthUser;
  token: string;
  expiresAt: Date;
}

export interface PhoneLinkRequired {
  ok: false;
  reason: "phone_link_required";
  tgUserId: string;
  tgUsername: string | null;
  fullName: string;
}

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Telegram Widget login. users.phone is NOT NULL, so a Telegram identity
 * without a linked row can never be invented — the caller must link a
 * phone first (returned as data, not thrown, so the route keeps the
 * exact legacy 422 contract).
 */
export async function loginWithTelegram(
  users: AuthUserRepository,
  sessionsRepo: AuthSessionRepository,
  verifier: TelegramVerifier,
  signer: SessionSigner,
  botToken: string | null | undefined,
  input: TelegramLoginInput,
): Promise<{ ok: true; outcome: TelegramLoginOutcome } | PhoneLinkRequired> {
  if (!botToken) {
    throw new ServiceError("PROVIDER_UNAVAILABLE", "Xizmat vaqtincha ishlamayapti", 500);
  }
  const authData: Record<string, string | number | undefined> = {
    id: input.id,
    first_name: input.first_name,
    ...(input.last_name ? { last_name: input.last_name } : {}),
    ...(input.username ? { username: input.username } : {}),
    ...(input.photo_url ? { photo_url: input.photo_url } : {}),
    auth_date: input.auth_date,
    hash: input.hash,
  };
  const valid = await verifier.verify(authData, botToken);
  if (!valid) {
    throw new ServiceError("INVALID_SIGNATURE", "Telegram tasdiqlashdan o'tmadi", 401);
  }
  if (!verifier.isFresh(input.auth_date)) {
    throw new ServiceError("STALE_AUTH_DATA", "Telegram ma'lumoti eskirgan", 401);
  }

  const tgId = String(input.id);
  const tgUsername = input.username ?? null;
  const fullName = [input.first_name, input.last_name].filter(Boolean).join(" ").slice(0, 200);
  const avatarUrl = input.photo_url ?? null;

  const user = await users.findByTgId(tgId);
  if (!user) {
    return { ok: false, reason: "phone_link_required", tgUserId: tgId, tgUsername, fullName };
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const sessionId = await withTransactionLock(`telegram-login:${user.id}`, async (tx) => {
    const ex = tx as DbExecutor | null | undefined;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Ma'lumotlar bazasi tranzaksiyasi mavjud emas", 503);
    await users.updateLoginFieldsTx(ex, user.id, {
      tgUsername: tgUsername ?? user.tgUsername,
      avatarUrl: avatarUrl ?? user.avatarUrl,
      lastLoginAt: new Date(),
    });
    const session = await sessionsRepo.createSessionTx(ex, {
      userId: user.id,
      expiresAt,
      userAgent: input.userAgent,
      ip: input.ip,
    });
    return session?.id ?? user.id;
  });

  void trackServerEvent({ type: "login", userId: user.id, path: "/api/auth/telegram", props: { method: "telegram" } });

  const token = await signer.sign({
    sessionId,
    userId: user.id,
    role: user.role,
    expiresAt: expiresAt.getTime(),
  });
  return {
    ok: true,
    outcome: {
      user: { ...toPublicUser(user), avatarUrl: avatarUrl ?? user.avatarUrl },
      token,
      expiresAt,
    },
  };
}
