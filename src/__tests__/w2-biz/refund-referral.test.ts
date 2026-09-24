import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestRefund, RefundError } from "@/features/payments/server/refund.service";
import { checkPayoutAmount, earnedBonusTiyin, payoutBalanceTiyin } from "@/features/referrals/domain/policy";
import { requestPayout, PayoutError } from "@/features/referrals/server/payout.service";
import type { PaymentsRepository } from "@/features/payments/server/payments.repository";
import type { ReferralsRepository } from "@/features/referrals/server/referrals.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

describe("refund workflow service", () => {
  const paymentRow = {
    id: "pay-1", userId: "user-1", enrollmentId: "enr-1", provider: "payme" as const,
    providerTxnId: "txn-1", amountSum: "3000000.00", amountTiyin: 300_000_000,
    status: "paid" as const, paidAt: new Date(), meta: {},
  };
  let refunds: Map<string, { id: string; status: string; amountTiyin: number }>;
  let revoked: string[];
  const repo = (overrides: Partial<PaymentsRepository> = {}): PaymentsRepository =>
    ({
      findPaymentById: async (id: string) => (id === "pay-1" ? { ...paymentRow } : null),
      findUserEnrollment: async () => ({
        enrollmentId: "enr-1", userId: "user-1", enrollmentStatus: "active",
        enrolledAt: new Date(), cohortId: "cohort-1",
        priceSum: "3000000.00", earlyPriceSum: null, earlyDeadline: null,
      }),
      countCompletedModules: async () => 1,
      findRefundByKey: async (key: string) => {
        const found = refunds.get(key);
        return found ? { ...found, userId: "user-1", paymentId: "pay-1", enrollmentId: "enr-1", reason: null, idempotencyKey: key, createdAt: new Date() } : null;
      },
      createRefundRequest: async (input) => {
        const row = { id: `ref-${refunds.size + 1}`, status: "pending", amountTiyin: input.amountTiyin };
        refunds.set(input.idempotencyKey, row);
        return { ...row, userId: "user-1", paymentId: "pay-1", enrollmentId: "enr-1", reason: null, idempotencyKey: input.idempotencyKey, createdAt: new Date() };
      },
      setEnrollmentStatusTx: async (_ex, enrollmentId) => { revoked.push(enrollmentId); },
      ...overrides,
    }) as unknown as PaymentsRepository;

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
    const bad = repo({ findPaymentById: async () => ({ ...paymentRow, status: "pending" as const }) });
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
  let payouts: Map<string, { id: string; status: string; amountTiyin: number }>;
  const repo = (balanceTiyin: number): ReferralsRepository =>
    ({
      findPayoutByKey: async (key: string) => {
        const found = payouts.get(key);
        return found ? { ...found, userId: "user-1", payoutMethod: "uzcard_humo", cardLast4: "1234", idempotencyKey: key, createdAt: new Date() } : null;
      },
      createPayout: async (input) => {
        const row = { id: `p-${payouts.size + 1}`, status: "pending", amountTiyin: input.amountTiyin };
        payouts.set(input.idempotencyKey, row);
        return { ...row, userId: "user-1", payoutMethod: input.payoutMethod, cardLast4: "1234", idempotencyKey: input.idempotencyKey, createdAt: new Date() };
      },
      loadBalance: async () => ({ earnedTiyin: balanceTiyin, reservedTiyin: 0, balanceTiyin, referredPaidCount: 1 }),
      attributeReferral: async () => undefined,
      recordAudit: async () => undefined,
    }) as unknown as ReferralsRepository;

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
