import { describe, it, expect } from "vitest";

/**
 * Legacy helper mirror retained for normalization and contact-format coverage.
 * The route now delegates final validation to dedicated Zod schemas in CRM.
 */

const TELEGRAM_USERNAME_REGEX = /^@[A-Za-z0-9_]{3,}$/;
const UZ_PHONE_REGEX = /^\+998[0-9]{9}$/;

const TELEGRAM_USERNAME_ERROR =
  "Telegram username noto'g'ri (@ bilan, min 4 belgi)";
const UZ_PHONE_ERROR =
  "Telefon raqam +998 bilan 12 xonali bo'lishi kerak (masalan +998901234567)";
const LEAD_NAME_ERROR = "Ismingizni to'liq kiriting (min 2 harf)";

function normalizeLeadName(name: unknown): string {
  return typeof name === "string" ? name.trim() : "";
}

function normalizeLeadPhone(phone: unknown): string {
  if (typeof phone !== "string") return "";
  const trimmed = phone.trim();
  if (trimmed.startsWith("@")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("998")) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  if (trimmed.startsWith("+")) return `+${digits}`;
  return digits ? `+${digits}` : trimmed;
}

function validateLeadName(name: string): { ok: true } | { ok: false; error: string } {
  if (name.trim().length >= 2) return { ok: true };
  return { ok: false, error: LEAD_NAME_ERROR };
}

function validateLeadContact(
  phone: string
): { ok: true } | { ok: false; error: string } {
  if (phone.startsWith("@")) {
    if (TELEGRAM_USERNAME_REGEX.test(phone)) return { ok: true };
    return { ok: false, error: TELEGRAM_USERNAME_ERROR };
  }
  if (UZ_PHONE_REGEX.test(phone)) return { ok: true };
  return { ok: false, error: UZ_PHONE_ERROR };
}

describe("free lesson lead normalization & validation", () => {
  it("normalizes spaced/dashed phone to +998901234567", () => {
    expect(normalizeLeadPhone("+99890 123-45-67")).toBe("+998901234567");
  });

  it("prepends +998 to a 9-digit local number", () => {
    expect(normalizeLeadPhone("901234567")).toBe("+998901234567");
  });

  it("keeps a telegram @username as-is", () => {
    expect(normalizeLeadPhone("@Test_User1")).toBe("@Test_User1");
  });

  it("rejects incomplete '+998' with the phone error", () => {
    const normalized = normalizeLeadPhone("+998");
    expect(normalized).toBe("+998");
    const res = validateLeadContact(normalized);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe(UZ_PHONE_ERROR);
  });

  it("rejects too-short '@ab' with the telegram error", () => {
    const res = validateLeadContact(normalizeLeadPhone("@ab"));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe(TELEGRAM_USERNAME_ERROR);
  });

  it("accepts a valid telegram username", () => {
    expect(validateLeadContact(normalizeLeadPhone("@user_123"))).toEqual({
      ok: true,
    });
  });

  it("accepts a valid +998 phone", () => {
    expect(validateLeadContact(normalizeLeadPhone("+998901234567"))).toEqual({
      ok: true,
    });
  });

  it("rejects a short name with the name error", () => {
    const res = validateLeadName(normalizeLeadName(" A "));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toBe(LEAD_NAME_ERROR);
  });

  it("accepts a normal name after trimming", () => {
    expect(validateLeadName(normalizeLeadName("  Ali  "))).toEqual({ ok: true });
  });

  it("handles non-string inputs without throwing", () => {
    expect(normalizeLeadName(undefined)).toBe("");
    expect(normalizeLeadPhone(null)).toBe("");
    expect(validateLeadName(normalizeLeadName(123)).ok).toBe(false);
    expect(validateLeadContact(normalizeLeadPhone(undefined)).ok).toBe(false);
  });
});
