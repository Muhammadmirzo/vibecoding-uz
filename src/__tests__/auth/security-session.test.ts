import { afterEach, describe, expect, it, vi } from "vitest";
import { signSessionToken, verifySessionToken } from "../../lib/auth/session";

const CURRENT_SECRET = "current-test-secret-with-enough-entropy";
const OLD_FALLBACK_SECRET = ["super-secret-random-key", "change-in-production-32chars"].join("-");

describe("Session token security", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("verifies a valid HMAC-signed token", async () => {
    const expiresAt = Date.now() + 60_000;
    const token = await signSessionToken(
      { userId: "user-1", sessionId: "session-1", role: "admin", expiresAt },
      CURRENT_SECRET
    );

    await expect(verifySessionToken(token, CURRENT_SECRET)).resolves.toMatchObject({
      userId: "user-1",
      sessionId: "session-1",
      role: "admin",
    });
  });

  it("rejects a tampered payload", async () => {
    const token = await signSessionToken(
      { userId: "user-1", role: "student", expiresAt: Date.now() + 60_000 },
      CURRENT_SECRET
    );
    const [payload, signature] = token.split(".");
    const decode = (value: string): string => atob(value.replace(/-/g, "+").replace(/_/g, "/"));
    const encodedPayload = decode(payload);
    const changedPayload = encodedPayload.replace('"role":"student"', '"role":"admin"');
    expect(changedPayload).not.toBe(encodedPayload);
    const tamperedPayload = btoa(changedPayload)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await expect(verifySessionToken(`${tamperedPayload}.${signature}`, CURRENT_SECRET)).resolves.toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signSessionToken(
      { userId: "user-1", expiresAt: Date.now() + 60_000 },
      CURRENT_SECRET
    );

    await expect(verifySessionToken(token, "wrong-test-secret")).resolves.toBeNull();
  });

  it("rejects an expired token inside token verification", async () => {
    const token = await signSessionToken(
      { userId: "user-1", expiresAt: Date.now() - 1 },
      CURRENT_SECRET
    );

    await expect(verifySessionToken(token, CURRENT_SECRET)).resolves.toBeNull();
  });

  it("rejects a token signed with the known old fallback secret", async () => {
    const token = await signSessionToken(
      { userId: "admin", role: "admin", expiresAt: Date.now() + 60_000 },
      OLD_FALLBACK_SECRET
    );

    await expect(verifySessionToken(token, CURRENT_SECRET)).resolves.toBeNull();
  });

  it("throws at module initialization when production has no configured secret", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "");
    vi.stubEnv("NEXTAUTH_SECRET", "");

    await expect(import("../../lib/auth/session/constants")).rejects.toThrow(
      /must be configured in production/
    );
  });
});
