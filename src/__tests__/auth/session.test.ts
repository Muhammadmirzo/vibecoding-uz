import { describe, it, expect } from "vitest";
import {
  signSessionToken,
  verifySessionToken,
  parseSessionCookie,
  validateSessionCookie,
  createSessionCookieHeader,
  createClearSessionCookieHeader,
  type SessionRecord,
} from "../../lib/auth";

describe("Auth Backend Logic - Session Cookie Validation", () => {
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
    expect(parseSessionCookie(`session_token=${token}`)).toBe(token);
    expect(parseSessionCookie(`theme=dark; session_token=${token}; locale=uz`)).toBe(token);
    expect(parseSessionCookie(undefined)).toBeNull();
    expect(parseSessionCookie("other_cookie=value")).toBeNull();
  });

  it("should validate active session cookie successfully", () => {
    const token = signSessionToken(SESSION_ID, SECRET);
    const sessionLookup = (id: string) => (id === SESSION_ID ? dummySession : null);
    const result = validateSessionCookie(`session_token=${token}`, SECRET, sessionLookup, new Date("2026-09-07T12:00:00Z"));
    expect(result.valid).toBe(true);
    expect(result.session).toEqual(dummySession);
  });

  it("should return MISSING_TOKEN error when cookie header is missing", () => {
    const result = validateSessionCookie(undefined, SECRET, () => dummySession);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("MISSING_TOKEN");
  });

  it("should return INVALID_SIGNATURE error for invalid token", () => {
    const result = validateSessionCookie("session_token=invalid.payload.signature", SECRET, () => dummySession);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("INVALID_SIGNATURE");
  });

  it("should return SESSION_NOT_FOUND error when session does not exist in store", () => {
    const token = signSessionToken("unknown-session-id", SECRET);
    const result = validateSessionCookie(`session_token=${token}`, SECRET, () => null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("SESSION_NOT_FOUND");
  });

  it("should return EXPIRED_SESSION error when session expiresAt is past now", () => {
    const token = signSessionToken(SESSION_ID, SECRET);
    const result = validateSessionCookie(`session_token=${token}`, SECRET, () => dummySession, new Date("2026-09-10T12:00:00Z"));
    expect(result.valid).toBe(false);
    expect(result.error).toBe("EXPIRED_SESSION");
  });

  it("should construct valid Set-Cookie header for setting session", () => {
    const header = createSessionCookieHeader("my-token-val", { maxAgeSeconds: 3600, secure: true });
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
