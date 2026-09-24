import { describe, expect, it } from "vitest";
import {
  formatTiyinUz,
  sumMatchesTiyin,
  sumToTiyin,
  tiyinToSumString,
} from "@/features/payments/domain/money";
import {
  buildClickCheckoutUrl,
  buildPaymeCheckoutUrl,
  decideCheckout,
  decideClickTransition,
  decidePaymeCancel,
  effectivePriceTiyin,
  isClickAvailable,
  isPaymeAvailable,
  paymeProtocolState,
} from "@/features/payments/domain/policy";

describe("tiyin money", () => {
  it("converts decimal sums to integer tiyin", () => {
    expect(sumToTiyin("2500000.00")).toBe(250_000_000);
    expect(sumToTiyin("1500.50")).toBe(150_050);
    expect(sumToTiyin("100")).toBe(10_000);
  });
  it("rejects malformed sums", () => {
    expect(() => sumToTiyin("abc")).toThrow();
    expect(() => sumToTiyin("10.555")).toThrow();
    expect(() => sumToTiyin("-5")).toThrow();
  });
  it("round-trips tiyin to sum strings", () => {
    expect(tiyinToSumString(250_000_000)).toBe("2500000.00");
    expect(sumMatchesTiyin("2500000.00", 250_000_000)).toBe(true);
    expect(sumMatchesTiyin("2500000.00", 250_000_001)).toBe(false);
    expect(sumMatchesTiyin("broken", 1)).toBe(false);
  });
  it("formats Uzbek sums", () => {
    expect(formatTiyinUz(250_000_000)).toBe("2 500 000 so'm");
  });
});

describe("provider availability requires secrets", () => {
  it("payme needs both merchant id and key", () => {
    expect(isPaymeAvailable({ paymeMerchantId: "m", paymeKey: "k" })).toBe(true);
    expect(isPaymeAvailable({ paymeMerchantId: "m" })).toBe(false);
    expect(isPaymeAvailable({ paymeKey: "k" })).toBe(false);
    expect(isPaymeAvailable({})).toBe(false);
  });
  it("click needs service id, merchant id and secret", () => {
    expect(isClickAvailable({ clickServiceId: "s", clickMerchantId: "m", clickSecretKey: "k" })).toBe(true);
    expect(isClickAvailable({ clickServiceId: "s", clickMerchantId: "m" })).toBe(false);
    expect(isClickAvailable({})).toBe(false);
  });
});

describe("effective price in tiyin", () => {
  const now = new Date("2026-09-01T00:00:00Z");
  it("uses the early price before its deadline", () => {
    const price = effectivePriceTiyin(
      { priceSum: "3000000.00", earlyPriceSum: "2400000.00", earlyDeadline: new Date("2026-10-01T00:00:00Z") },
      now,
    );
    expect(price).toEqual({ tiyin: 240_000_000, isEarly: true });
  });
  it("falls back to the regular price after the deadline", () => {
    const price = effectivePriceTiyin(
      { priceSum: "3000000.00", earlyPriceSum: "2400000.00", earlyDeadline: new Date("2026-08-01T00:00:00Z") },
      now,
    );
    expect(price).toEqual({ tiyin: 300_000_000, isEarly: false });
  });
  it("rejects a zero price", () => {
    expect(() => effectivePriceTiyin({ priceSum: "0.00" }, now)).toThrow();
  });
});

describe("checkout reuse policy", () => {
  it("reuses the existing pending payment", () => {
    expect(decideCheckout("pay-1", 100)).toEqual({ action: "reuse", paymentId: "pay-1" });
  });
  it("creates a new payment otherwise", () => {
    expect(decideCheckout(null, 100)).toEqual({ action: "create", amountTiyin: 100 });
  });
});

describe("payme cancel is not a refund", () => {
  it("cancels a paid payment and revokes access", () => {
    expect(decidePaymeCancel("paid", true)).toEqual({ nextStatus: "cancelled", revokeAccess: true, replay: false });
  });
  it("cancels without revoking when access came from elsewhere", () => {
    expect(decidePaymeCancel("paid", false).revokeAccess).toBe(false);
  });
  it("cancels a pending payment without revoking", () => {
    expect(decidePaymeCancel("pending", false)).toEqual({ nextStatus: "cancelled", revokeAccess: false, replay: false });
  });
  it("replays terminal states without side effects", () => {
    expect(decidePaymeCancel("cancelled", true).replay).toBe(true);
    expect(decidePaymeCancel("refunded", true).replay).toBe(true);
  });
  it("maps cancelled to protocol state -1", () => {
    expect(paymeProtocolState("cancelled")).toBe(-1);
    expect(paymeProtocolState("paid")).toBe(2);
    expect(paymeProtocolState("pending")).toBe(1);
  });
});

describe("click transitions", () => {
  it("prepares a pending payment", () => {
    expect(decideClickTransition({
      status: "pending", storedClickTransId: null, incomingClickTransId: 7,
      storedPrepareId: null, incomingPrepareId: null, providerError: false, phase: "prepare",
    })).toEqual({ action: "prepare" });
  });
  it("rejects binding to a different provider transaction", () => {
    expect(decideClickTransition({
      status: "pending", storedClickTransId: 7, incomingClickTransId: 8,
      storedPrepareId: null, incomingPrepareId: null, providerError: false, phase: "prepare",
    })).toEqual({ action: "reject", reason: "mismatch" });
  });
  it("completes with the matching prepare id and replays paid", () => {
    const base = { storedClickTransId: 7, incomingClickTransId: 7, storedPrepareId: 42, incomingPrepareId: 42, providerError: false, phase: "complete" as const };
    expect(decideClickTransition({ ...base, status: "pending" })).toEqual({ action: "complete" });
    expect(decideClickTransition({ ...base, status: "paid" })).toEqual({ action: "complete" });
  });
  it("rejects completion with a wrong prepare id", () => {
    expect(decideClickTransition({
      status: "pending", storedClickTransId: 7, incomingClickTransId: 7,
      storedPrepareId: 42, incomingPrepareId: 43, providerError: false, phase: "complete",
    })).toEqual({ action: "reject", reason: "prepare" });
  });
});

describe("checkout urls carry tiyin amounts", () => {
  it("encodes the tiyin amount for payme", () => {
    const url = buildPaymeCheckoutUrl("m1", "pay-1", 250_000_000);
    const decoded = Buffer.from(url.split("/").pop()!, "base64").toString("utf8");
    expect(decoded).toContain("a=250000000");
  });
  it("formats the decimal amount for click", () => {
    expect(buildClickCheckoutUrl("s", "m", "pay-1", 250_000_000)).toContain("amount=2500000.00");
  });
});
