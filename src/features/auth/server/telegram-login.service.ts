import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { withTransactionLock } from "@/db";
import { ServiceError } from "@/lib/http/errors";
import { drizzleAuthSessionRepository } from "./auth-session.repository";
import { drizzleAuthUserRepository } from "./auth-user.repository";
import { drizzleTelegramLoginRequestRepository, publicTelegramRequestState } from "./telegram-login.repository";
import type { TelegramLoginRequestRepository } from "./telegram-login.repository";
import { toPublicUser, type PublicAuthUser, type SessionSigner } from "./password-auth.service";
import { auditLogs, userProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { DbExecutor } from "@/features/payments/server/payments.repository";

const REQUEST_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const pendingContacts = new Map<string, { token: string; expiresAt: number }>();

export function rememberTelegramLoginContact(tgUserId: string, token: string): void { pendingContacts.set(tgUserId, { token, expiresAt: Date.now() + REQUEST_TTL_MS }); }
export function takeTelegramLoginContact(tgUserId: string): string | null { const item = pendingContacts.get(tgUserId); pendingContacts.delete(tgUserId); return item && item.expiresAt > Date.now() ? item.token : null; }

export interface StartTelegramLoginResult { id: string; token: string; deepLink: string; expiresAt: Date }
export interface TelegramStatusResult { state: "pending" | "approved" | "expired" | "consumed" | "unknown"; user?: PublicAuthUser; token?: string; expiresAt?: Date }

export function hashTelegramLoginToken(token: string): string { return createHash("sha256").update(token).digest("hex"); }
function sameTokenHash(left: string, right: string): boolean { const a = Buffer.from(left); const b = Buffer.from(right); return a.length === b.length && timingSafeEqual(a, b); }
export function newTelegramLoginToken(): string { return randomBytes(24).toString("base64url"); }

export async function startTelegramLogin(input: { ip?: string; userAgent?: string }, botName: string): Promise<StartTelegramLoginResult> {
  const token = newTelegramLoginToken();
  const expiresAt = new Date(Date.now() + REQUEST_TTL_MS);
  try {
    const row = await drizzleTelegramLoginRequestRepository.create({ nonceHash: hashTelegramLoginToken(token), expiresAt, ip: input.ip, userAgent: input.userAgent });
    return { id: row.id, token, expiresAt, deepLink: `https://t.me/${botName}?start=login_${token}` };
  } catch (error) {
    console.error("[telegram-login] start failed", error);
    throw new ServiceError("PROVIDER_UNAVAILABLE", "Telegram orqali kirish vaqtincha ishlamayapti", 503);
  }
}

export async function getTelegramLoginStatus(id: string, cookieToken: string | null, signer: SessionSigner): Promise<TelegramStatusResult> {
  const row = await drizzleTelegramLoginRequestRepository.findById(id);
  if (!row || !cookieToken || !sameTokenHash(row.nonceHash, hashTelegramLoginToken(cookieToken))) return { state: "unknown" };
  const state = publicTelegramRequestState(row);
  if (state === "expired" || state === "consumed") return { state };
  if (state !== "approved") return { state: "pending" };
  const consumed = await drizzleTelegramLoginRequestRepository.markConsumed(id);
  if (!consumed) return { state: "consumed" };
  const user = await drizzleAuthUserRepository.findById(row.userId ?? "");
  if (!user) return { state: "consumed" };
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await withTransactionLock(`telegram-status:${id}`, async (tx) => {
    const ex = tx as DbExecutor | null | undefined;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Ma'lumotlar bazasi vaqtincha ishlamayapti", 503);
    const created = await drizzleAuthSessionRepository.createSessionTx(ex, { userId: user.id, expiresAt, ip: row.ip ?? undefined, userAgent: row.userAgent ?? undefined });
    return created?.id ?? user.id;
  });
  const token = await signer.sign({ sessionId: session, userId: user.id, role: user.role, expiresAt: expiresAt.getTime() });
  return { state: "approved", user: toPublicUser(user), token, expiresAt };
}

export interface ContactApprovalInput { token: string; tgUserId: string; tgUsername?: string | null; fullName: string; phone: string }

export async function approveAlreadyLinkedTelegramLogin(token: string, tgUserId: string): Promise<PublicAuthUser> {
  const request = await drizzleTelegramLoginRequestRepository.findByNonceHash(hashTelegramLoginToken(token));
  if (!request || publicTelegramRequestState(request) !== "pending") throw new ServiceError("INVALID_TOKEN", "Kirish havolasi eskirgan yoki allaqachon ishlatilgan", 410);
  const user = await drizzleAuthUserRepository.findByTgId(tgUserId);
  if (!user) throw new ServiceError("NOT_FOUND", "Telegram hisobingiz hali bog'lanmagan", 404);
  if (!(await drizzleTelegramLoginRequestRepository.approve(request.id, tgUserId, user.id))) throw new ServiceError("INVALID_TOKEN", "Kirish havolasi eskirgan yoki allaqachon ishlatilgan", 410);
  return toPublicUser(user);
}

export async function approveTelegramLogin(input: ContactApprovalInput): Promise<{ user: PublicAuthUser; requestId: string }> {
  const tokenHash = hashTelegramLoginToken(input.token);
  const request = await drizzleTelegramLoginRequestRepository.findByNonceHash(tokenHash);
  if (!request || publicTelegramRequestState(request) !== "pending") throw new ServiceError("INVALID_TOKEN", "Kirish havolasi eskirgan yoki allaqachon ishlatilgan", 410);
  const normalized = normalizePhone(input.phone);
  return withTransactionLock(`telegram-approve:${request.id}`, async (tx) => {
    const ex = tx as DbExecutor | null | undefined;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Ma'lumotlar bazasi vaqtincha ishlamayapti", 503);
    const [found] = await ex.select().from(users).where(eq(users.phone, normalized)).limit(1);
    let user = found;
    if (!user) {
      const [created] = await ex.insert(users).values({ phone: normalized, fullName: input.fullName.slice(0, 200) || "Telegram foydalanuvchisi", tgUserId: input.tgUserId, tgUsername: input.tgUsername ?? null, role: "student", lastLoginAt: new Date() }).returning();
      if (!created) throw new Error("User creation failed");
      user = created;
      await ex.insert(userProfiles).values({ userId: user.id }).onConflictDoNothing();
      await ex.insert(auditLogs).values({ userId: user.id, action: "signup.telegram", entityType: "user", entityId: user.id, details: { source: "telegram" }, ipAddress: request.ip ?? "telegram" });
    } else if (user.tgUserId && user.tgUserId !== input.tgUserId) {
      throw new ServiceError("CONFLICT", "Bu Telegram hisobi boshqa telefon bilan bog'langan", 409);
    } else {
      await ex.update(users).set({ tgUserId: input.tgUserId, tgUsername: input.tgUsername ?? user.tgUsername, lastLoginAt: new Date() }).where(eq(users.id, user.id));
    }
    const approved = await drizzleTelegramLoginRequestRepository.approveTx(ex, request.id, input.tgUserId, user.id);
    if (!approved) throw new ServiceError("INVALID_TOKEN", "Kirish havolasi eskirgan yoki allaqachon ishlatilgan", 410);
    return { user: toPublicUser(user), requestId: request.id };
  });
}

export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) cleaned = cleaned.startsWith("998") ? `+${cleaned}` : cleaned.length === 9 ? `+998${cleaned}` : cleaned;
  return cleaned;
}
