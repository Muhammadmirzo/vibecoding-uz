import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  createSessionCookieHeader,
  createClearSessionCookieHeader,
  parseSessionCookie,
} from "@/lib/auth/session/cookie";
import { generateOtpCode, createOtpRecord, verifyOtpCode } from "@/lib/auth/otp";
import { isCronAuthorized } from "@/lib/security/cron";
import {
  SECURITY_HEADERS,
  isOriginAllowed,
  passesCsrfCheck,
  verifyWebhookSecret,
  getRequestHost,
} from "@/lib/security/headers";
import {
  createTelegramLinkToken,
  verifyTelegramLinkToken,
  consumeTelegramLinkToken,
  __resetTelegramLinkTokensForTests,
} from "@/lib/telegram/linkToken";
import { isContactOwnedBySender } from "@/lib/telegram/handlers/contact";
import { PRESETS } from "@/lib/security/rateLimit";

const SECRET = "w1-sec-test-secret-with-enough-entropy";

function req(url: string, init?: RequestInit): Request {
  return new Request(url, init);
}

describe("W1-SEC: session cookies", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("defaults Secure in production, not in development", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(createSessionCookieHeader("tok")).toContain("; Secure");
    expect(createClearSessionCookieHeader()).toContain("; Secure");
    vi.stubEnv("NODE_ENV", "development");
    expect(createSessionCookieHeader("tok")).not.toContain("; Secure");
  });

  it("clear-cookie header expires immediately with consistent Path", () => {
    const header = createClearSessionCookieHeader();
    expect(header).toContain("Max-Age=0");
    expect(header).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(header).toContain("Path=/");
    expect(header).toContain("HttpOnly");
  });

  it("round-trips the token through parse", () => {
    const header = createSessionCookieHeader("abc.def");
    expect(parseSessionCookie(header)).toBe("abc.def");
    expect(parseSessionCookie(null)).toBeNull();
  });
});

describe("W1-SEC: OTP uses CSPRNG (no Math.random)", () => {
  it("generates 6-digit codes with variation", () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateOtpCode()));
    expect(codes.size).toBeGreaterThan(40);
    for (const code of codes) expect(code).toMatch(/^\d{6}$/);
  });

  it("create/verify OTP record round-trip", () => {
    const { code, record } = createOtpRecord({ phone: "+998901234567", purpose: "login" });
    const ok = verifyOtpCode({ ...record, attempts: 0 }, code);
    expect(ok.valid).toBe(true);
  });

  it("otp/send route no longer uses Math.random", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/api/auth/otp/send/route.ts"),
      "utf8"
    );
    expect(src).not.toContain("Math.random");
    expect(src).toContain("randomInt");
  });
});

describe("W1-SEC: cron fails closed", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("denies when CRON_SECRET is missing", () => {
    vi.stubEnv("CRON_SECRET", "");
    delete process.env.CRON_SECRET;
    expect(isCronAuthorized(req("https://x.test/api/cron/reminders"))).toBe(false);
  });

  it("accepts Bearer match, rejects mismatch", () => {
    vi.stubEnv("CRON_SECRET", "s3cret");
    const ok = req("https://x.test/api/cron/reminders", {
      headers: { authorization: "Bearer s3cret" },
    });
    const bad = req("https://x.test/api/cron/reminders", {
      headers: { authorization: "Bearer wrong" },
    });
    const none = req("https://x.test/api/cron/reminders");
    expect(isCronAuthorized(ok)).toBe(true);
    expect(isCronAuthorized(bad)).toBe(false);
    expect(isCronAuthorized(none)).toBe(false);
  });

  it("cron route delegates to the fail-closed helper", () => {
    const src = readFileSync(
      join(process.cwd(), "src/app/api/cron/reminders/route.ts"),
      "utf8"
    );
    expect(src).toContain("isCronAuthorized");
    expect(src).not.toMatch(/if\s*\(!cronSecret\)\s*return\s*true/);
  });
});

describe("W1-SEC: webhook secret + CSRF helpers", () => {
  it("verifyWebhookSecret compares constant-time style", () => {
    expect(verifyWebhookSecret("abc", "abc")).toBe(true);
    expect(verifyWebhookSecret("abc", "abd")).toBe(false);
    expect(verifyWebhookSecret("abc", "abcd")).toBe(false);
    expect(verifyWebhookSecret(null, "abc")).toBe(false);
    expect(verifyWebhookSecret("abc", undefined)).toBe(false);
  });

  it("isOriginAllowed enforces same-host when Origin present", () => {
    expect(isOriginAllowed(null, "app.test")).toBe(true);
    expect(isOriginAllowed("https://app.test", "app.test")).toBe(true);
    expect(isOriginAllowed("https://evil.test", "app.test")).toBe(false);
    expect(isOriginAllowed("not-a-url", "app.test")).toBe(false);
    expect(isOriginAllowed("https://app.test", null)).toBe(false);
  });

  it("passesCsrfCheck honours Origin vs Host headers", () => {
    const same = req("https://app.test/api/admin/leads", {
      method: "POST",
      headers: { host: "app.test", origin: "https://app.test" },
    });
    const cross = req("https://app.test/api/admin/leads", {
      method: "POST",
      headers: { host: "app.test", origin: "https://evil.test" },
    });
    expect(passesCsrfCheck(same)).toBe(true);
    expect(passesCsrfCheck(cross)).toBe(false);
    expect(getRequestHost(same)).toBe("app.test");
  });
});

