import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { withTransactionLock } from "@/db";
import { ServiceError } from "@/lib/http/errors";
import {
  telegramContactSchema,
  telegramLoginTokenSchema,
  telegramLoginCallbackSchema,
} from "@/lib/validations/auth";
import type { DbExecutor } from "@/features/payments/server/payments.repository";
import { drizzleAuthSessionRepository, type AuthSessionRepository } from "./auth-session.repository";
import { drizzleAuthUserRepository, type AuthUserRepository } from "./auth-user.repository";
import {
  drizzleTelegramLoginRequestRepository,
  publicTelegramRequestState,
  type TelegramContactInput,
  type TelegramLoginRequestRepository,
} from "./telegram-login.repository";
import { toPublicUser, type PublicAuthUser, type SessionSigner } from "./password-auth.service";

const REQUEST_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface TelegramLoginDependencies {
  requests: TelegramLoginRequestRepository;
  users: Pick<AuthUserRepository, "findById" | "findByTgId">;
  sessions: Pick<AuthSessionRepository, "createSessionTx">;
  transaction: typeof withTransactionLock;
}

const defaultDependencies: TelegramLoginDependencies = {
  requests: drizzleTelegramLoginRequestRepository,
  users: drizzleAuthUserRepository,
  sessions: drizzleAuthSessionRepository,
  transaction: withTransactionLock,
};

function dependencies(overrides?: Partial<TelegramLoginDependencies>): TelegramLoginDependencies {
  return overrides ? { ...defaultDependencies, ...overrides } : defaultDependencies;
}

export interface StartTelegramLoginResult {
  id: string;
  token: string;
  deepLink: string;
  expiresAt: Date;
}

export interface TelegramStatusResult {
  state: "pending" | "approved" | "rejected" | "expired" | "consumed" | "unknown";
  user?: PublicAuthUser;
  token?: string;
}

export function hashTelegramLoginToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sameTokenHash(expectedHash: string, token: string): boolean {
  const suppliedHash = Buffer.from(hashTelegramLoginToken(token));
  const expected = Buffer.from(expectedHash);
  return expected.length === suppliedHash.length && timingSafeEqual(expected, suppliedHash);
}

export function newTelegramLoginToken(): string {
  return randomBytes(24).toString("base64url");
}

export async function startTelegramLogin(
  input: { ip?: string; userAgent?: string },
  botName: string,
  overrides?: Partial<TelegramLoginDependencies>,
): Promise<StartTelegramLoginResult> {
  const token = newTelegramLoginToken();
  const expiresAt = new Date(Date.now() + REQUEST_TTL_MS);
  try {
    const row = await dependencies(overrides).requests.create({
      nonceHash: hashTelegramLoginToken(token),
      expiresAt,
      ip: input.ip,
      userAgent: input.userAgent,
    });
    return { id: row.id, token, expiresAt, deepLink: `https://t.me/${botName}?start=login_${token}` };
  } catch (error) {
    console.error("[telegram-login] start failed", error);
    throw new ServiceError("PROVIDER_UNAVAILABLE", "Telegram orqali kirish vaqtincha ishlamayapti", 503);
  }
}

export async function getTelegramLoginStatus(
  id: string,
  cookieToken: string | null,
  signer: SessionSigner,
  overrides?: Partial<TelegramLoginDependencies>,
): Promise<TelegramStatusResult> {
  const deps = dependencies(overrides);
  try {
    const row = await deps.requests.findById(id);
    if (!row || !cookieToken || !sameTokenHash(row.nonceHash, cookieToken)) return { state: "unknown" };
    const state = publicTelegramRequestState(row);
    if (state === "expired" || state === "consumed" || state === "rejected") return { state };
    if (state !== "approved" || !row.userId) return { state: "pending" };

    const user = await deps.users.findById(row.userId);
    if (!user) return { state: "consumed" };
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    return await deps.transaction(`telegram-status:${id}`, async (tx) => {
      const ex = tx as DbExecutor | null | undefined;
      if (!ex) throw new Error("Database transaction unavailable");
      if (!(await deps.requests.markConsumedTx(ex, id))) return { state: "consumed" as const };
      const session = await deps.sessions.createSessionTx(ex, {
        userId: user.id,
        expiresAt,
        ip: row.ip ?? undefined,
        userAgent: row.userAgent ?? undefined,
      });
      if (!session) throw new Error("Session creation failed");
      const token = await signer.sign({
        sessionId: session.id,
        userId: user.id,
        role: user.role,
        expiresAt: expiresAt.getTime(),
      });
      return { state: "approved" as const, user: toPublicUser(user), token };
    });
  } catch (error) {
    console.error("[telegram-login] status failed", error);
    throw new ServiceError("PROVIDER_UNAVAILABLE", "Ma'lumotlar bazasi vaqtincha ishlamayapti", 503);
  }
}

