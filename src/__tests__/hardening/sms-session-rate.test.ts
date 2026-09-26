import { describe, it, expect, beforeEach, vi } from "vitest";

// The OTP preset is 3 per 5 minutes. This file flips NODE_ENV to
// "development", which makes checkRateLimit use the shared Postgres limiter
// against the configured DATABASE_URL — so the suite WROTE rate_limit_buckets
// rows and a second run inside the window answered 429 (L2/L40). Keep the
// limiter in memory here; the Postgres limiter has its own tests
// (w10-rate-limit-pg / w10-rate-limit-order).
vi.mock("@/lib/security/rateLimit/redisLimiter", () => ({ checkRedisRateLimit: vi.fn(async () => null) }));
vi.mock("@/lib/security/rateLimit/postgresLimiter", () => ({ checkPostgresRateLimit: vi.fn(async () => null) }));

import { db } from "@/db";
import { clearEskizTokenCache, redactPhone, sendOtpSms, sendSms } from "@/lib/sms/eskiz";
import { POST as sendOtpHandler } from "@/app/api/auth/otp/send/route";
import { parseSessionCookie, signSessionToken, validateSessionCookie, verifySessionToken } from "@/lib/auth/session";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";

describe("Production High-Load Defensive Hardening - SMS and Edge Runtime", () => {
  describe("SMS OTP Retry Backoff & Fallback", () => {
    beforeEach(() => {
      clearEskizTokenCache();
      vi.spyOn(db, "insert").mockReturnValue({ values: vi.fn().mockResolvedValue([]) } as never);
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
      expect((await sendOtpSms({ phone: "998901234567", code: "654321" })).success).toBe(true);
    });
    it("should redact phone numbers correctly in log helper", () => {
      expect(redactPhone("+998901234567")).toBe("+99890***567");
      expect(redactPhone("998901234567")).toBe("+99890***567");
      expect(redactPhone("+998977654321")).toBe("+99897***321");
      expect(redactPhone("")).toBe("");
    });
    it("should fail closed in production mode when SMS provider is mock or fails", async () => {
      const original = process.env.NODE_ENV;
      const env = process.env as Record<string, string | undefined>;
      try {
        env.NODE_ENV = "production";
        delete process.env.ESKIZ_EMAIL;
        delete process.env.ESKIZ_PASSWORD;
        const request = new Request("http://localhost/api/auth/otp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: "+998901112233", purpose: "login" }) });
        const response = await sendOtpHandler(request);
        expect(response.status).toBe(503);
        const data = await response.json();
        expect(data.error).toBe("SMS xizmatida vaqtincha uzilish yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.");
        expect(data.devCode).toBeUndefined();
      } finally {
        env.NODE_ENV = original;
      }
    });
    it("should strictly gate devCode exposure to development mode", async () => {
      const original = process.env.NODE_ENV;
      const env = process.env as Record<string, string | undefined>;
      try {
        env.NODE_ENV = "development";
        const dev = await sendOtpHandler(new Request("http://localhost/api/auth/otp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: "+998901112244", purpose: "login" }) }));
        expect(dev.status).toBe(200);
        const devData = await dev.json();
        expect(devData.success).toBe(true);
        expect(devData.devCode).toBeDefined();
        env.NODE_ENV = "test";
        const test = await sendOtpHandler(new Request("http://localhost/api/auth/otp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: "+998901112255", purpose: "login" }) }));
        expect(test.status).toBe(200);
        const testData = await test.json();
        expect(testData.success).toBe(true);
        expect(testData.devCode).toBeUndefined();
      } finally {
        env.NODE_ENV = original;
      }
    });
  });

  describe("Edge Runtime Null Check Resilience", () => {
    it("should handle null or invalid session tokens without throwing exceptions", async () => {
      await expect(verifySessionToken(null)).resolves.toBeNull();
      await expect(verifySessionToken(undefined)).resolves.toBeNull();
      await expect(verifySessionToken("")).resolves.toBeNull();
      await expect(verifySessionToken("invalid.token.structure")).resolves.toBeNull();
      await expect(verifySessionToken("malformed_base64!.signature")).resolves.toBeNull();
    });
    it("should sign and verify valid session tokens cleanly", async () => {
      const token = await signSessionToken({ userId: "usr_abc", role: "admin" }, "my_test_secret");
      const verified = await verifySessionToken(token, "my_test_secret");
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
    it("should validate session cookie with null check resilience", async () => {
      const result = await validateSessionCookie(null, "secret", () => null);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("MISSING_TOKEN");
    });
    it("should extract client IP safely with null request or headers", () => {
      expect(getClientIp(null)).toBe("127.0.0.1");
      expect(getClientIp(undefined)).toBe("127.0.0.1");
      expect(getClientIp(new Request("http://localhost", { headers: { "x-forwarded-for": "203.0.113.195, 10.0.0.1" } }))).toBe("203.0.113.195");
    });
    it("should rate limit safely with null or undefined identifiers", async () => {
      const nullResult = await checkRateLimit(null, PRESETS.OTP);
      expect(nullResult).toHaveProperty("success");
      expect(nullResult.limit).toBe(3);
      expect(await checkRateLimit(undefined, PRESETS.OTP)).toHaveProperty("success");
    });
    it("should generate 429 RateLimit response with standard headers", () => {
      const response = createRateLimitResponse({ success: false, limit: 3, remaining: 0, reset: Date.now() + 300000, retryAfterSec: 300 });
      expect(response.status).toBe(429);
      expect(response.headers.get("Retry-After")).toBe("300");
    });
  });
});
