import { and, desc, eq, sql, type SQL } from "drizzle-orm";
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

export interface CreatePaymentInput {
  userId: string;
  enrollmentId: string;
  provider: PaymentProvider;
  amountSum: string;
  amountTiyin: number;
  meta: Record<string, unknown>;
}

export interface CreateRefundRequestInput {
  userId?: string;
  paymentId: string;
  enrollmentId: string | null;
  amountTiyin: number;
  reason?: string;
  idempotencyKey: string;
}

export interface UserPaymentRow {
  id: string;
  provider: string;
  providerTxnId: string | null;
  amountSum: string;
  status: string;
  paidAt: Date | null;
  receiptUrl: string | null;
  createdAt: Date;
  enrollmentId: string | null;
}

export interface PaymentsRepository {
  findPaymentById(id: string, provider: PaymentProvider): Promise<PaymentRecord | null>;
  findPaymentByIdTx(ex: DbExecutor, id: string, provider: PaymentProvider): Promise<PaymentRecord | null>;
  findByProviderTxnId(provider: PaymentProvider, providerTxnId: string): Promise<PaymentRecord | null>;
  findByProviderTxnIdTx(ex: DbExecutor, provider: PaymentProvider, providerTxnId: string): Promise<PaymentRecord | null>;
  findPendingByEnrollment(enrollmentId: string, provider: PaymentProvider): Promise<PaymentRecord | null>;
  findPendingByEnrollmentTx(ex: DbExecutor, enrollmentId: string, provider: PaymentProvider): Promise<PaymentRecord | null>;
  createPayment(input: CreatePaymentInput): Promise<PaymentRecord>;
  createPaymentTx(ex: DbExecutor, input: CreatePaymentInput): Promise<PaymentRecord>;
  setPaymentTx(ex: DbExecutor, id: string, patch: Partial<{ providerTxnId: string; status: PaymentStatus; paidAt: Date; meta: Record<string, unknown> }>): Promise<void>;
  findUserEnrollment(userId: string, enrollmentId: string): Promise<EnrollmentWithCohort | null>;
  findUserEnrollmentTx(ex: DbExecutor, userId: string, enrollmentId: string): Promise<EnrollmentWithCohort | null>;
  findActiveUserEnrollment(userId: string, cohortId: string): Promise<EnrollmentWithCohort | null>;
  findActiveUserEnrollmentTx(ex: DbExecutor, userId: string, cohortId: string): Promise<EnrollmentWithCohort | null>;
  findCohort(cohortId: string): Promise<EnrollmentWithCohort | null>;
  findCohortTx(ex: DbExecutor, cohortId: string): Promise<EnrollmentWithCohort | null>;
  createPendingEnrollment(userId: string, cohortId: string, source: string): Promise<{ id: string }>;
  createPendingEnrollmentTx(ex: DbExecutor, userId: string, cohortId: string, source: string): Promise<{ id: string }>;
  setEnrollmentStatusTx(ex: DbExecutor, enrollmentId: string, status: "active" | "paused" | "finished" | "expelled"): Promise<void>;
  countOtherPaidPaymentsTx(ex: DbExecutor, enrollmentId: string, excludePaymentId: string): Promise<number>;
  recordAudit(input: { userId?: string; action: string; entityType: string; entityId?: string; details: Record<string, unknown>; ip: string }): Promise<void>;
  findRefundByKey(idempotencyKey: string): Promise<typeof refundRequests.$inferSelect | null>;
  findRefundByKeyTx(ex: DbExecutor, idempotencyKey: string): Promise<typeof refundRequests.$inferSelect | null>;
  createRefundRequest(input: CreateRefundRequestInput): Promise<typeof refundRequests.$inferSelect>;
  createRefundRequestTx(ex: DbExecutor, input: CreateRefundRequestInput): Promise<typeof refundRequests.$inferSelect>;
  countCompletedModules(userId: string): Promise<number>;
}

async function findPendingByEnrollment(ex: DbExecutor, enrollmentId: string, provider: PaymentProvider): Promise<PaymentRecord | null> {
  const [row] = await ex.select().from(payments)
    .where(and(eq(payments.enrollmentId, enrollmentId), eq(payments.provider, provider), eq(payments.status, "pending")))
    .limit(1);
  return row ? toRecord(row) : null;
}

async function createPayment(ex: DbExecutor, input: CreatePaymentInput): Promise<PaymentRecord> {
  const [row] = await ex.insert(payments).values({
    userId: input.userId, enrollmentId: input.enrollmentId, provider: input.provider,
    amountSum: input.amountSum, amountTiyin: input.amountTiyin, status: "pending", meta: input.meta,
  }).returning();
  return toRecord(row);
}

