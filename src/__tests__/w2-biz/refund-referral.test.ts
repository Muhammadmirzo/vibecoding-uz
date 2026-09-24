import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestRefund, RefundError } from "@/features/payments/server/refund.service";
import { checkPayoutAmount, earnedBonusTiyin, payoutBalanceTiyin } from "@/features/referrals/domain/policy";
import { requestPayout, PayoutError } from "@/features/referrals/server/payout.service";
import type {
  DbExecutor,
  EnrollmentWithCohort,
  PaymentRecord,
  PaymentsRepository,
} from "@/features/payments/server/payments.repository";
import type { ReferralsRepository, CreatePayoutInput } from "@/features/referrals/server/referrals.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

const paymentRow: PaymentRecord = {
  id: "pay-1", userId: "user-1", enrollmentId: "enr-1", provider: "payme",
  providerTxnId: "txn-1", amountSum: "3000000.00", amountTiyin: 300_000_000,
  status: "paid", paidAt: new Date(), meta: {},
};

const enrollmentRow: EnrollmentWithCohort = {
  enrollmentId: "enr-1", userId: "user-1", enrollmentStatus: "active",
  enrolledAt: new Date(), cohortId: "cohort-1",
  priceSum: "3000000.00", earlyPriceSum: null, earlyDeadline: null,
};

function unexpectedCall(method: string): () => Promise<never> {
  return async () => {
    throw new Error(`unexpected repository call: ${method}`);
  };
}

describe("refund workflow service", () => {
  let refunds: Map<string, { id: string; status: "pending"; amountTiyin: number }>;
  let revoked: string[];
  const repo = (overrides: Partial<PaymentsRepository> = {}): PaymentsRepository => {
    const base: PaymentsRepository = {
      findPaymentById: async (id) => (id === "pay-1" ? { ...paymentRow } : null),
      findPaymentByIdTx: async () => null,
      findByProviderTxnId: unexpectedCall("findByProviderTxnId"),
      findByProviderTxnIdTx: unexpectedCall("findByProviderTxnIdTx"),
      findPendingByEnrollment: async () => null,
      findPendingByEnrollmentTx: async () => null,
      createPayment: unexpectedCall("createPayment"),
      createPaymentTx: unexpectedCall("createPaymentTx"),
      setPaymentTx: async () => undefined,
      findUserEnrollment: async () => ({ ...enrollmentRow }),
      findUserEnrollmentTx: async () => ({ ...enrollmentRow }),
      findActiveUserEnrollment: async () => null,
      findActiveUserEnrollmentTx: async () => null,
      findCohort: async () => null,
      findCohortTx: async () => null,
      createPendingEnrollment: unexpectedCall("createPendingEnrollment"),
      createPendingEnrollmentTx: unexpectedCall("createPendingEnrollmentTx"),
      setEnrollmentStatusTx: async (_ex: DbExecutor, enrollmentId: string) => {
        revoked.push(enrollmentId);
      },
      countOtherPaidPaymentsTx: async () => 0,
      recordAudit: async () => undefined,
      findRefundByKey: async (key) => {
        const found = refunds.get(key);
        return found
          ? {
              ...found, userId: "user-1", paymentId: "pay-1", enrollmentId: "enr-1",
              reason: null, idempotencyKey: key, createdAt: new Date(),
            }
          : null;
      },
      findRefundByKeyTx: async (_ex: DbExecutor, key) => {
        const found = refunds.get(key);
        return found
          ? {
              ...found, userId: "user-1", paymentId: "pay-1", enrollmentId: "enr-1",
              reason: null, idempotencyKey: key, createdAt: new Date(),
            }
          : null;
      },
      createRefundRequest: async (input) => {
        const row = { id: `ref-${refunds.size + 1}`, status: "pending" as const, amountTiyin: input.amountTiyin };
        refunds.set(input.idempotencyKey, row);
        return {
          ...row, userId: "user-1", paymentId: "pay-1", enrollmentId: "enr-1",
          reason: null, idempotencyKey: input.idempotencyKey, createdAt: new Date(),
        };
      },
      createRefundRequestTx: async (_ex: DbExecutor, input) => {
        const row = { id: `ref-${refunds.size + 1}`, status: "pending" as const, amountTiyin: input.amountTiyin };
        refunds.set(input.idempotencyKey, row);
        return {
          ...row, userId: "user-1", paymentId: "pay-1", enrollmentId: "enr-1",
          reason: null, idempotencyKey: input.idempotencyKey, createdAt: new Date(),
        };
      },
      countCompletedModules: async () => 1,
    };
    return { ...base, ...overrides };
  };

  beforeEach(() => {
    refunds = new Map();
    revoked = [];
  });

  it("records a refund request and revokes access when eligible", async () => {
    const outcome = await requestRefund(repo(), { paymentId: "pay-1", userId: "user-1", idempotencyKey: "key-1" });
    expect(outcome).toMatchObject({ status: "pending", amountTiyin: 300_000_000, replay: false });
    expect(revoked).toEqual(["enr-1"]);
  });
  it("replays the same idempotency key without side effects", async () => {
    const first = await requestRefund(repo(), { paymentId: "pay-1", userId: "user-1", idempotencyKey: "key-1" });
    const second = await requestRefund(repo(), { paymentId: "pay-1", userId: "user-1", idempotencyKey: "key-1" });
    expect(first.refundId).toBe(second.refundId);
    expect(second.replay).toBe(true);
    expect(revoked.length).toBe(1);
  });
  it("rejects too many completed modules", async () => {
    const bad = repo({ countCompletedModules: async () => 5 });
    await expect(requestRefund(bad, { paymentId: "pay-1", userId: "user-1" })).rejects.toBeInstanceOf(RefundError);
    expect(revoked).toEqual([]);
  });
  it("rejects unpaid payments", async () => {
    const bad = repo({ findPaymentById: async () => ({ ...paymentRow, status: "pending" }) });
    await expect(requestRefund(bad, { paymentId: "pay-1", userId: "user-1" })).rejects.toMatchObject({ code: "NOT_PAID" });
  });
});

