import { describe, it, expect, beforeEach, vi } from "vitest";
import { db, withRetry, withTransactionLock, checkDbHealth } from "@/db";
import {
  verifyPaymeAuth,
  paymeStore,
  createPaymeErrorResponse,
  createPaymeSuccessResponse,
  PAYME_ERRORS,
} from "@/features/payments/payme";
import { POST as paymeHandler } from "@/app/api/payments/payme/route";
import { POST as clickHandler } from "@/app/api/payments/click/route";
import { computeClickSign, clickStore } from "@/features/payments/click";
import { sendSms, sendOtpSms, getEskizToken, clearEskizTokenCache, redactPhone } from "@/lib/sms/eskiz";
import { POST as sendOtpHandler } from "@/app/api/auth/otp/send/route";
import { verifySessionToken, validateSessionCookie, parseSessionCookie, signSessionToken } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { NextRequest } from "next/server";

describe("Production High-Load Defensive Hardening & Edge-Case Testing", () => {
  describe("1. Database Connection Handling & Retry Locks (src/db/index.ts)", () => {
    it("should succeed immediately on normal DB query", async () => {
      const result = await withRetry(async () => "db_success");
      expect(result).toBe("db_success");
    });

    it("should retry transient DB errors and succeed after retries", async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          const err: any = new Error("connection lost");
          err.code = "ECONNRESET";
          throw err;
        }
        return "recovered_data";
      };

      const result = await withRetry(fn, { retries: 3, delayMs: 10, backoffFactor: 1 });
      expect(result).toBe("recovered_data");
      expect(attempts).toBe(3);
    });

    it("should throw error immediately if non-transient DB error occurs", async () => {
      const fn = async () => {
        const err: any = new Error("syntax error at or near SELECT");
        err.code = "42601";
        throw err;
      };

      await expect(withRetry(fn, { retries: 3, delayMs: 10 })).rejects.toThrow("syntax error");
    });

    it("should execute withTransactionLock sequentially under concurrent calls", async () => {
      const executionOrder: number[] = [];

      const task1 = withTransactionLock("test_lock_key", async () => {
        executionOrder.push(1);
        await new Promise((r) => setTimeout(r, 50));
        executionOrder.push(2);
        return "task1";
      });

      const task2 = withTransactionLock("test_lock_key", async () => {
        executionOrder.push(3);
        return "task2";
      });

      const results = await Promise.all([task1, task2]);
      expect(results).toEqual(["task1", "task2"]);
      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it("should return db health status correctly", async () => {
      const health = await checkDbHealth();
      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("latencyMs");
    });
  });

  describe("2. Payment Webhooks (Payme & Click) Double-Spending & Race Condition Prevention", () => {
    beforeEach(() => {
      paymeStore.clear();
      clickStore.clear();
    });

    describe("Payme Webhook", () => {
      const key = "test_key";
      const validAuth = `Basic ${Buffer.from(`Paycom:${key}`).toString("base64")}`;

      it("should reject Payme request with invalid Authorization header", async () => {
        const req = new NextRequest("http://localhost/api/payments/payme", {
          method: "POST",
          headers: { authorization: "Basic invalid_base64" },
          body: JSON.stringify({ method: "CheckPerformTransaction", params: { amount: 5000000 }, id: 1 }),
        });
        const res = await paymeHandler(req);
        const data = await res.json();
        expect(data.error.code).toBe(PAYME_ERRORS.AUTH_ERROR.code);
      });

      it("should validate CheckPerformTransaction minimum amount", async () => {
        const req = new NextRequest("http://localhost/api/payments/payme", {
          method: "POST",
          headers: { authorization: validAuth },
          body: JSON.stringify({ method: "CheckPerformTransaction", params: { amount: 500 }, id: 1 }),
        });
        const res = await paymeHandler(req);
        const data = await res.json();
        expect(data.error.code).toBe(PAYME_ERRORS.INVALID_AMOUNT.code);
      });

      it("should handle CreateTransaction and return state 1", async () => {
        const req = new NextRequest("http://localhost/api/payments/payme", {
          method: "POST",
          headers: { authorization: validAuth },
          body: JSON.stringify({
            method: "CreateTransaction",
            params: { id: "txn_payme_001", time: Date.now(), amount: 5000000, account: { order_id: "order_123" } },
            id: 2,
          }),
        });
        const res = await paymeHandler(req);
        const data = await res.json();
        expect(data.result.state).toBe(1);
        expect(data.result.transaction).toBe("txn_payme_001");
      });

      it("should prevent double spending on PerformTransaction (Idempotency)", async () => {
        // 1. Create Transaction
        const createReq = new NextRequest("http://localhost/api/payments/payme", {
          method: "POST",
          headers: { authorization: validAuth },
          body: JSON.stringify({
            method: "CreateTransaction",
            params: { id: "txn_payme_dup", time: Date.now(), amount: 10000000, account: { user_id: "usr_123" } },
            id: 10,
          }),
        });
        await paymeHandler(createReq);

        // 2. First PerformTransaction
        const performReq1 = new NextRequest("http://localhost/api/payments/payme", {
          method: "POST",
          headers: { authorization: validAuth },
          body: JSON.stringify({
            method: "PerformTransaction",
            params: { id: "txn_payme_dup" },
            id: 11,
          }),
        });
        const res1 = await paymeHandler(performReq1);
        const data1 = await res1.json();
        expect(data1.result.state).toBe(2);

        // 3. Second PerformTransaction (Simulated duplicate webhook delivery / race condition)
        const performReq2 = new NextRequest("http://localhost/api/payments/payme", {
          method: "POST",
          headers: { authorization: validAuth },
          body: JSON.stringify({
            method: "PerformTransaction",
            params: { id: "txn_payme_dup" },
            id: 12,
          }),
        });
        const res2 = await paymeHandler(performReq2);
        const data2 = await res2.json();

        // Must return identical idempotent success with same perform_time and state 2 without re-processing!
        expect(data2.result.state).toBe(2);
        expect(data2.result.perform_time).toBe(data1.result.perform_time);
      });

      it("should check transaction state via CheckTransaction", async () => {
        const createReq = new NextRequest("http://localhost/api/payments/payme", {
          method: "POST",
          headers: { authorization: validAuth },
          body: JSON.stringify({
            method: "CreateTransaction",
            params: { id: "txn_payme_chk", time: Date.now(), amount: 5000000 },
            id: 20,
          }),
        });
        await paymeHandler(createReq);

        const checkReq = new NextRequest("http://localhost/api/payments/payme", {
          method: "POST",
          headers: { authorization: validAuth },
          body: JSON.stringify({
            method: "CheckTransaction",
            params: { id: "txn_payme_chk" },
            id: 21,
          }),
        });
        const res = await paymeHandler(checkReq);
        const data = await res.json();
        expect(data.result.state).toBe(1);
        expect(data.result.transaction).toBe("txn_payme_chk");
      });
    });

    describe("Click Webhook", () => {
      it("should verify Click MD5 signature when secret key is provided", () => {
        const secret = "test_click_secret";
        const sign = computeClickSign("1001", "555", secret, "order_789", "999", "1200000", "0", "1694000000");
        expect(sign).toHaveLength(32);
      });

      it("should handle Action 0 (Prepare phase) and Action 1 (Complete phase) idempotently", async () => {
        const form0 = new FormData();
        form0.append("click_trans_id", "2001");
        form0.append("service_id", "100");
        form0.append("merchant_trans_id", "order_555");
        form0.append("amount", "500000");
        form0.append("action", "0");

        const req0 = new NextRequest("http://localhost/api/payments/click", {
          method: "POST",
          body: form0,
        });
        const res0 = await clickHandler(req0);
        const data0 = await res0.json();

        expect(data0.error).toBe(0);
        expect(data0.merchant_prepare_id).toBeGreaterThan(0);

        // Action 1: Complete
        const form1 = new FormData();
        form1.append("click_trans_id", "2001");
        form1.append("service_id", "100");
        form1.append("merchant_trans_id", "order_555");
        form1.append("merchant_prepare_id", String(data0.merchant_prepare_id));
        form1.append("amount", "500000");
        form1.append("action", "1");

        const req1 = new NextRequest("http://localhost/api/payments/click", {
          method: "POST",
          body: form1,
        });
        const res1 = await clickHandler(req1);
        const data1 = await res1.json();

        expect(data1.error).toBe(0);
        expect(data1.merchant_confirm_id).toBe(data0.merchant_prepare_id + 1);

        // Duplicate Action 1 (Double spending / race condition test)
        const req2 = new NextRequest("http://localhost/api/payments/click", {
          method: "POST",
          body: form1,
        });
        const res2 = await clickHandler(req2);
        const data2 = await res2.json();

        expect(data2.error).toBe(0);
        expect(data2.merchant_confirm_id).toBe(data1.merchant_confirm_id);
      });
    });
  });

  describe("3. SMS OTP Retry Backoff & Fallback (src/lib/sms/eskiz.ts)", () => {
    beforeEach(() => {
      clearEskizTokenCache();
      vi.spyOn(db, "insert").mockReturnValue({
        values: vi.fn().mockResolvedValue([]),
      } as any);
    });

    it("should fall back to mock SMS mode cleanly when Eskiz credentials are unset", async () => {
      delete process.env.ESKIZ_EMAIL;
      delete process.env.ESKIZ_PASSWORD;

      const result = await sendSms({ phone: "+998901234567", message: "Test SMS" });
      expect(result.success).toBe(true);
      expect(result.mock).toBe(true);
      expect(result.messageId).toContain("mock-sms-");
    });

    it("should send OTP SMS correctly", async () => {
      const result = await sendOtpSms({ phone: "998901234567", code: "654321" });
      expect(result.success).toBe(true);
    });

    it("should redact phone numbers correctly in log helper", () => {
      expect(redactPhone("+998901234567")).toBe("+99890***567");
      expect(redactPhone("998901234567")).toBe("+99890***567");
      expect(redactPhone("+998977654321")).toBe("+99897***321");
      expect(redactPhone("")).toBe("");
    });

    it("should fail closed in production mode when SMS provider is mock or fails", async () => {
      const origEnv = process.env.NODE_ENV;
      const env = process.env as Record<string, string | undefined>;
      try {
        env.NODE_ENV = "production";
        delete process.env.ESKIZ_EMAIL;
        delete process.env.ESKIZ_PASSWORD;

        const req = new Request("http://localhost/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: "+998901112233", purpose: "login" }),
        });

        const res = await sendOtpHandler(req);
        expect(res.status).toBe(503);
        const data = await res.json();
        expect(data.error).toBe("SMS xizmatida vaqtincha uzilish yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        expect(data.devCode).toBeUndefined();
      } finally {
        env.NODE_ENV = origEnv;
      }
    });

    it("should strictly gate devCode exposure to development mode", async () => {
      const origEnv = process.env.NODE_ENV;
      const env = process.env as Record<string, string | undefined>;
      try {
        env.NODE_ENV = "development";
        const reqDev = new Request("http://localhost/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: "+998901112244", purpose: "login" }),
        });
        const resDev = await sendOtpHandler(reqDev);
        expect(resDev.status).toBe(200);
        const dataDev = await resDev.json();
        expect(dataDev.success).toBe(true);
        expect(dataDev.devCode).toBeDefined();

        env.NODE_ENV = "test";
        const reqTest = new Request("http://localhost/api/auth/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: "+998901112255", purpose: "login" }),
        });
        const resTest = await sendOtpHandler(reqTest);
        expect(resTest.status).toBe(200);
        const dataTest = await resTest.json();
        expect(dataTest.success).toBe(true);
        expect(dataTest.devCode).toBeUndefined();
      } finally {
        env.NODE_ENV = origEnv;
      }
    });
  });

  describe("4. Edge Runtime Null Check Resilience in Session & Rate Limiter", () => {
    it("should handle null or invalid session tokens without throwing exceptions", () => {
      expect(verifySessionToken(null)).toBeNull();
      expect(verifySessionToken(undefined)).toBeNull();
      expect(verifySessionToken("")).toBeNull();
      expect(verifySessionToken("invalid.token.structure")).toBeNull();
      expect(verifySessionToken("malformed_base64!.signature")).toBeNull();
    });

    it("should sign and verify valid session tokens cleanly", () => {
      const token = signSessionToken({ userId: "usr_abc", role: "admin" }, "my_test_secret");
      const verified = verifySessionToken(token, "my_test_secret");

      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe("usr_abc");
      expect(verified?.role).toBe("admin");
    });

    it("should parse cookie header with edge null checks", () => {
      expect(parseSessionCookie(null)).toBeNull();
      expect(parseSessionCookie(undefined)).toBeNull();
      expect(parseSessionCookie("")).toBeNull();
      expect(parseSessionCookie("session_token=abc123xyz")).toBe("abc123xyz");
    });

    it("should validate session cookie with null check resilience", () => {
      const resultNull = validateSessionCookie(null, "secret", () => null);
      expect(resultNull.valid).toBe(false);
      expect(resultNull.error).toBe("MISSING_TOKEN");
    });

    it("should extract client IP safely with null request or headers", () => {
      expect(getClientIp(null)).toBe("127.0.0.1");
      expect(getClientIp(undefined)).toBe("127.0.0.1");

      const reqWithIp = new Request("http://localhost", {
        headers: { "x-forwarded-for": "203.0.113.195, 10.0.0.1" },
      });
      expect(getClientIp(reqWithIp)).toBe("203.0.113.195");
    });

    it("should rate limit safely with null or undefined identifiers", async () => {
      const resultNull = await checkRateLimit(null, PRESETS.OTP);
      expect(resultNull).toHaveProperty("success");
      expect(resultNull.limit).toBe(3);

      const resultUndef = await checkRateLimit(undefined, PRESETS.OTP);
      expect(resultUndef).toHaveProperty("success");
    });

    it("should generate 429 RateLimit response with standard headers", () => {
      const rateLimitRes = createRateLimitResponse({
        success: false,
        limit: 3,
        remaining: 0,
        reset: Date.now() + 300000,
        retryAfterSec: 300,
      });

      expect(rateLimitRes.status).toBe(429);
      expect(rateLimitRes.headers.get("Retry-After")).toBe("300");
    });
  });
});