describe("W1-SEC: security headers", () => {
  it("defines CSP compatible with next/font + Telegram widget", () => {
    const csp = SECURITY_HEADERS["Content-Security-Policy"];
    expect(csp).toContain("https://telegram.org");
    expect(csp).toContain("https://oauth.telegram.org");
    expect(csp).toContain("https://fonts.googleapis.com");
    expect(csp).toContain("https://fonts.gstatic.com");
    expect(csp).toContain("object-src 'none'");
    expect(SECURITY_HEADERS["X-Frame-Options"]).toBe("DENY");
    expect(SECURITY_HEADERS["Strict-Transport-Security"]).toContain("max-age=");
    expect(SECURITY_HEADERS["Referrer-Policy"]).toBeTruthy();
    expect(SECURITY_HEADERS["Permissions-Policy"]).toBeTruthy();
    expect(SECURITY_HEADERS["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("middleware applies shared headers to every response", () => {
    const src = readFileSync(join(process.cwd(), "src/middleware.ts"), "utf8");
    expect(src).toContain("SECURITY_HEADERS");
    expect(src).toContain("withSecurityHeaders");
  });

  it("next.config sets headers, poweredByHeader:false, pinned images, 2mb actions", () => {
    const src = readFileSync(join(process.cwd(), "next.config.mjs"), "utf8");
    expect(src).toContain("Content-Security-Policy");
    expect(src).toContain("X-Frame-Options");
    expect(src).toContain("Strict-Transport-Security");
    expect(src).toContain("poweredByHeader: false");
    expect(src).not.toContain("hostname: '**'");
    expect(src).toContain("bodySizeLimit: '2mb'");
  });
});

describe("W1-SEC: Telegram link tokens (signed, short-lived, single-use)", () => {
  afterEach(() => __resetTelegramLinkTokensForTests());

  it("round-trips a token for the right user", async () => {
    const token = await createTelegramLinkToken("user-uuid-1", { secret: SECRET });
    await expect(verifyTelegramLinkToken(token, { secret: SECRET })).resolves.toEqual({
      userId: "user-uuid-1",
    });
  });

  it("rejects tampered payloads and wrong secrets", async () => {
    const token = await createTelegramLinkToken("user-uuid-1", { secret: SECRET });
    const [payload, sig] = token.split(".");
    const tampered = `${payload.slice(0, -2)}xx.${sig}`;
    await expect(verifyTelegramLinkToken(tampered, { secret: SECRET })).resolves.toBeNull();
    await expect(verifyTelegramLinkToken(token, { secret: "other" })).resolves.toBeNull();
  });

  it("rejects expired tokens", async () => {
    const token = await createTelegramLinkToken("user-uuid-1", {
      secret: SECRET,
      ttlSeconds: 60,
      now: 1_000_000,
    });
    await expect(
      verifyTelegramLinkToken(token, { secret: SECRET, now: 1_000_000 + 61_000 })
    ).resolves.toBeNull();
  });

  it("consume is single-use", async () => {
    const token = await createTelegramLinkToken("user-uuid-1", { secret: SECRET });
    await expect(consumeTelegramLinkToken(token, { secret: SECRET })).resolves.toEqual({
      userId: "user-uuid-1",
    });
    await expect(consumeTelegramLinkToken(token, { secret: SECRET })).resolves.toBeNull();
  });

  it("rejects legacy raw-UUID deep links", async () => {
    await expect(
      verifyTelegramLinkToken("123e4567-e89b-12d3-a456-426614174000", { secret: SECRET })
    ).resolves.toBeNull();
  });
});

describe("W1-SEC: Telegram contact ownership", () => {
  it("requires contact.user_id === sender id", () => {
    expect(isContactOwnedBySender(123, 123)).toBe(true);
    expect(isContactOwnedBySender("123", 123)).toBe(true);
    expect(isContactOwnedBySender(999, 123)).toBe(false);
    expect(isContactOwnedBySender(undefined, 123)).toBe(false);
    expect(isContactOwnedBySender(null, 123)).toBe(false);
  });
});

describe("W1-SEC: rate-limit presets cover public writes + webhooks", () => {
  it("exposes presets for apply/checkout/referral/search/webhook", () => {
    for (const key of ["OTP", "LOGIN", "QUIZ", "PUBLIC_WRITE", "WEBHOOK", "CHECKOUT", "REFERRAL", "SEARCH"] as const) {
      expect(PRESETS[key].limit).toBeGreaterThan(0);
      expect(PRESETS[key].windowSeconds).toBeGreaterThan(0);
    }
  });
});
