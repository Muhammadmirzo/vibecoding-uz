import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, cohorts, enrollments, lessonProgress, payments, refundRequests } from "@/db/schema";
import type { PaymentProvider, PaymentStatus } from "../domain/policy";

export interface PaymentRecord {
  id: string;
  userId: string;
  enrollmentId: string | null;
  provider: PaymentProvider;
  providerTxnId: string | null;
  amountSum: string;
  amountTiyin: number;
  status: PaymentStatus;
  paidAt: Date | null;
  meta: Record<string, unknown>;
}

export interface EnrollmentWithCohort {
  enrollmentId: string;
  userId: string;
  enrollmentStatus: string;
  enrolledAt: Date;
  cohortId: string;
  priceSum: string;
  earlyPriceSum: string | null;
  earlyDeadline: Date | null;
}

export type DbExecutor = Pick<typeof db, "select" | "update" | "insert">;

function toRecord(row: typeof payments.$inferSelect): PaymentRecord {
  return {
    id: row.id,
    userId: row.userId,
    enrollmentId: row.enrollmentId,
    provider: row.provider as PaymentProvider,
    providerTxnId: row.providerTxnId,
    amountSum: row.amountSum,
    amountTiyin: row.amountTiyin ?? 0,
    status: row.status as PaymentStatus,
    paidAt: row.paidAt,
    meta: (row.meta ?? {}) as Record<string, unknown>,
  };
}

async function findPaymentById(ex: DbExecutor, id: string, provider: PaymentProvider): Promise<PaymentRecord | null> {
  const [row] = await ex.select().from(payments).where(and(eq(payments.id, id), eq(payments.provider, provider))).limit(1);
  return row ? toRecord(row) : null;
}

export interface PaymentsRepository {
  findPaymentById(id: string, provider: PaymentProvider): Promise<PaymentRecord | null>;
  findPaymentByIdTx(ex: DbExecutor, id: string, provider: PaymentProvider): Promise<PaymentRecord | null>;
  findByProviderTxnId(provider: PaymentProvider, providerTxnId: string): Promise<PaymentRecord | null>;
  findByProviderTxnIdTx(ex: DbExecutor, provider: PaymentProvider, providerTxnId: string): Promise<PaymentRecord | null>;
  findPendingByEnrollment(enrollmentId: string, provider: PaymentProvider): Promise<PaymentRecord | null>;
  createPayment(input: { userId: string; enrollmentId: string; provider: PaymentProvider; amountSum: string; amountTiyin: number; meta: Record<string, unknown> }): Promise<PaymentRecord>;
  setPaymentTx(ex: DbExecutor, id: string, patch: Partial<{ providerTxnId: string; status: PaymentStatus; paidAt: Date; meta: Record<string, unknown> }>): Promise<void>;
  findUserEnrollment(userId: string, enrollmentId: string): Promise<EnrollmentWithCohort | null>;
  findActiveUserEnrollment(userId: string, cohortId: string): Promise<EnrollmentWithCohort | null>;
  findCohort(cohortId: string): Promise<EnrollmentWithCohort | null>;
  createPendingEnrollment(userId: string, cohortId: string, source: string): Promise<{ id: string }>;
  setEnrollmentStatusTx(ex: DbExecutor, enrollmentId: string, status: "active" | "paused" | "finished" | "expelled"): Promise<void>;
  countOtherPaidPaymentsTx(ex: DbExecutor, enrollmentId: string, excludePaymentId: string): Promise<number>;
  recordAudit(input: { userId?: string; action: string; entityType: string; entityId?: string; details: Record<string, unknown>; ip: string }): Promise<void>;
  findRefundByKey(idempotencyKey: string): Promise<typeof refundRequests.$inferSelect | null>;
  createRefundRequest(input: { userId?: string; paymentId: string; enrollmentId: string | null; amountTiyin: number; reason?: string; idempotencyKey: string }): Promise<typeof refundRequests.$inferSelect>;
  countCompletedModules(userId: string): Promise<number>;
}

async function enrollmentWithCohort(ex: DbExecutor, where: ReturnType<typeof eq>): Promise<EnrollmentWithCohort | null> {
  const [row] = await ex
    .select({
      enrollmentId: enrollments.id, userId: enrollments.userId, enrollmentStatus: enrollments.status,
      enrolledAt: enrollments.enrolledAt, cohortId: cohorts.id, priceSum: cohorts.priceSum,
      earlyPriceSum: cohorts.earlyPriceSum, earlyDeadline: cohorts.earlyDeadline,
    })
    .from(enrollments)
    .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
    .where(where)
    .limit(1);
  return row ?? null;
}

