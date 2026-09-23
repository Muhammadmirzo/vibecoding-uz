import { describe, it, expect } from "vitest";
import {
  createOtpRecord,
  generateOtpCode,
  verifyOtpCode,
  hashOtpCode,
  MAX_OTP_ATTEMPTS,
} from "../../lib/auth";
import { checkRateLimit } from "../../lib/security/rateLimit";

describe("Auth Backend Logic - OTP Expiration & Attempt Logic", () => {
  it("should generate a 6-digit numeric OTP code", () => {
    const code = generateOtpCode();
    expect(code).toMatch(/^[0-9]{6}$/);
  });

  it("should create an OTP record with default 5-minute TTL", () => {
    const now = new Date("2026-09-07T12:00:00Z");
    const { code, record } = createOtpRecord({ phone: "+998901234567", purpose: "login", now });
    expect(code).toMatch(/^[0-9]{6}$/);
    expect(record.phone).toBe("+998901234567");
    expect(record.purpose).toBe("login");
    expect(record.attempts).toBe(0);
    expect(record.usedAt).toBeNull();
    expect(record.createdAt).toEqual(now);
    expect(record.expiresAt.getTime()).toBe(now.getTime() + 5 * 60 * 1000);
    expect(record.codeHash).toBe(hashOtpCode(code));
  });

  it("should verify correct OTP code before expiration", () => {
    const now = new Date("2026-09-07T12:00:00Z");
    const { code, record } = createOtpRecord({ phone: "+998901234567", purpose: "login", code: "123456", now });
    const result = verifyOtpCode(record, code, new Date("2026-09-07T12:02:00Z"));
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.updatedRecord.usedAt).toEqual(new Date("2026-09-07T12:02:00Z"));
  });

  it("should increment attempt count and return INVALID_CODE on wrong code", () => {
    const now = new Date("2026-09-07T12:00:00Z");
    const { record } = createOtpRecord({ phone: "+998901234567", purpose: "login", code: "123456", now });
    const result = verifyOtpCode(record, "999999", now);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("INVALID_CODE");
    expect(result.updatedRecord.attempts).toBe(1);
  });

  it("should enforce MAX_ATTEMPTS_EXCEEDED when attempt threshold is reached", () => {
    const now = new Date("2026-09-07T12:00:00Z");
    const { record } = createOtpRecord({ phone: "+998901234567", purpose: "login", code: "123456", now });
    let currentRecord = record;
    for (let i = 1; i <= MAX_OTP_ATTEMPTS; i++) {
      const result = verifyOtpCode(currentRecord, "000000", now);
      currentRecord = result.updatedRecord;
      if (i < MAX_OTP_ATTEMPTS) expect(result.error).toBe("INVALID_CODE");
      else expect(result.error).toBe("MAX_ATTEMPTS_EXCEEDED");
    }
    expect(currentRecord.attempts).toBe(MAX_OTP_ATTEMPTS);
    const lockedResult = verifyOtpCode(currentRecord, "123456", now);
    expect(lockedResult.valid).toBe(false);
    expect(lockedResult.error).toBe("MAX_ATTEMPTS_EXCEEDED");
  });

  it("should reject verification when OTP has EXPIRED", () => {
    const now = new Date("2026-09-07T12:00:00Z");
    const { code, record } = createOtpRecord({ phone: "+998901234567", purpose: "login", code: "123456", ttlMinutes: 5, now });
    const result = verifyOtpCode(record, code, new Date("2026-09-07T12:06:00Z"));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("EXPIRED");
  });

  it("should reject verification when OTP is ALREADY_USED", () => {
    const now = new Date("2026-09-07T12:00:00Z");
    const { code, record } = createOtpRecord({ phone: "+998901234567", purpose: "login", code: "123456", now });
    const first = verifyOtpCode(record, code, now);
    expect(first.valid).toBe(true);
    const second = verifyOtpCode(first.updatedRecord, code, now);
    expect(second.valid).toBe(false);
    expect(second.error).toBe("ALREADY_USED");
  });
});

describe("Auth Backend Logic - OTP Rate Limiting & Phone Security", () => {
  it("should allow up to 3 OTP requests per 5 minutes per phone number and block the 4th", async () => {
    const config = { limit: 3, windowSeconds: 300, prefix: "otp_test_phone" };
    const key = "phone:+998909998877";
    const res1 = await checkRateLimit(key, config);
    const res2 = await checkRateLimit(key, config);
    const res3 = await checkRateLimit(key, config);
    const res4 = await checkRateLimit(key, config);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
    expect(res4.success).toBe(false);
    expect(res4.remaining).toBe(0);
    expect(res4.retryAfterSec).toBeGreaterThan(0);
  });

  it("should enforce IP rate limiting for OTP requests independently", async () => {
    const config = { limit: 3, windowSeconds: 300, prefix: "otp_test_ip" };
    const res1 = await checkRateLimit("192.168.99.1", config);
    const res2 = await checkRateLimit("192.168.99.1", config);
    const res3 = await checkRateLimit("192.168.99.1", config);
    const res4 = await checkRateLimit("192.168.99.1", config);
    expect(res1.success).toBe(true);
    expect(res2.success).toBe(true);
    expect(res3.success).toBe(true);
    expect(res4.success).toBe(false);
  });
});
