import { describe, expect, it, vi } from "vitest";
import { createCheckout } from "@/features/payments/server/checkout.service";
import { requestRefund } from "@/features/payments/server/refund.service";
import type {
  DbExecutor,
  EnrollmentWithCohort,
  PaymentRecord,
  PaymentsRepository,
} from "@/features/payments/server/payments.repository";
import type { refundRequests } from "@/db/schema";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

type RefundRow = typeof refundRequests.$inferSelect;

const ENROLLMENT_ID = "11111111-1111-4111-8111-111111111111";
const COHORT_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_ID = "33333333-3333-4333-8333-333333333333";

const enrollmentRow: EnrollmentWithCohort = {
  enrollmentId: ENROLLMENT_ID, userId: "user-1", enrollmentStatus: "active",
  enrolledAt: new Date(), cohortId: COHORT_ID,
  priceSum: "3000000.00", earlyPriceSum: null, earlyDeadline: null,
};

const pendingRow: PaymentRecord = {
  id: PAYMENT_ID, userId: "user-1", enrollmentId: ENROLLMENT_ID, provider: "payme",
  providerTxnId: null, amountSum: "3000000.00", amountTiyin: 300_000_000,
  status: "pending", paidAt: null, meta: {},
};

const paidRow: PaymentRecord = {
  ...pendingRow, status: "paid", providerTxnId: "txn-1", paidAt: new Date(),
};

const secrets = { paymeMerchantId: "merchant-id", paymeKey: "secret-key" };

function unexpectedCall(method: string): () => Promise<never> {
  return async () => {
    throw new Error(`unexpected repository call: ${method}`);
  };
}

function baseRepo(overrides: Partial<PaymentsRepository> = {}): PaymentsRepository {
  const base: PaymentsRepository = {
    findPaymentById: async () => null,
    findPaymentByIdTx: async () => null,
    findByProviderTxnId: async () => null,
    findByProviderTxnIdTx: async () => null,
    findPendingByEnrollment: async () => null,
    findPendingByEnrollmentTx: async () => null,
    createPayment: unexpectedCall("createPayment"),
    createPaymentTx: unexpectedCall("createPaymentTx"),
    setPaymentTx: async () => undefined,
    findUserEnrollment: async () => null,
    findUserEnrollmentTx: async () => null,
    findActiveUserEnrollment: async () => null,
    findActiveUserEnrollmentTx: async () => null,
    findCohort: async () => null,
    findCohortTx: async () => null,
    createPendingEnrollment: unexpectedCall("createPendingEnrollment"),
    createPendingEnrollmentTx: unexpectedCall("createPendingEnrollmentTx"),
    setEnrollmentStatusTx: async () => undefined,
    countOtherPaidPaymentsTx: async () => 0,
    recordAudit: async () => undefined,
    findRefundByKey: async () => null,
    findRefundByKeyTx: async () => null,
    createRefundRequest: unexpectedCall("createRefundRequest"),
    createRefundRequestTx: unexpectedCall("createRefundRequestTx"),
    countCompletedModules: async () => 0,
  };
  return { ...base, ...overrides };
}

