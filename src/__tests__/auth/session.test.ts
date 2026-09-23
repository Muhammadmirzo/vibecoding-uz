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

  it("should sign and verify session tokens correctly", async () => {
    const token = await signSessionToken(SESSION_ID, SECRET);
    expect(token).toBeTypeOf("string");
    const payload = await verifySessionToken(token, SECRET);
    expect(payload).not.toBeNull();
    expect(payload?.sessionId).toBe(SESSION_ID);
  });

  it("should return null for tampered session token signature", async () => {
    const token = await signSessionToken(SESSION_ID, SECRET);
    const tampered = token.slice(0, -5) + "abcde";
    await expect(verifySessionToken(tampered, SECRET)).resolves.toBeNull();
    await expect(verifySessionToken(token, "wrong-secret")).resolves.toBeNull();
    await expect(verifySessionToken("invalid.token.format", SECRET)).resolves.toBeNull();
  });

  it("should parse session cookie from Cookie header string", async () => {
    const token = await signSessionToken(SESSION_ID, SECRET);
    expect(parseSessionCookie(`session_token=${token}`)).toBe(token);
    expect(parseSessionCookie(`theme=dark; session_token=${token}; locale=uz`)).toBe(token);
    expect(parseSessionCookie(undefined)).toBeNull();
    expect(parseSessionCookie("other_cookie=value")).toBeNull();
  });

  it("should validate active session cookie successfully", async () => {
    const token = await signSessionToken(SESSION_ID, SECRET);
    const sessionLookup = (id: string) => (id === SESSION_ID ? dummySession : null);
    const result = await validateSessionCookie(
      `session_token=${token}`,
      SECRET,
      sessionLookup,
      new Date("2026-09-07T12:00:00Z")
    );
    expect(result.valid).toBe(true);
    expect(result.session).toEqual(dummySession);
  });

  it("should return MISSING_TOKEN error when cookie header is missing", async () => {
    const result = await validateSessionCookie(undefined, SECRET, () => dummySession);
    expect(result.error).toBe("MISSING_TOKEN");
  });

  it("should return INVALID_SIGNATURE error for invalid token", async () => {
    const result = await validateSessionCookie(
      "session_token=invalid.payload.signature",
      SECRET,
      () => dummySession
    );
    expect(result.error).toBe("INVALID_SIGNATURE");
  });

  it("should return SESSION_NOT_FOUND when session is absent from storage", async () => {
    const token = await signSessionToken("unknown-session-id", SECRET);
    const result = await validateSessionCookie(`session_token=${token}`, SECRET, () => null);
    expect(result.error).toBe("SESSION_NOT_FOUND");
  });

  it("should return EXPIRED_SESSION when the stored session has expired", async () => {
    const token = await signSessionToken(SESSION_ID, SECRET);
    const result = await validateSessionCookie(
      `session_token=${token}`,
      SECRET,
      () => dummySession,
      new Date("2026-09-10T12:00:00Z")
    );
    expect(result.error).toBe("EXPIRED_SESSION");
  });

  it("should construct valid Set-Cookie headers", () => {
    const header = createSessionCookieHeader("my-token-val", { maxAgeSeconds: 3600, secure: true });
    expect(header).toContain("session_token=my-token-val");
    expect(header).toContain("Path=/");
    expect(header).toContain("Max-Age=3600");
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(header).toContain("SameSite=Lax");

    const clearHeader = createClearSessionCookieHeader();
    expect(clearHeader).toContain("session_token=");
    expect(clearHeader).toContain("Max-Age=0");
    expect(clearHeader).toContain("Expires=Thu, 01 Jan 1970");
  });
});