describe("referral payout policy", () => {
  it("earns 10% of paid referred payments", () => {
    expect(earnedBonusTiyin([300_000_000, 150_000_000])).toBe(45_000_000);
    expect(earnedBonusTiyin([])).toBe(0);
  });
  it("subtracts open payouts from the balance", () => {
    expect(payoutBalanceTiyin(45_000_000, [10_000_000])).toBe(35_000_000);
    expect(payoutBalanceTiyin(5_000_000, [9_000_000])).toBe(0);
  });
  it("rejects amounts above the balance and below the minimum", () => {
    expect(checkPayoutAmount(50_000_000, 10_000_000).ok).toBe(false);
    expect(checkPayoutAmount(1_000_000, 100_000_000)).toMatchObject({ ok: false, reason: "BELOW_MINIMUM" });
    expect(checkPayoutAmount(5_000_000, 100_000_000)).toEqual({ ok: true });
  });
});

describe("referral payout service", () => {
  let payouts: Map<string, { id: string; status: "pending"; amountTiyin: number }>;
  const repo = (balanceTiyin: number): ReferralsRepository => {
    const lookup = async (key: string) => {
      const found = payouts.get(key);
      return found
        ? {
            ...found, userId: "user-1", payoutMethod: "uzcard_humo", cardLast4: "1234",
            idempotencyKey: key, createdAt: new Date(),
          }
        : null;
    };
    const insert = async (input: CreatePayoutInput) => {
      const row = { id: `p-${payouts.size + 1}`, status: "pending" as const, amountTiyin: input.amountTiyin };
      payouts.set(input.idempotencyKey, row);
      return {
        ...row, userId: "user-1", payoutMethod: input.payoutMethod, cardLast4: "1234",
        idempotencyKey: input.idempotencyKey, createdAt: new Date(),
      };
    };
    const balance = async () => ({ earnedTiyin: balanceTiyin, reservedTiyin: 0, balanceTiyin, referredPaidCount: 1 });
    return {
      findPayoutByKey: lookup,
      findPayoutByKeyTx: async (_ex: DbExecutor, key) => lookup(key),
      createPayout: insert,
      createPayoutTx: async (_ex: DbExecutor, input) => insert(input),
      loadBalance: balance,
      loadBalanceTx: async () => balance(),
      attributeReferral: async () => undefined,
      attributeReferralTx: async () => undefined,
      resolveReferrerByCode: async () => null,
      resolveReferrerByCodeTx: async () => null,
      recordAudit: async () => undefined,
    };
  };

  beforeEach(() => {
    payouts = new Map();
  });

  it("creates a payout within the server-computed balance", async () => {
    const outcome = await requestPayout(repo(100_000_000), {
      userId: "user-1", payoutMethod: "uzcard_humo", cardNumber: "8600123412341234",
      amountTiyin: 50_000_000, idempotencyKey: "k-1",
    });
    expect(outcome).toMatchObject({ status: "pending", replay: false });
  });
  it("rejects a client amount above the balance", async () => {
    await expect(requestPayout(repo(10_000_000), {
      userId: "user-1", payoutMethod: "uzcard_humo", amountTiyin: 50_000_000,
    })).rejects.toBeInstanceOf(PayoutError);
  });
  it("is idempotent on the key", async () => {
    const r = repo(100_000_000);
    const first = await requestPayout(r, { userId: "user-1", payoutMethod: "course_balance", amountTiyin: 50_000_000, idempotencyKey: "k-2" });
    const second = await requestPayout(r, { userId: "user-1", payoutMethod: "course_balance", amountTiyin: 50_000_000, idempotencyKey: "k-2" });
    expect(first.payoutId).toBe(second.payoutId);
    expect(second.replay).toBe(true);
  });
});
