import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCheckout, CheckoutError } from "@/features/payments/server/checkout.service";
import {
  cancelTransaction,
  checkPerform,
  createTransaction,
  performTransaction,
} from "@/features/payments/server/payme.service";
import { handleClickWebhook } from "@/features/payments/server/click.service";
import type { DbExecutor, PaymentRecord, PaymentsRepository } from "@/features/payments/server/payments.repository";
import type { ClickWebhookInput } from "@/lib/validations/payment";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

const NOW = new Date("2026-09-01T00:00:00Z");
const COHORT = { priceSum: "3000000.00", earlyPriceSum: null, earlyDeadline: null };

function payment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: "pay-1", userId: "user-1", enrollmentId: "enr-1", provider: "payme",
    providerTxnId: null, amountSum: "3000000.00", amountTiyin: 300_000_000,
    status: "pending", paidAt: null, meta: {}, ...overrides,
  };
}

interface FakeState {
  payments: Map<string, PaymentRecord>;
  enrollments: Map<string, { status: string; userId: string; cohortId: string; enrolledAt: Date }>;
}

function fakeRepo(state: FakeState): PaymentsRepository {
  const find = (id: string, provider: PaymentRecord["provider"]) => {
    const p = state.payments.get(id);
    return Promise.resolve(p && p.provider === provider ? { ...p } : null);
  };
  return {
    findPaymentById: find,
    findPaymentByIdTx: (_ex: DbExecutor, id: string, provider: PaymentRecord["provider"]) => find(id, provider),
    findByProviderTxnId: async (provider, txn) => {
      for (const p of state.payments.values()) {
        if (p.provider === provider && p.providerTxnId === txn) return { ...p };
      }
      return null;
    },
    findByProviderTxnIdTx: async (_ex: DbExecutor, provider, txn) => {
      for (const p of state.payments.values()) {
        if (p.provider === provider && p.providerTxnId === txn) return { ...p };
      }
      return null;
    },
    findPendingByEnrollment: async (enrollmentId, provider) => {
      for (const p of state.payments.values()) {
        if (p.enrollmentId === enrollmentId && p.provider === provider && p.status === "pending") return { ...p };
      }
      return null;
    },
    createPayment: async (input) => {
      const row = payment({ id: `pay-${state.payments.size + 1}`, ...input, status: "pending", paidAt: null, providerTxnId: null });
      state.payments.set(row.id, row);
      return { ...row };
    },
    setPaymentTx: async (_ex: DbExecutor, id, patch) => {
      const current = state.payments.get(id);
      if (!current) return;
      state.payments.set(id, { ...current, ...(patch as Partial<PaymentRecord>) });
    },
    findUserEnrollment: async (userId, enrollmentId) => {
      const e = state.enrollments.get(enrollmentId);
      if (!e || e.userId !== userId) return null;
      return { enrollmentId, userId, enrollmentStatus: e.status, enrolledAt: e.enrolledAt, cohortId: e.cohortId, ...COHORT };
    },
    findActiveUserEnrollment: async (userId, cohortId) => {
      for (const [id, e] of state.enrollments) {
        if (e.userId === userId && e.cohortId === cohortId) {
          return { enrollmentId: id, userId, enrollmentStatus: e.status, enrolledAt: e.enrolledAt, cohortId, ...COHORT };
        }
      }
      return null;
    },
    findCohort: async (cohortId) => (cohortId === "cohort-1"
      ? { enrollmentId: "", userId: "", enrollmentStatus: "active", enrolledAt: NOW, cohortId, ...COHORT }
      : null),
    createPendingEnrollment: async (userId, cohortId, _source) => {
      const id = `enr-${state.enrollments.size + 1}`;
      state.enrollments.set(id, { status: "active", userId, cohortId, enrolledAt: NOW });
      return { id };
    },
    setEnrollmentStatusTx: async (_ex: DbExecutor, enrollmentId, status) => {
      const e = state.enrollments.get(enrollmentId);
      if (e) state.enrollments.set(enrollmentId, { ...e, status });
    },
    countOtherPaidPaymentsTx: async (_ex: DbExecutor, enrollmentId, exclude) => {
      let count = 0;
      for (const p of state.payments.values()) {
        if (p.enrollmentId === enrollmentId && p.status === "paid" && p.id !== exclude) count += 1;
      }
      return count;
    },
    recordAudit: async () => undefined,
    findRefundByKey: async () => null,
    createRefundRequest: async () => { throw new Error("not used here"); },
    countCompletedModules: async () => 0,
  };
}

let state: FakeState;
beforeEach(() => {
  state = {
    payments: new Map(),
    enrollments: new Map([["enr-1", { status: "active", userId: "user-1", cohortId: "cohort-1", enrolledAt: NOW }]]),
  };
});

const SECRETS = { paymeMerchantId: "m", paymeKey: "k", clickServiceId: "s", clickMerchantId: "m", clickSecretKey: "k" };

