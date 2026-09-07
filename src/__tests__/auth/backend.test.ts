import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateOtpCode,
  createOtpRecord,
  verifyOtpCode,
  hashOtpCode,
  MAX_OTP_ATTEMPTS,
  signSessionToken,
  verifySessionToken,
  parseSessionCookie,
  validateSessionCookie,
  createSessionCookieHeader,
  createClearSessionCookieHeader,
  SessionRecord,
} from "../../lib/auth";
import { checkRateLimit } from "../../lib/security/rateLimit";


describe("Auth Backend Logic", () => {
  describe("Password Hashing & Verification", () => {
    it("should hash password into salt:hash format", async () => {
      const password = "SuperSecretPassword123!";
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash).toContain(":");
      const [salt, hexHash] = hash.split(":");
      expect(salt.length).toBe(32); // 16 bytes hex encoded = 32 chars
      expect(hexHash.length).toBe(128); // 64 bytes sha512 hex = 128 chars
    });

    it("should generate different hashes for the same password due to random salt", async () => {
      const password = "SamePassword123";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it("should verify correct password successfully", async () => {
      const password = "MySecurePassword2026";
      const hash = await hashPassword(password);
      const isMatch = await verifyPassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "MySecurePassword2026";
      const hash = await hashPassword(password);
      const isMatch = await verifyPassword("WrongPassword123", hash);

      expect(isMatch).toBe(false);
    });

    it("should return false for empty or null inputs", async () => {
      const hash = await hashPassword("validPassword");
      expect(await verifyPassword("", hash)).toBe(false);
      expect(await verifyPassword("validPassword", "")).toBe(false);
    });

    it("should handle malformed stored hashes gracefully", async () => {
      expect(await verifyPassword("password", "invalidhashformat")).toBe(false);
      expect(await verifyPassword("password", "salt:")).toBe(false);
      expect(await verifyPassword("password", ":hash")).toBe(false);
      expect(await verifyPassword("password", "salt:hash:extra")).toBe(false);
      expect(await verifyPassword("password", "salt:invalidhexg00d")).toBe(false);
    });

    it("should throw error when hashing empty password", async () => {
      await expect(hashPassword("")).rejects.toThrow("Password must not be empty");
    });
  });

  describe("OTP Expiration & Attempt Logic", () => {
    it("should generate a 6-digit numeric OTP code", () => {
      const code = generateOtpCode();
      expect(code).toMatch(/^[0-9]{6}$/);
    });

    it("should create an OTP record with default 5-minute TTL", () => {
      const now = new Date("2026-09-07T12:00:00Z");
      const { code, record } = createOtpRecord({
        phone: "+998901234567",
        purpose: "login",
        now,
      });

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
      const { code, record } = createOtpRecord({
        phone: "+998901234567",
        purpose: "login",
        code: "123456",
        now,
      });

      const verifyTime = new Date("2026-09-07T12:02:00Z");
      const result = verifyOtpCode(record, code, verifyTime);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.updatedRecord.usedAt).toEqual(verifyTime);
    });

    it("should increment attempt count and return INVALID_CODE on wrong code", () => {
      const now = new Date("2026-09-07T12:00:00Z");
      const { record } = createOtpRecord({
        phone: "+998901234567",
        purpose: "login",
        code: "123456",
        now,
      });

      const result = verifyOtpCode(record, "999999", now);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("INVALID_CODE");
      expect(result.updatedRecord.attempts).toBe(1);
    });

    it("should enforce MAX_ATTEMPTS_EXCEEDED when attempt threshold is reached", () => {
      const now = new Date("2026-09-07T12:00:00Z");
      const { record } = createOtpRecord({
        phone: "+998901234567",
        purpose: "login",
        code: "123456",
        now,
      });

      let currentRecord = record;
      for (let i = 1; i <= MAX_OTP_ATTEMPTS; i++) {
        const res = verifyOtpCode(currentRecord, "000000", now);
        currentRecord = res.updatedRecord;
        if (i < MAX_OTP_ATTEMPTS) {
          expect(res.error).toBe("INVALID_CODE");
        } else {
          expect(res.error).toBe("MAX_ATTEMPTS_EXCEEDED");
        }
      }

      expect(currentRecord.attempts).toBe(MAX_OTP_ATTEMPTS);

      // Any further attempt (even with correct code) fails with MAX_ATTEMPTS_EXCEEDED
      const lockedResult = verifyOtpCode(currentRecord, "123456", now);
      expect(lockedResult.valid).toBe(false);
      expect(lockedResult.error).toBe("MAX_ATTEMPTS_EXCEEDED");
    });

    it("should reject verification when OTP has EXPIRED", () => {
      const now = new Date("2026-09-07T12:00:00Z");
      const { code, record } = createOtpRecord({
        phone: "+998901234567",
        purpose: "login",
        code: "123456",
        ttlMinutes: 5,
        now,
      });

      const expiredTime = new Date("2026-09-07T12:06:00Z"); // 6 mins later
      const result = verifyOtpCode(record, code, expiredTime);

      expect(result.valid).toBe(false);
      expect(result.error).toBe("EXPIRED");
    });

    it("should reject verification when OTP is ALREADY_USED", () => {
      const now = new Date("2026-09-07T12:00:00Z");
      const { code, record } = createOtpRecord({
        phone: "+998901234567",
        purpose: "login",
        code: "123456",
        now,
      });

      // First verification succeeds
      const firstResult = verifyOtpCode(record, code, now);
      expect(firstResult.valid).toBe(true);

      // Second verification attempt on used record
      const secondResult = verifyOtpCode(firstResult.updatedRecord, code, now);
      expect(secondResult.valid).toBe(false);
      expect(secondResult.error).toBe("ALREADY_USED");
    });
  });

  describe("OTP Rate Limiting & Phone Security", () => {
    it("should allow up to 3 OTP requests per 5 minutes per phone number and block the 4th", async () => {
      const phoneKey = "phone:+998909998877";
      const config = { limit: 3, windowSeconds: 300, prefix: "otp_test_phone" };

      const res1 = await checkRateLimit(phoneKey, config);
      const res2 = await checkRateLimit(phoneKey, config);
      const res3 = await checkRateLimit(phoneKey, config);
      const res4 = await checkRateLimit(phoneKey, config);

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
      const ipKey = "192.168.99.1";
      const config = { limit: 3, windowSeconds: 300, prefix: "otp_test_ip" };

      const res1 = await checkRateLimit(ipKey, config);
      const res2 = await checkRateLimit(ipKey, config);
      const res3 = await checkRateLimit(ipKey, config);
      const res4 = await checkRateLimit(ipKey, config);

      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
      expect(res3.success).toBe(true);
      expect(res4.success).toBe(false);
    });
  });

  describe("Session Cookie Validation", () => {
    const SECRET = "super-secret-key-12345";
    const SESSION_ID = "session-uuid-98765";

    const dummySession: SessionRecord = {
      id: SESSION_ID,
      userId: "user-uuid-11111",
      role: "student",
      expiresAt: new Date("2026-09-08T12:00:00Z"),
    };

    it("should sign and verify session tokens correctly", () => {
      const token = signSessionToken(SESSION_ID, SECRET);
      expect(token).toBeTypeOf("string");

      const payload = verifySessionToken(token, SECRET);
      expect(payload).not.toBeNull();
      expect(payload?.sessionId).toBe(SESSION_ID);
    });

    it("should return null for tampered session token signature", () => {
      const token = signSessionToken(SESSION_ID, SECRET);
      const tampered = token.slice(0, -5) + "abcde";

      expect(verifySessionToken(tampered, SECRET)).toBeNull();
      expect(verifySessionToken(token, "wrong-secret")).toBeNull();
      expect(verifySessionToken("invalid.token.format", SECRET)).toBeNull();
    });

    it("should parse session cookie from Cookie header string", () => {
      const token = signSessionToken(SESSION_ID, SECRET);

      const header1 = `session_token=${token}`;
      expect(parseSessionCookie(header1)).toBe(token);

      const header2 = `theme=dark; session_token=${token}; locale=uz`;
      expect(parseSessionCookie(header2)).toBe(token);

      expect(parseSessionCookie(undefined)).toBeNull();
      expect(parseSessionCookie("other_cookie=value")).toBeNull();
    });

    it("should validate active session cookie successfully", () => {
      const token = signSessionToken(SESSION_ID, SECRET);
      const cookieHeader = `session_token=${token}`;
      const now = new Date("2026-09-07T12:00:00Z");

      const sessionLookup = (id: string) => (id === SESSION_ID ? dummySession : null);

      const result = validateSessionCookie(cookieHeader, SECRET, sessionLookup, now);
      expect(result.valid).toBe(true);
      expect(result.session).toEqual(dummySession);
    });

    it("should return MISSING_TOKEN error when cookie header is missing", () => {
      const sessionLookup = () => dummySession;
      const result = validateSessionCookie(undefined, SECRET, sessionLookup);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("MISSING_TOKEN");
    });

    it("should return INVALID_SIGNATURE error for invalid token", () => {
      const cookieHeader = "session_token=invalid.payload.signature";
      const sessionLookup = () => dummySession;

      const result = validateSessionCookie(cookieHeader, SECRET, sessionLookup);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("INVALID_SIGNATURE");
    });

    it("should return SESSION_NOT_FOUND error when session does not exist in store", () => {
      const token = signSessionToken("unknown-session-id", SECRET);
      const cookieHeader = `session_token=${token}`;
      const sessionLookup = () => null;

      const result = validateSessionCookie(cookieHeader, SECRET, sessionLookup);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("SESSION_NOT_FOUND");
    });

    it("should return EXPIRED_SESSION error when session expiresAt is past now", () => {
      const token = signSessionToken(SESSION_ID, SECRET);
      const cookieHeader = `session_token=${token}`;
      const futureNow = new Date("2026-09-10T12:00:00Z"); // past session.expiresAt

      const sessionLookup = (id: string) => (id === SESSION_ID ? dummySession : null);

      const result = validateSessionCookie(cookieHeader, SECRET, sessionLookup, futureNow);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("EXPIRED_SESSION");
    });

    it("should construct valid Set-Cookie header for setting session", () => {
      const token = "my-token-val";
      const header = createSessionCookieHeader(token, {
        maxAgeSeconds: 3600,
        secure: true,
      });

      expect(header).toContain("session_token=my-token-val");
      expect(header).toContain("Path=/");
      expect(header).toContain("Max-Age=3600");
      expect(header).toContain("HttpOnly");
      expect(header).toContain("Secure");
      expect(header).toContain("SameSite=Lax");
    });

    it("should construct valid Set-Cookie header for clearing session", () => {
      const clearHeader = createClearSessionCookieHeader();
      expect(clearHeader).toContain("session_token=");
      expect(clearHeader).toContain("Max-Age=0");
      expect(clearHeader).toContain("Expires=Thu, 01 Jan 1970");
    });
  });
});
