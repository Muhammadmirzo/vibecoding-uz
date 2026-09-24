import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { payments, referralPayouts, referrals, auditLogs, users } from "@/db/schema";
import { PAYOUT_STATUSES_COUNTED, earnedBonusTiyin, payoutBalanceTiyin } from "../domain/policy";
import { referralCodeSchema } from "../domain/referral-code";
import type { DbExecutor } from "@/features/payments/server/payments.repository";

export interface ReferralBalance {
  earnedTiyin: number;
  reservedTiyin: number;
  balanceTiyin: number;
  referredPaidCount: number;
}

export interface CreatePayoutInput {
  userId: string;
  amountTiyin: number;
  payoutMethod: string;
  cardLast4: string | null;
  idempotencyKey: string;
}

export interface ReferralsRepository {
  findPayoutByKey(idempotencyKey: string): Promise<typeof referralPayouts.$inferSelect | null>;
  findPayoutByKeyTx(ex: DbExecutor, idempotencyKey: string): Promise<typeof referralPayouts.$inferSelect | null>;
  createPayout(input: CreatePayoutInput): Promise<typeof referralPayouts.$inferSelect>;
  createPayoutTx(ex: DbExecutor, input: CreatePayoutInput): Promise<typeof referralPayouts.$inferSelect>;
  loadBalance(userId: string): Promise<ReferralBalance>;
  loadBalanceTx(ex: DbExecutor, userId: string): Promise<ReferralBalance>;
  attributeReferral(referrerUserId: string, referredUserId: string): Promise<void>;
  attributeReferralTx(ex: DbExecutor, referrerUserId: string, referredUserId: string): Promise<void>;
  resolveReferrerByCode(code: string): Promise<{ id: string } | null>;
  resolveReferrerByCodeTx(ex: DbExecutor, code: string): Promise<{ id: string } | null>;
  recordAudit(input: { userId?: string; action: string; entityType: string; entityId?: string; details: Record<string, unknown>; ip: string }): Promise<void>;
}

async function findPayoutByKey(ex: DbExecutor, idempotencyKey: string): Promise<typeof referralPayouts.$inferSelect | null> {
  const [row] = await ex.select().from(referralPayouts).where(eq(referralPayouts.idempotencyKey, idempotencyKey)).limit(1);
  return row ?? null;
}

async function createPayout(ex: DbExecutor, input: CreatePayoutInput): Promise<typeof referralPayouts.$inferSelect> {
  const [row] = await ex.insert(referralPayouts).values({
    userId: input.userId, amountTiyin: input.amountTiyin, payoutMethod: input.payoutMethod,
    cardLast4: input.cardLast4, status: "pending", idempotencyKey: input.idempotencyKey,
  }).returning();
  return row;
}

async function loadBalance(ex: DbExecutor, userId: string): Promise<ReferralBalance> {
  const attributed = await ex.select({ referredUserId: referrals.referredUserId })
    .from(referrals).where(eq(referrals.referrerUserId, userId));
  const referredIds = attributed.map((r) => r.referredUserId);
  let paidTiyin: number[] = [];
  if (referredIds.length > 0) {
    const paid = await ex.select({ amountTiyin: payments.amountTiyin }).from(payments)
      .where(and(inArray(payments.userId, referredIds), eq(payments.status, "paid")));
    paidTiyin = paid.map((p) => p.amountTiyin ?? 0);
  }
  const earnedTiyin = earnedBonusTiyin(paidTiyin);
  const open = await ex.select({ amountTiyin: referralPayouts.amountTiyin }).from(referralPayouts)
    .where(and(eq(referralPayouts.userId, userId), inArray(referralPayouts.status, [...PAYOUT_STATUSES_COUNTED])));
  const reserved = open.map((p) => p.amountTiyin);
  const reservedTiyin = reserved.reduce((s, t) => s + t, 0);
  return {
    earnedTiyin,
    reservedTiyin,
    balanceTiyin: payoutBalanceTiyin(earnedTiyin, reserved),
    referredPaidCount: paidTiyin.length,
  };
}

async function attributeReferral(ex: DbExecutor, referrerUserId: string, referredUserId: string): Promise<void> {
  await ex.insert(referrals).values({ referrerUserId, referredUserId }).onConflictDoNothing();
}

/**
 * Resolves a referral code to the referrer: the code is the referrer's
 * user UUID first 8 chars (uppercased). Invalid shapes return null
 * without hitting the database.
 */
async function resolveReferrerByCode(ex: DbExecutor, code: string): Promise<{ id: string } | null> {
  const parsed = referralCodeSchema.safeParse(code);
  if (!parsed.success) return null;
  const [row] = await ex.select({ id: users.id }).from(users)
    .where(sql`upper(substring(${users.id}::text from 1 for 8)) = ${parsed.data}`)
    .limit(1);
  return row ?? null;
}

export const drizzleReferralsRepository: ReferralsRepository = {
  findPayoutByKey: (idempotencyKey) => findPayoutByKey(db, idempotencyKey),
  findPayoutByKeyTx: (ex, idempotencyKey) => findPayoutByKey(ex, idempotencyKey),
  createPayout: (input) => createPayout(db, input),
  createPayoutTx: (ex, input) => createPayout(ex, input),
  loadBalance: (userId) => loadBalance(db, userId),
  loadBalanceTx: (ex, userId) => loadBalance(ex, userId),
  attributeReferral: (referrerUserId, referredUserId) => attributeReferral(db, referrerUserId, referredUserId),
  attributeReferralTx: (ex, referrerUserId, referredUserId) => attributeReferral(ex, referrerUserId, referredUserId),
  resolveReferrerByCode: (code) => resolveReferrerByCode(db, code),
  resolveReferrerByCodeTx: (ex, code) => resolveReferrerByCode(ex, code),
  async recordAudit(input) {
    await db.insert(auditLogs).values({
      userId: input.userId, action: input.action, entityType: input.entityType,
      entityId: input.entityId, details: input.details, ipAddress: input.ip,
    });
  },
};