async function findCohortRow(ex: DbExecutor, cohortId: string): Promise<EnrollmentWithCohort | null> {
  const [row] = await ex.select({
    cohortId: cohorts.id, priceSum: cohorts.priceSum,
    earlyPriceSum: cohorts.earlyPriceSum, earlyDeadline: cohorts.earlyDeadline,
  }).from(cohorts).where(eq(cohorts.id, cohortId)).limit(1);
  if (!row) return null;
  return {
    enrollmentId: "", userId: "", enrollmentStatus: "active", enrolledAt: new Date(),
    cohortId: row.cohortId, priceSum: row.priceSum,
    earlyPriceSum: row.earlyPriceSum, earlyDeadline: row.earlyDeadline,
  };
}

async function createPendingEnrollment(ex: DbExecutor, userId: string, cohortId: string, source: string): Promise<{ id: string }> {
  const [row] = await ex.insert(enrollments).values({ userId, cohortId, status: "active", source }).returning({ id: enrollments.id });
  return row;
}

async function findRefundByKey(ex: DbExecutor, idempotencyKey: string): Promise<typeof refundRequests.$inferSelect | null> {
  const [row] = await ex.select().from(refundRequests).where(eq(refundRequests.idempotencyKey, idempotencyKey)).limit(1);
  return row ?? null;
}

async function createRefundRequest(ex: DbExecutor, input: CreateRefundRequestInput): Promise<typeof refundRequests.$inferSelect> {
  const [row] = await ex.insert(refundRequests).values({
    userId: input.userId, paymentId: input.paymentId, enrollmentId: input.enrollmentId,
    amountTiyin: input.amountTiyin, reason: input.reason, status: "pending", idempotencyKey: input.idempotencyKey,
  }).returning();
  return row;
}

async function enrollmentWithCohort(ex: DbExecutor, where: SQL<unknown> | undefined): Promise<EnrollmentWithCohort | null> {
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
  findPendingByEnrollment: (enrollmentId, provider) => findPendingByEnrollment(db, enrollmentId, provider),
  findPendingByEnrollmentTx: (ex, enrollmentId, provider) => findPendingByEnrollment(ex, enrollmentId, provider),
  createPayment: (input) => createPayment(db, input),
  createPaymentTx: (ex, input) => createPayment(ex, input),
  async setPaymentTx(ex, id, patch) {
    await ex.update(payments).set(patch).where(eq(payments.id, id));
  },
  findUserEnrollment: (userId, enrollmentId) =>
    enrollmentWithCohort(db, and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, userId))),
  findUserEnrollmentTx: (ex, userId, enrollmentId) =>
    enrollmentWithCohort(ex, and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, userId))),
  findActiveUserEnrollment: (userId, cohortId) =>
    enrollmentWithCohort(db, and(eq(enrollments.userId, userId), eq(enrollments.cohortId, cohortId))),
  findActiveUserEnrollmentTx: (ex, userId, cohortId) =>
    enrollmentWithCohort(ex, and(eq(enrollments.userId, userId), eq(enrollments.cohortId, cohortId))),
  findCohort: (cohortId) => findCohortRow(db, cohortId),
  findCohortTx: (ex, cohortId) => findCohortRow(ex, cohortId),
  createPendingEnrollment: (userId, cohortId, source) => createPendingEnrollment(db, userId, cohortId, source),
  createPendingEnrollmentTx: (ex, userId, cohortId, source) => createPendingEnrollment(ex, userId, cohortId, source),
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
  findRefundByKey: (idempotencyKey) => findRefundByKey(db, idempotencyKey),
  findRefundByKeyTx: (ex, idempotencyKey) => findRefundByKey(ex, idempotencyKey),
  createRefundRequest: (input) => createRefundRequest(db, input),
  createRefundRequestTx: (ex, input) => createRefundRequest(ex, input),
  async countCompletedModules(userId) {
    const rows = await db.select({ lessonId: lessonProgress.lessonId }).from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), sql`${lessonProgress.completedAt} IS NOT NULL`));
    return new Set(rows.map((r) => r.lessonId)).size;
  },
};

/** Read-only payment history for the student cabinet (no tx needed). */
export async function listUserPayments(userId: string): Promise<UserPaymentRow[]> {
  return db.select({
    id: payments.id,
    provider: payments.provider,
    providerTxnId: payments.providerTxnId,
    amountSum: payments.amountSum,
    status: payments.status,
    paidAt: payments.paidAt,
    receiptUrl: payments.receiptUrl,
    createdAt: payments.createdAt,
    enrollmentId: payments.enrollmentId,
  }).from(payments)
    .where(eq(payments.userId, userId))
    .orderBy(desc(payments.createdAt));
}