describe("checkout tx-atomicity", () => {
  it("creates the payment through the passed transaction executor", async () => {
    const seen: DbExecutor[] = [];
    const repo = baseRepo({
      findUserEnrollment: async () => ({ ...enrollmentRow }),
      findPendingByEnrollmentTx: async (ex) => {
        seen.push(ex);
        return null;
      },
      createPaymentTx: async (ex, input) => {
        seen.push(ex);
        return { ...pendingRow, id: "pay-new", amountSum: input.amountSum, amountTiyin: input.amountTiyin };
      },
    });
    const outcome = await createCheckout(
      repo,
      { enrollmentId: ENROLLMENT_ID, provider: "payme", userId: "user-1" },
      secrets,
      new Date(),
    );
    expect(outcome).toMatchObject({ paymentId: "pay-new", amountTiyin: 300_000_000, reused: false });
    expect(seen.length).toBe(2);
    expect(seen[0]).toBe(seen[1]);
  });

  it("reuses the pending payment without creating a new one", async () => {
    const repo = baseRepo({
      findUserEnrollment: async () => ({ ...enrollmentRow }),
      findPendingByEnrollmentTx: async () => ({ ...pendingRow }),
    });
    const outcome = await createCheckout(
      repo,
      { enrollmentId: ENROLLMENT_ID, provider: "payme", userId: "user-1" },
      secrets,
      new Date(),
    );
    expect(outcome).toMatchObject({ paymentId: PAYMENT_ID, reused: true });
  });

  it("creates enrollment and payment through one executor on the cohort path", async () => {
    const seen: DbExecutor[] = [];
    const repo = baseRepo({
      findCohort: async () => ({ ...enrollmentRow, enrollmentId: "" }),
      findActiveUserEnrollment: async () => null,
      findActiveUserEnrollmentTx: async (ex) => {
        seen.push(ex);
        return null;
      },
      createPendingEnrollmentTx: async (ex, userId, cohortId) => {
        seen.push(ex);
        expect(userId).toBe("user-1");
        expect(cohortId).toBe(COHORT_ID);
        return { id: "enr-new" };
      },
      findPendingByEnrollmentTx: async (ex) => {
        seen.push(ex);
        return null;
      },
      createPaymentTx: async (ex, input) => {
        seen.push(ex);
        return { ...pendingRow, id: "pay-new", enrollmentId: input.enrollmentId };
      },
    });
    const outcome = await createCheckout(
      repo,
      { cohortId: COHORT_ID, provider: "payme", userId: "user-1" },
      secrets,
      new Date(),
    );
    expect(outcome).toMatchObject({ paymentId: "pay-new", reused: false });
    expect(seen.length).toBe(4);
    for (const ex of seen) expect(ex).toBe(seen[0]);
  });
});

describe("refund tx-atomicity", () => {
  function refundRepo(): { repo: PaymentsRepository; seen: DbExecutor[]; revoked: string[] } {
    const seen: DbExecutor[] = [];
    const revoked: string[] = [];
    const refunds = new Map<string, RefundRow>();
    const rowFor = (key: string): RefundRow | null => refunds.get(key) ?? null;
    const repo = baseRepo({
      findPaymentById: async (id, provider) =>
        provider === "payme" && id === PAYMENT_ID ? { ...paidRow } : null,
      findUserEnrollment: async () => ({ ...enrollmentRow }),
      countCompletedModules: async () => 1,
      findRefundByKey: async (key) => rowFor(key),
      findRefundByKeyTx: async (ex, key) => {
        seen.push(ex);
        return rowFor(key);
      },
      createRefundRequestTx: async (ex, input) => {
        seen.push(ex);
        const row: RefundRow = {
          id: `ref-${refunds.size + 1}`, userId: "user-1", paymentId: PAYMENT_ID,
          enrollmentId: ENROLLMENT_ID, amountTiyin: input.amountTiyin, reason: input.reason ?? null,
          status: "pending", idempotencyKey: input.idempotencyKey, createdAt: new Date(),
        };
        refunds.set(input.idempotencyKey, row);
        return row;
      },
      setEnrollmentStatusTx: async (ex, enrollmentId) => {
        seen.push(ex);
        revoked.push(enrollmentId);
      },
    });
    return { repo, seen, revoked };
  }

  it("records the refund and revokes access through one executor", async () => {
    const { repo, seen, revoked } = refundRepo();
    const outcome = await requestRefund(repo, { paymentId: PAYMENT_ID, userId: "user-1", idempotencyKey: "key-1" });
    expect(outcome).toMatchObject({ status: "pending", amountTiyin: 300_000_000, replay: false });
    expect(revoked).toEqual([ENROLLMENT_ID]);
    expect(seen.length).toBe(3);
    for (const ex of seen) expect(ex).toBe(seen[0]);
  });

  it("replays the same idempotency key without side effects", async () => {
    const { repo, revoked } = refundRepo();
    const first = await requestRefund(repo, { paymentId: PAYMENT_ID, userId: "user-1", idempotencyKey: "key-1" });
    const second = await requestRefund(repo, { paymentId: PAYMENT_ID, userId: "user-1", idempotencyKey: "key-1" });
    expect(first.refundId).toBe(second.refundId);
    expect(second.replay).toBe(true);
    expect(revoked.length).toBe(1);
  });
});
