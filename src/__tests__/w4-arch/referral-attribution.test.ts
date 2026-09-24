import { beforeEach, describe, expect, it, vi } from "vitest";
import { withTransactionLock } from "@/db";
import { requestPayout, PayoutError } from "@/features/referrals/server/payout.service";
import {
  attributeReferralFromCookie,
  attributeReferralFromCookieTx,
  type AttributionStore,
  type AttributionTxStore,
} from "@/features/referrals/server/attribution.service";
import type { DbExecutor } from "@/features/payments/server/payments.repository";
import type { ReferralsRepository } from "@/features/referrals/server/referrals.repository";
import type { referralPayouts } from "@/db/schema";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

type PayoutRow = typeof referralPayouts.$inferSelect;

function unexpectedCall(method: string): () => Promise<never> {
  return async () => {
    throw new Error(`unexpected repository call: ${method}`);
  };
}

describe("payout tx-atomicity", () => {
  let payouts: Map<string, PayoutRow>;
  let seen: DbExecutor[];
  let creates: number;

  const repo = (balanceTiyin: number): ReferralsRepository => ({
    findPayoutByKey: unexpectedCall("findPayoutByKey"),
    findPayoutByKeyTx: async (ex, key) => {
      seen.push(ex);
      return payouts.get(key) ?? null;
    },
    createPayout: unexpectedCall("createPayout"),
    createPayoutTx: async (ex, input) => {
      seen.push(ex);
      creates += 1;
      const row: PayoutRow = {
        id: `p-${payouts.size + 1}`, userId: input.userId, amountTiyin: input.amountTiyin,
        payoutMethod: input.payoutMethod, cardLast4: input.cardLast4, status: "pending",
        idempotencyKey: input.idempotencyKey, createdAt: new Date(),
      };
      payouts.set(input.idempotencyKey, row);
      return row;
    },
    loadBalance: unexpectedCall("loadBalance"),
    loadBalanceTx: async (ex) => {
      seen.push(ex);
      return { earnedTiyin: balanceTiyin, reservedTiyin: 0, balanceTiyin, referredPaidCount: 1 };
    },
    attributeReferral: async () => undefined,
    attributeReferralTx: async () => undefined,
    resolveReferrerByCode: async () => null,
    resolveReferrerByCodeTx: async () => null,
    recordAudit: async () => undefined,
  });

  beforeEach(() => {
    payouts = new Map();
    seen = [];
    creates = 0;
  });

  it("runs check-then-insert through one executor", async () => {
    const outcome = await requestPayout(repo(100_000_000), {
      userId: "user-1", payoutMethod: "uzcard_humo", cardNumber: "8600123412341234",
      amountTiyin: 50_000_000, idempotencyKey: "k-1",
    });
    expect(outcome).toMatchObject({ status: "pending", replay: false });
    expect(creates).toBe(1);
    expect(seen.length).toBe(3);
    for (const ex of seen) expect(ex).toBe(seen[0]);
  });

  it("is idempotent on the key", async () => {
    const r = repo(100_000_000);
    const first = await requestPayout(r, {
      userId: "user-1", payoutMethod: "course_balance", amountTiyin: 50_000_000, idempotencyKey: "k-2",
    });
    const second = await requestPayout(r, {
      userId: "user-1", payoutMethod: "course_balance", amountTiyin: 50_000_000, idempotencyKey: "k-2",
    });
    expect(first.payoutId).toBe(second.payoutId);
    expect(second.replay).toBe(true);
    expect(creates).toBe(1);
  });

  it("rejects a client amount above the balance", async () => {
    await expect(requestPayout(repo(10_000_000), {
      userId: "user-1", payoutMethod: "uzcard_humo", amountTiyin: 50_000_000,
    })).rejects.toBeInstanceOf(PayoutError);
    expect(creates).toBe(0);
  });
});

describe("referral attribution", () => {
  const storeWith = (
    resolve: (code: string) => Promise<{ id: string } | null>,
    onAttribute?: (referrer: string, referred: string) => void,
  ): AttributionStore => ({
    resolveReferrerByCode: resolve,
    attributeReferral: async (referrer, referred) => {
      if (!onAttribute) throw new Error("attributeReferral must not be called");
      onAttribute(referrer, referred);
    },
  });

  const noResolve: (code: string) => Promise<{ id: string } | null> = async () => {
    throw new Error("resolveReferrerByCode must not be called");
  };

  it("attributes a valid code to the resolved referrer", async () => {
    let attributed: { referrer: string; referred: string } | null = null;
    const store = storeWith(
      async (code) => (code.toUpperCase() === "A1B2C3D4" ? { id: "referrer-1" } : null),
      (referrer, referred) => {
        attributed = { referrer, referred };
      },
    );
    const outcome = await attributeReferralFromCookie(store, { code: "a1b2c3d4", referredUserId: "user-9" });
    expect(outcome).toEqual({ attributed: true, referrerUserId: "referrer-1" });
    expect(attributed).toEqual({ referrer: "referrer-1", referred: "user-9" });
  });

  it("ignores an empty code without resolving", async () => {
    const outcome = await attributeReferralFromCookie(storeWith(noResolve), { code: "   ", referredUserId: "user-9" });
    expect(outcome).toEqual({ attributed: false, reason: "empty" });
  });

  it("ignores a malformed code without resolving", async () => {
    const outcome = await attributeReferralFromCookie(storeWith(noResolve), { code: "not-a-code!", referredUserId: "user-9" });
    expect(outcome).toEqual({ attributed: false, reason: "invalid" });
  });

  it("ignores a well-formed but unknown code", async () => {
    const store = storeWith(async () => null);
    const outcome = await attributeReferralFromCookie(store, { code: "DEADBEEF", referredUserId: "user-9" });
    expect(outcome).toEqual({ attributed: false, reason: "unresolvable" });
  });

  it("ignores self-referral", async () => {
    const store = storeWith(async () => ({ id: "user-9" }));
    const outcome = await attributeReferralFromCookie(store, { code: "ABCDEF12", referredUserId: "user-9" });
    expect(outcome).toEqual({ attributed: false, reason: "self" });
  });

  it("runs resolve+insert on the passed transaction", async () => {
    let txEx: DbExecutor | undefined;
    await withTransactionLock("attribution-probe", async (tx: DbExecutor | null | undefined) => {
      txEx = tx ?? undefined;
      return null;
    });
    if (!txEx) throw new Error("expected a transaction executor");
    const ex: DbExecutor = txEx;
    const seenEx: DbExecutor[] = [];
    const store: AttributionTxStore = {
      resolveReferrerByCodeTx: async (passed, code) => {
        seenEx.push(passed);
        return code ? { id: "referrer-1" } : null;
      },
      attributeReferralTx: async (passed) => {
        seenEx.push(passed);
      },
    };
    const outcome = await attributeReferralFromCookieTx(store, ex, { code: "A1B2C3D4", referredUserId: "user-9" });
    expect(outcome).toEqual({ attributed: true, referrerUserId: "referrer-1" });
    expect(seenEx.length).toBe(2);
    expect(seenEx[0]).toBe(ex);
    expect(seenEx[1]).toBe(ex);
  });
});