export type BeginTelegramLoginResult =
  | { outcome: "confirmation"; requestId: string; createdAt: Date; expiresAt: Date; userAgent?: string | null }
  | { outcome: "contact_required" };

export async function beginTelegramLogin(
  tokenInput: string,
  tgUserId: string,
  overrides?: Partial<TelegramLoginDependencies>,
): Promise<BeginTelegramLoginResult> {
  const token = telegramLoginTokenSchema.parse(tokenInput);
  const deps = dependencies(overrides);
  const request = await deps.requests.bindTelegramUser(hashTelegramLoginToken(token), tgUserId);
  if (!request) throw new ServiceError("INVALID_TOKEN", "Kirish havolasi eskirgan yoki allaqachon ishlatilgan", 410);

  const user = await deps.users.findByTgId(tgUserId);
  if (!user) return { outcome: "contact_required" };
  return { outcome: "confirmation", requestId: request.id, createdAt: request.createdAt, expiresAt: request.expiresAt, userAgent: request.userAgent };
}

export interface TelegramContactResult {
  user: PublicAuthUser;
  requestId: string;
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string | null;
}

export async function approveTelegramLogin(
  input: TelegramContactInput,
  overrides?: Partial<TelegramLoginDependencies>,
): Promise<TelegramContactResult> {
  const parsed = telegramContactSchema.safeParse(input);
  if (!parsed.success) throw new ServiceError("VALIDATION", "Telegram kontakt ma'lumotlari noto'g'ri", 400);
  const deps = dependencies(overrides);
  return deps.transaction(`telegram-contact:${parsed.data.tgUserId}`, async (tx) => {
    const ex = tx as DbExecutor | null | undefined;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Ma'lumotlar bazasi tranzaksiyasi mavjud emas", 503);
    const request = await deps.requests.findNewestPendingByTelegramIdTx(ex, parsed.data.tgUserId);
    if (!request) throw new ServiceError("INVALID_TOKEN", "Aktiv kirish so'rovi topilmadi. Saytdagi Telegram tugmasini qayta bosing.", 410);

    const found = await deps.requests.findUserByPhoneTx(ex, parsed.data.phone);
    if (found?.tgUserId && found.tgUserId !== parsed.data.tgUserId) {
      throw new ServiceError("CONFLICT", "Bu Telegram akkaunti boshqa telefon raqamiga bog'langan", 409);
    }

    let user = found;
    if (!user) {
      user = await deps.requests.createTelegramUserTx(ex, parsed.data);
      await deps.requests.ensureProfileTx(ex, user.id);
      await deps.requests.insertTelegramSignupAuditTx(ex, { userId: user.id, ip: request.ip ?? undefined });
    } else {
      user = await deps.requests.linkTelegramUserTx(ex, user.id, parsed.data);
    }
    if (!(await deps.requests.approveBoundTx(ex, request.id, parsed.data.tgUserId, user.id))) {
      throw new ServiceError("INVALID_TOKEN", "Kirish havolasi eskirgan yoki allaqachon ishlatilgan", 410);
    }
    return { user: toPublicUser(user), requestId: request.id, createdAt: request.createdAt, expiresAt: request.expiresAt, userAgent: request.userAgent };
  });
}

export type TelegramCallbackOutcome = "approved" | "rejected" | "invalid";

export async function handleTelegramLoginCallback(
  input: unknown,
  overrides?: Partial<TelegramLoginDependencies>,
): Promise<TelegramCallbackOutcome> {
  const parsed = telegramLoginCallbackSchema.safeParse(input);
  if (!parsed.success) return "invalid";
  const deps = dependencies(overrides);
  return deps.transaction(`telegram-confirm:${parsed.data.requestId}`, async (tx) => {
    const ex = tx as DbExecutor | null | undefined;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Ma'lumotlar bazasi tranzaksiyasi mavjud emas", 503);
    const changed = parsed.data.action === "y"
      ? await deps.requests.confirmBoundTx(ex, parsed.data.requestId, parsed.data.tgUserId)
      : await deps.requests.rejectBoundTx(ex, parsed.data.requestId, parsed.data.tgUserId);
    return parsed.data.action === "y" ? (changed ? "approved" : "invalid") : (changed ? "rejected" : "invalid");
  });
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("998")) return `+${cleaned}`;
  return cleaned.length === 9 ? `+998${cleaned}` : cleaned;
}
