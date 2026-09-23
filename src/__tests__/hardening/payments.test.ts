import { describe, it, expect } from "vitest";
import { verifyPaymeAuth } from "@/features/payments/payme";
import { computeClickSign } from "@/features/payments/click";

describe("Production High-Load Defensive Hardening - Payment Webhooks", () => {
  describe("Payme", () => {
    it("must not accept a hardcoded test_key when a real key is configured", () => {
      expect(verifyPaymeAuth(`Basic ${Buffer.from("Paycom:real_secret_key").toString("base64")}`, "real_secret_key")).toBe(true);
      expect(verifyPaymeAuth(`Basic ${Buffer.from("Paycom:test_key").toString("base64")}`, "real_secret_key")).toBe(false);
    });
    it("rejects every request when no key is configured (fails closed)", () => {
      expect(verifyPaymeAuth(`Basic ${Buffer.from("Paycom:anything").toString("base64")}`, "")).toBe(false);
      expect(verifyPaymeAuth(null, "")).toBe(false);
      expect(verifyPaymeAuth("garbage", "some_key")).toBe(false);
    });
    it("rejects a mismatched Authorization header", () => {
      expect(verifyPaymeAuth(`Basic ${Buffer.from("Paycom:wrong_key").toString("base64")}`, "real_secret_key")).toBe(false);
    });
  });

  describe("Click", () => {
    it("produces a stable 32-char MD5 signature for identical inputs", () => {
      const args = ["1001", "555", "secret", "order_1", "999", "1200000", "0", "1694000000"] as const;
      const first = computeClickSign(...args);
      const second = computeClickSign(...args);
      expect(first).toHaveLength(32);
      expect(first).toBe(second);
    });
    it("changes the signature when any signed field changes", () => {
      const base = computeClickSign("1001", "555", "secret", "order_1", "999", "1200000", "0", "1694000000");
      const amount = computeClickSign("1001", "555", "secret", "order_1", "999", "99000000", "0", "1694000000");
      const order = computeClickSign("1001", "555", "secret", "order_2", "999", "1200000", "0", "1694000000");
      expect(amount).not.toBe(base);
      expect(order).not.toBe(base);
    });
  });
});
