import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { payments, referralPayouts, referrals, auditLogs } from "@/db/schema";
import { PAYOUT_STATUSES_COUNTED, earnedBonusTiyin, payoutBalanceTiyin } from "../domain/policy";

export interface ReferralBalance {
  earnedTiyin: number;
  reservedTiyin: number;
  balanceTiyin: number;
  referredPaidCount: number;
}

export interface ReferralsRepository {
  findPayoutByKey(idempotencyKey: string): Promise<typeof referralPayouts.$inferSelect | null>;
  createPayout(input: { userId: string; amountTiyin: number; payoutMethod: string; cardLast4: string | null; idempotencyKey: string }): Promise<typeof referralPayouts.$inferSelect>;
  loadBalance(userId: string): Promise<ReferralBalance>;
  attributeReferral(referrerUserId: string, referredUserId: string): Promise<void>;
  recordAudit(input: { userId?: string; action: string; entityType: string; entityId?: string; details: Record<string, unknown>; ip: string }): Promise<void>;
}

export const drizzleReferralsRepository: ReferralsRepository = {
  async findPayoutByKey(idempotencyKey) {
    const [row] = await db.select().from(referralPayouts).where(eq(referralPayouts.idempotencyKey, idempotencyKey)).limit(1);
    return row ?? null;
  },
  async createPayout(input) {
    const [row] = await db.insert(referralPayouts).values({
      userId: input.userId, amountTiyin: input.amountTiyin, payoutMethod: input.payoutMethod,
      cardLast4: input.cardLast4, status: "pending", idempotencyKey: input.idempotencyKey,
    }).returning();
    return row;
  },
  async loadBalance(userId) {
    const attributed = await db.select({ referredUserId: referrals.referredUserId })
      .from(referrals).where(eq(referrals.referrerUserId, userId));
    const referredIds = attributed.map((r) => r.referredUserId);
    let paidTiyin: number[] = [];
    if (referredIds.length > 0) {
      const paid = await db.select({ amountTiyin: payments.amountTiyin }).from(payments)
        .where(and(inArray(payments.userId, referredIds), eq(payments.status, "paid")));
      paidTiyin = paid.map((p) => p.amountTiyin ?? 0);
    }
    const { earnedBonusTiyin: earned, payoutBalanceTiyin: balance } = { earnedBonusTiyin, payoutBalanceTiyin };
    const earnedTiyin = earned(paidTiyin);
    const open = await db.select({ amountTiyin: referralPayouts.amountTiyin }).from(referralPayouts)
      .where(and(eq(referralPayouts.userId, userId), inArray(referralPayouts.status, [...PAYOUT_STATUSES_COUNTED])));
    const reserved = open.map((p) => p.amountTiyin);
    const reservedTiyin = reserved.reduce((s, t) => s + t, 0);
    return {
      earnedTiyin,
      reservedTiyin,
      balanceTiyin: balance(earnedTiyin, reserved),
      referredPaidCount: paidTiyin.length,
    };
  },
  async attributeReferral(referrerUserId, referredUserId) {
    await db.insert(referrals).values({ referrerUserId, referredUserId }).onConflictDoNothing();
  },
  async recordAudit(input) {
    await db.insert(auditLogs).values({
      userId: input.userId, action: input.action, entityType: input.entityType,
      entityId: input.entityId, details: input.details, ipAddress: input.ip,
    });
  },
};
