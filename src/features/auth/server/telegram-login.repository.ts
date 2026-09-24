import { and, desc, eq, gt, isNotNull, isNull, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, telegramLoginRequests, userProfiles, users } from "@/db/schema";
import type { DbExecutor } from "@/features/payments/server/payments.repository";
import type { AuthUser } from "./auth-user.repository";

export type TelegramLoginRequest = typeof telegramLoginRequests.$inferSelect;

export interface TelegramContactInput {
  tgUserId: string;
  tgUsername?: string | null;
  fullName: string;
  phone: string;
}

export interface TelegramLoginRequestRepository {
  create(input: { nonceHash: string; expiresAt: Date; ip?: string; userAgent?: string }): Promise<{ id: string; nonceHash: string }>;
  findById(id: string): Promise<TelegramLoginRequest | null>;
  bindTelegramUser(nonceHash: string, tgUserId: string): Promise<TelegramLoginRequest | null>;
  approveBoundTx(ex: DbExecutor, id: string, tgUserId: string, userId: string): Promise<boolean>;
  confirmBoundTx(ex: DbExecutor, id: string, tgUserId: string): Promise<boolean>;
  rejectBoundTx(ex: DbExecutor, id: string, tgUserId: string): Promise<boolean>;
  markConsumedTx(ex: DbExecutor, id: string): Promise<boolean>;
  findNewestPendingByTelegramIdTx(ex: DbExecutor, tgUserId: string): Promise<TelegramLoginRequest | null>;
  findUserByPhoneTx(ex: DbExecutor, phone: string): Promise<AuthUser | null>;
  createTelegramUserTx(ex: DbExecutor, input: TelegramContactInput): Promise<AuthUser>;
  ensureProfileTx(ex: DbExecutor, userId: string): Promise<void>;
  insertTelegramSignupAuditTx(ex: DbExecutor, input: { userId: string; ip?: string }): Promise<void>;
  linkTelegramUserTx(ex: DbExecutor, userId: string, input: TelegramContactInput): Promise<AuthUser>;
}

export function isAvailable(row: TelegramLoginRequest | null, now = new Date()): row is TelegramLoginRequest {
  return Boolean(row && row.status === "pending" && row.expiresAt > now);
}

export const drizzleTelegramLoginRequestRepository: TelegramLoginRequestRepository = {
  async create(input) {
    const [row] = await db
      .insert(telegramLoginRequests)
      .values(input)
      .returning({ id: telegramLoginRequests.id, nonceHash: telegramLoginRequests.nonceHash });
    if (!row) throw new Error("Telegram login request could not be created");
    return row;
  },
  async findById(id) {
    const [row] = await db
      .select()
      .from(telegramLoginRequests)
      .where(eq(telegramLoginRequests.id, id))
      .limit(1);
    return row ?? null;
  },
  async bindTelegramUser(nonceHash, tgUserId) {
    const [row] = await db
      .update(telegramLoginRequests)
      .set({ tgUserId })
      .where(and(
        eq(telegramLoginRequests.nonceHash, nonceHash),
        eq(telegramLoginRequests.status, "pending"),
        or(isNull(telegramLoginRequests.tgUserId), eq(telegramLoginRequests.tgUserId, tgUserId)),
        gt(telegramLoginRequests.expiresAt, new Date()),
      ))
      .returning();
    return row ?? null;
  },
  async confirmBoundTx(ex, id, tgUserId) {
    const [row] = await ex
      .update(telegramLoginRequests)
      .set({ status: "approved", approvedAt: new Date() })
      .where(and(
        eq(telegramLoginRequests.id, id),
        eq(telegramLoginRequests.tgUserId, tgUserId),
        eq(telegramLoginRequests.status, "pending"),
        isNotNull(telegramLoginRequests.userId),
        gt(telegramLoginRequests.expiresAt, new Date()),
      ))
      .returning({ id: telegramLoginRequests.id });
    return Boolean(row);
  },
  async rejectBoundTx(ex, id, tgUserId) {
    const [row] = await ex
      .update(telegramLoginRequests)
      .set({ status: "rejected" })
      .where(and(
        eq(telegramLoginRequests.id, id),
        eq(telegramLoginRequests.tgUserId, tgUserId),
        eq(telegramLoginRequests.status, "pending"),
        gt(telegramLoginRequests.expiresAt, new Date()),
      ))
      .returning({ id: telegramLoginRequests.id });
    return Boolean(row);
  },
  async markConsumedTx(ex, id) {
    const [row] = await ex
      .update(telegramLoginRequests)
      .set({ status: "consumed", consumedAt: new Date() })
      .where(and(
        eq(telegramLoginRequests.id, id),
        eq(telegramLoginRequests.status, "approved"),
        isNotNull(telegramLoginRequests.userId),
      ))
      .returning({ id: telegramLoginRequests.id });
    return Boolean(row);
  },
  async findNewestPendingByTelegramIdTx(ex, tgUserId) {
    const [row] = await ex
      .select()
      .from(telegramLoginRequests)
      .where(and(
        eq(telegramLoginRequests.tgUserId, tgUserId),
        eq(telegramLoginRequests.status, "pending"),
        gt(telegramLoginRequests.expiresAt, new Date()),
      ))
      .orderBy(desc(telegramLoginRequests.createdAt))
      .limit(1);
    return row ?? null;
  },
  async findUserByPhoneTx(ex, phone) {
    const [row] = await ex.select().from(users).where(eq(users.phone, phone)).limit(1);
    return row ?? null;
  },
  async createTelegramUserTx(ex, input) {
    const [row] = await ex
      .insert(users)
      .values({
        phone: input.phone,
        fullName: input.fullName.trim().slice(0, 200) || "Telegram foydalanuvchisi",
        tgUserId: input.tgUserId,
        tgUsername: input.tgUsername ?? null,
        role: "student",
        lastLoginAt: new Date(),
      })
      .returning();
    if (!row) throw new Error("Telegram user creation failed");
    return row;
  },
  async ensureProfileTx(ex, userId) {
    await ex.insert(userProfiles).values({ userId, source: "telegram" }).onConflictDoNothing();
  },
  async insertTelegramSignupAuditTx(ex, input) {
    await ex.insert(auditLogs).values({
      userId: input.userId,
      action: "signup.telegram",
      entityType: "user",
      entityId: input.userId,
      details: { source: "telegram" },
      ipAddress: input.ip ?? "telegram",
    });
  },
  async linkTelegramUserTx(ex, userId, input) {
    const [row] = await ex
      .update(users)
      .set({ tgUserId: input.tgUserId, tgUsername: input.tgUsername, lastLoginAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    if (!row) throw new Error("Telegram user linking failed");
    return row;
  },
  async approveBoundTx(ex, id, tgUserId, userId) {
    const [row] = await ex
      .update(telegramLoginRequests)
      .set({ userId })
      .where(and(
        eq(telegramLoginRequests.id, id),
        eq(telegramLoginRequests.tgUserId, tgUserId),
        eq(telegramLoginRequests.status, "pending"),
        sql`${telegramLoginRequests.expiresAt} > now()`,
      ))
      .returning({ id: telegramLoginRequests.id });
    return Boolean(row);
  },
};

export function publicTelegramRequestState(row: TelegramLoginRequest | null, now = new Date()): "pending" | "approved" | "rejected" | "expired" | "consumed" | "unknown" {
  if (!row) return "unknown";
  if (row.status === "approved" || row.status === "consumed" || row.status === "rejected") return row.status;
  if (row.status === "expired" || row.expiresAt <= now) return "expired";
  return "pending";
}