export const drizzlePaymentsRepository: PaymentsRepository = {
  findPaymentById: (id, provider) => findPaymentById(db, id, provider),
  findPaymentByIdTx: (ex, id, provider) => findPaymentById(ex, id, provider),
  async findByProviderTxnId(provider, providerTxnId) {
    const [row] = await db.select().from(payments).where(and(eq(payments.provider, provider), eq(payments.providerTxnId, providerTxnId))).limit(1);
    return row ? toRecord(row) : null;
  },
  async findByProviderTxnIdTx(ex, provider, providerTxnId) {
    const [row] = await ex.select().from(payments).where(and(eq(payments.provider, provider), eq(payments.providerTxnId, providerTxnId))).limit(1);
    return row ? toRecord(row) : null;
  },
  async findPendingByEnrollment(enrollmentId, provider) {
    const [row] = await db.select().from(payments)
      .where(and(eq(payments.enrollmentId, enrollmentId), eq(payments.provider, provider), eq(payments.status, "pending")))
      .limit(1);
    return row ? toRecord(row) : null;
  },
  async createPayment(input) {
    const [row] = await db.insert(payments).values({
      userId: input.userId, enrollmentId: input.enrollmentId, provider: input.provider,
      amountSum: input.amountSum, amountTiyin: input.amountTiyin, status: "pending", meta: input.meta,
    }).returning();
    return toRecord(row);
  },
  async setPaymentTx(ex, id, patch) {
    await ex.update(payments).set(patch).where(eq(payments.id, id));
  },
  findUserEnrollment: (userId, enrollmentId) =>
    enrollmentWithCohort(db, and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, userId))),
  findActiveUserEnrollment: (userId, cohortId) =>
    enrollmentWithCohort(db, and(eq(enrollments.userId, userId), eq(enrollments.cohortId, cohortId))),
  findCohort: async (cohortId) => {
    const [row] = await db.select({
      cohortId: cohorts.id, priceSum: cohorts.priceSum,
      earlyPriceSum: cohorts.earlyPriceSum, earlyDeadline: cohorts.earlyDeadline,
    }).from(cohorts).where(eq(cohorts.id, cohortId)).limit(1);
    if (!row) return null;
    return {
      enrollmentId: "", userId: "", enrollmentStatus: "active", enrolledAt: new Date(),
      cohortId: row.cohortId, priceSum: row.priceSum,
      earlyPriceSum: row.earlyPriceSum, earlyDeadline: row.earlyDeadline,
    };
  },
  async createPendingEnrollment(userId, cohortId, source) {
    const [row] = await db.insert(enrollments).values({ userId, cohortId, status: "active", source }).returning({ id: enrollments.id });
    return row;
  },
  async setEnrollmentStatusTx(ex, enrollmentId, status) {
    await ex.update(enrollments).set({ status }).where(eq(enrollments.id, enrollmentId));
  },
  async countOtherPaidPaymentsTx(ex, enrollmentId, excludePaymentId) {
    const rows = await ex.select({ id: payments.id }).from(payments)
      .where(and(eq(payments.enrollmentId, enrollmentId), eq(payments.status, "paid"), sql`${payments.id} != ${excludePaymentId}`));
    return rows.length;
  },
  async recordAudit(input) {
    await db.insert(auditLogs).values({
      userId: input.userId, action: input.action, entityType: input.entityType,
      entityId: input.entityId, details: input.details, ipAddress: input.ip,
    });
  },
  async findRefundByKey(idempotencyKey) {
    const [row] = await db.select().from(refundRequests).where(eq(refundRequests.idempotencyKey, idempotencyKey)).limit(1);
    return row ?? null;
  },
  async createRefundRequest(input) {
    const [row] = await db.insert(refundRequests).values({
      userId: input.userId, paymentId: input.paymentId, enrollmentId: input.enrollmentId,
      amountTiyin: input.amountTiyin, reason: input.reason, status: "pending", idempotencyKey: input.idempotencyKey,
    }).returning();
    return row;
  },
  async countCompletedModules(userId) {
    const rows = await db.select({ lessonId: lessonProgress.lessonId }).from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), sql`${lessonProgress.completedAt} IS NOT NULL`));
    return new Set(rows.map((r) => r.lessonId)).size;
  },
};
