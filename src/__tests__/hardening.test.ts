import { describe, it, expect, beforeEach, vi } from "vitest";
import { db, withRetry, withTransactionLock, checkDbHealth } from "@/db";
import { verifyPaymeAuth } from "@/features/payments/payme";
import { computeClickSign } from "@/features/payments/click";
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
    }, 15000);

    it("should return db health status correctly", async () => {
      const health = await checkDbHealth();
      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("latencyMs");
    });
  });

  describe("2. Payment Webhooks (Payme & Click) Configuration & Signature Safety", () => {
    describe("Payme", () => {
      it("must not accept a hardcoded test_key when a real key is configured", () => {
        const configured = verifyPaymeAuth(
          `Basic ${Buffer.from("Paycom:real_secret_key").toString("base64")}`,
          "real_secret_key"
        );
        expect(configured).toBe(true);

        const bypassAttempt = verifyPaymeAuth(
          `Basic ${Buffer.from("Paycom:test_key").toString("base64")}`,
          "real_secret_key"
        );
        expect(bypassAttempt).toBe(false);
      });

      it("rejects every request when no key is configured (fails closed)", () => {
        expect(verifyPaymeAuth(`Basic ${Buffer.from("Paycom:anything").toString("base64")}`, "")).toBe(false);
        expect(verifyPaymeAuth(null, "")).toBe(false);
        expect(verifyPaymeAuth("garbage", "some_key")).toBe(false);
      });

      it("rejects a mismatched Authorization header", () => {
        const wrongAuth = `Basic ${Buffer.from("Paycom:wrong_key").toString("base64")}`;
        expect(verifyPaymeAuth(wrongAuth, "real_secret_key")).toBe(false);
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
        const tamperedAmount = computeClickSign("1001", "555", "secret", "order_1", "999", "99000000", "0", "1694000000");
        const tamperedOrder = computeClickSign("1001", "555", "secret", "order_2", "999", "1200000", "0", "1694000000");
        expect(tamperedAmount).not.toBe(base);
        expect(tamperedOrder).not.toBe(base);
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