describe("checkout service", () => {
  it("reuses the pending payment instead of duplicating", async () => {
    state.payments.set("pay-1", payment());
    const result = await createCheckout(fakeRepo(state), { userId: "user-1", enrollmentId: "enr-1", provider: "payme" }, SECRETS, NOW);
    expect(result.reused).toBe(true);
    expect(result.paymentId).toBe("pay-1");
    expect(result.amountTiyin).toBe(300_000_000);
    expect(state.payments.size).toBe(1);
  });
  it("creates a pending enrollment for a new student with only a cohort", async () => {
    const result = await createCheckout(fakeRepo(state), { userId: "new-user", cohortId: "cohort-1", provider: "click" }, SECRETS, NOW);
    expect(result.reused).toBe(false);
    expect(result.checkoutUrl).toContain("my.click.uz");
    expect(state.enrollments.size).toBe(2);
  });
  it("fails closed when the provider has no secrets", async () => {
    vi.stubEnv("NODE_ENV", "production");
    try {
      await expect(createCheckout(fakeRepo(state), { userId: "user-1", enrollmentId: "enr-1", provider: "payme" }, {}, NOW))
        .rejects.toMatchObject({ code: "PROVIDER_UNAVAILABLE" });
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it("rejects a foreign enrollment", async () => {
    await expect(createCheckout(fakeRepo(state), { userId: "stranger", enrollmentId: "enr-1", provider: "payme" }, SECRETS, NOW))
      .rejects.toBeInstanceOf(CheckoutError);
  });
});

describe("payme service", () => {
  it("performs a pending transaction and activates enrollment", async () => {
    state.payments.set("pay-1", payment({ providerTxnId: "txn-1", meta: { createTime: 1 } }));
    const outcome = await performTransaction(fakeRepo(state), "txn-1");
    expect(outcome).toEqual({ ok: true, result: expect.objectContaining({ transaction: "txn-1", state: 2 }) });
    expect(state.payments.get("pay-1")!.status).toBe("paid");
    expect(state.enrollments.get("enr-1")!.status).toBe("active");
  });
  it("replays a paid transaction idempotently", async () => {
    state.payments.set("pay-1", payment({ providerTxnId: "txn-1", status: "paid", paidAt: NOW, meta: { performTime: 5 } }));
    const outcome = await performTransaction(fakeRepo(state), "txn-1");
    expect(outcome).toEqual({ ok: true, result: expect.objectContaining({ perform_time: 5, state: 2 }) });
  });
  it("cancel sets cancelled (not refunded) and revokes granted access", async () => {
    state.payments.set("pay-1", payment({ providerTxnId: "txn-1", status: "paid" }));
    const outcome = await cancelTransaction(fakeRepo(state), "txn-1", 1);
    expect(outcome.ok).toBe(true);
    expect(state.payments.get("pay-1")!.status).toBe("cancelled");
    expect(state.enrollments.get("enr-1")!.status).toBe("paused");
  });
  it("cancel keeps access when another paid payment exists", async () => {
    state.payments.set("pay-1", payment({ providerTxnId: "txn-1", status: "paid" }));
    state.payments.set("pay-2", payment({ id: "pay-2", status: "paid" }));
    await cancelTransaction(fakeRepo(state), "txn-1", 1);
    expect(state.payments.get("pay-1")!.status).toBe("cancelled");
    expect(state.enrollments.get("enr-1")!.status).toBe("active");
  });
  it("check rejects an unknown order and accepts a matching one", async () => {
    state.payments.set("pay-1", payment());
    expect(await checkPerform(fakeRepo(state), "missing", 300_000_000)).toEqual({ ok: false, code: -31001 });
    expect(await checkPerform(fakeRepo(state), "pay-1", 1)).toEqual({ ok: false, code: -31001 });
    expect((await checkPerform(fakeRepo(state), "pay-1", 300_000_000)).ok).toBe(true);
  });
  it("create is idempotent for the same provider transaction", async () => {
    state.payments.set("pay-1", payment());
    const repo = fakeRepo(state);
    const first = await createTransaction(repo, "pay-1", "txn-9", 300_000_000, 100);
    expect(first).toEqual({ ok: true, result: expect.objectContaining({ state: 1 }) });
    const second = await createTransaction(repo, "pay-1", "txn-other", 300_000_000, 100);
    expect(second).toEqual({ ok: false, code: -31008 });
  });
});

describe("click service", () => {
  const webhook = (overrides: Partial<ClickWebhookInput> = {}): ClickWebhookInput => ({
    click_trans_id: "1001", service_id: "555", merchant_trans_id: "pay-1",
    merchant_prepare_id: "", amount: "3000000.00", action: "0",
    sign_time: "1700000000", sign_string: "a".repeat(32), ...overrides,
  });
  it("prepares then completes with matching ids", async () => {
    state.payments.set("pay-1", payment({ provider: "click" }));
    const repo = fakeRepo(state);
    const prepared = await handleClickWebhook(repo, webhook(), () => 9001);
    expect(prepared.ok).toBe(true);
    const completed = await handleClickWebhook(repo, webhook({ action: "1", merchant_prepare_id: "9001" }), () => 9002);
    expect(completed.ok).toBe(true);
    expect(state.payments.get("pay-1")!.status).toBe("paid");
  });
  it("rejects completion with a wrong prepare id", async () => {
    state.payments.set("pay-1", payment({ provider: "click", meta: { clickTransId: 1001, merchantPrepareId: 9001 } }));
    const outcome = await handleClickWebhook(fakeRepo(state), webhook({ action: "1", merchant_prepare_id: "1" }), () => 2);
    expect(outcome).toEqual({ ok: false, note: "Invalid transaction state", status: 400 });
  });
  it("marks failed on provider error only from pending", async () => {
    state.payments.set("pay-1", payment({ provider: "click" }));
    const outcome = await handleClickWebhook(fakeRepo(state), webhook({ action: "1", error: "-5017" }), () => 1);
    expect(outcome.ok).toBe(false);
    expect(state.payments.get("pay-1")!.status).toBe("failed");
  });
});
