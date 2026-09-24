import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { telegramLoginRequests, users } from "@/db/schema";
import type { DbExecutor } from "@/features/payments/server/payments.repository";

export type TelegramLoginRequest = typeof telegramLoginRequests.$inferSelect;

export interface TelegramLoginRequestRepository {
  create(input: { nonceHash: string; expiresAt: Date; ip?: string; userAgent?: string }): Promise<{ id: string; nonceHash: string }>;
  findById(id: string): Promise<TelegramLoginRequest | null>;
  findByNonceHash(hash: string): Promise<TelegramLoginRequest | null>;
  approve(id: string, tgUserId: string, userId: string): Promise<boolean>;
  approveTx(ex: DbExecutor, id: string, tgUserId: string, userId: string): Promise<boolean>;
  markConsumed(id: string): Promise<boolean>;
  updateExpiry(id: string): Promise<void>;
}

function isAvailable(row: TelegramLoginRequest | null, now: Date): row is TelegramLoginRequest {
  return Boolean(row && row.status === "pending" && row.expiresAt > now);
}

export const drizzleTelegramLoginRequestRepository: TelegramLoginRequestRepository = {
  async create(input) {
    const [row] = await db.insert(telegramLoginRequests).values(input).returning({ id: telegramLoginRequests.id, nonceHash: telegramLoginRequests.nonceHash });
    if (!row) throw new Error("Telegram login request could not be created");
    return row;
  },
  async findById(id) {
    const [row] = await db.select().from(telegramLoginRequests).where(eq(telegramLoginRequests.id, id)).limit(1);
    return row ?? null;
  },
  async findByNonceHash(nonceHash) {
    const [row] = await db.select().from(telegramLoginRequests).where(eq(telegramLoginRequests.nonceHash, nonceHash)).limit(1);
    return row ?? null;
  },
  async approve(id, tgUserId, userId) {
    const result = await db.update(telegramLoginRequests).set({ status: "approved", tgUserId, userId, approvedAt: new Date() }).where(and(eq(telegramLoginRequests.id, id), eq(telegramLoginRequests.status, "pending"), sql`${telegramLoginRequests.expiresAt} > now()`)).returning({ id: telegramLoginRequests.id });
    return result.length === 1;
  },
  async approveTx(ex, id, tgUserId, userId) {
    const result = await ex.update(telegramLoginRequests).set({ status: "approved", tgUserId, userId, approvedAt: new Date() }).where(and(eq(telegramLoginRequests.id, id), eq(telegramLoginRequests.status, "pending"), sql`${telegramLoginRequests.expiresAt} > now()`)).returning({ id: telegramLoginRequests.id });
    return result.length === 1;
  },
  async markConsumed(id) {
    const result = await db.update(telegramLoginRequests).set({ status: "consumed", consumedAt: new Date() }).where(and(eq(telegramLoginRequests.id, id), eq(telegramLoginRequests.status, "approved"))).returning({ id: telegramLoginRequests.id });
    return result.length === 1;
  },
  async updateExpiry(id) {
    await db.update(telegramLoginRequests).set({ status: "expired" }).where(and(eq(telegramLoginRequests.id, id), eq(telegramLoginRequests.status, "pending")));
  },
};

export function publicTelegramRequestState(row: TelegramLoginRequest | null, now = new Date()): "pending" | "approved" | "expired" | "consumed" | "unknown" {
  if (!row) return "unknown";
  if (row.status === "approved" || row.status === "consumed") return row.status;
  if (row.status === "expired" || row.expiresAt <= now) return "expired";
  return row.status as "pending" | "approved" | "expired" | "consumed";
}

export { isAvailable, users };
