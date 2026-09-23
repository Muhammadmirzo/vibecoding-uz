import { describe, expect, it } from "vitest";

import { amountMatches, verifyPaymeAuth } from "@/features/payments/payme";
import { clickAmountMatches, computeClickSign, verifyClickSign } from "@/features/payments/click";
import { clickWebhookSchema, paymeRpcRequestSchema } from "@/lib/validations/payment";

const paymePayload = {
  jsonrpc: "2.0",
  method: "CreateTransaction",
  params: { id: "provider-1", time: 1_700_000_000, amount: 5_000_000, account: { order_id: "payment-1" } },
  id: 42,
};

const clickPayload = {
  click_trans_id: "1001",
  service_id: "555",
  merchant_trans_id: "payment-1",
  merchant_prepare_id: "9001",
  amount: "50000.00",
  action: "1",
  sign_time: "1700000000",
  sign_string: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
};

describe("payment webhook validation", () => {
  it("accepts a valid Payme JSON-RPC payload", () => {
    expect(paymeRpcRequestSchema.safeParse(paymePayload).success).toBe(true);
  });

  it("rejects a Payme payload without an RPC id", () => {
    const { id: _id, ...withoutId } = paymePayload;
    expect(paymeRpcRequestSchema.safeParse(withoutId).success).toBe(false);
  });

  it("rejects a non-integer Payme minor-unit amount", () => {
    const payload = { ...paymePayload, params: { ...paymePayload.params, amount: 10.5 } };
    expect(paymeRpcRequestSchema.safeParse(payload).success).toBe(false);
  });

  it("rejects an unknown Payme method", () => {
    expect(paymeRpcRequestSchema.safeParse({ ...paymePayload, method: "RefundAnything" }).success).toBe(false);
  });

  it("accepts a complete Click callback", () => {
    expect(clickWebhookSchema.safeParse(clickPayload).success).toBe(true);
  });

  it("rejects a Click callback without sign_string", () => {
    const { sign_string: _signature, ...withoutSignature } = clickPayload;
    expect(clickWebhookSchema.safeParse(withoutSignature).success).toBe(false);
  });

  it("rejects a Click callback with a non-MD5 signature", () => {
    expect(clickWebhookSchema.safeParse({ ...clickPayload, sign_string: "not-md5" }).success).toBe(false);
  });
});

describe("provider signature and amount helpers", () => {
  it("accepts genuine Payme Basic credentials", () => {
    const header = `Basic ${Buffer.from("Paycom:real-secret").toString("base64")}`;
    expect(verifyPaymeAuth(header, "real-secret")).toBe(true);
  });

  it("rejects Payme test_key when configured with a real key", () => {
    const header = `Basic ${Buffer.from("Paycom:test_key").toString("base64")}`;
    expect(verifyPaymeAuth(header, "real-secret")).toBe(false);
  });

  it("rejects Payme auth when the configured key is missing", () => {
    const header = `Basic ${Buffer.from("Paycom:anything").toString("base64")}`;
    expect(verifyPaymeAuth(header, undefined)).toBe(false);
  });

  it("compares Payme amounts in minor units", () => {
    expect(amountMatches("50000.00", 5_000_000)).toBe(true);
    expect(amountMatches("50000.00", 1)).toBe(false);
  });

  it("computes and verifies a Click MD5 signature", () => {
    const signature = computeClickSign("1001", "555", "click-secret", "payment-1", "9001", "50000.00", "1", "1700000000");
    expect(signature).toHaveLength(32);
    expect(verifyClickSign(signature.toUpperCase(), signature)).toBe(true);
  });

  it("rejects a Click signature made with another secret", () => {
    const signature = computeClickSign("1001", "555", "wrong-secret", "payment-1", "9001", "50000.00", "1", "1700000000");
    expect(verifyClickSign(signature, "a".repeat(32))).toBe(false);
  });

  it("compares Click amounts without floating-point drift", () => {
    expect(clickAmountMatches("50000.00", "50000")).toBe(true);
    expect(clickAmountMatches("1000.10", "1000.20")).toBe(false);
  });
});
