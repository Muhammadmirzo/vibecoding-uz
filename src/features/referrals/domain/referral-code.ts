import { z } from "zod";

/**
 * Referral code rules (pure, no I/O).
 * A code is the referrer's user UUID first 8 chars, uppercased
 * (see `useReferral`: `user.id.slice(0, 8).toUpperCase()`).
 * UUID chars are hex, so a valid code is 8 hex chars.
 */
export const referralCodeSchema = z
  .string()
  .trim()
  .regex(/^[0-9A-Fa-f]{8}$/, "Referal kod noto'g'ri formatda")
  .transform((code) => code.toUpperCase());

export type ReferralCode = z.infer<typeof referralCodeSchema>;

/** Canonical code for a user id (first 8 chars, uppercased). */
export function codeOfUserId(userId: string): string {
  return userId.slice(0, 8).toUpperCase();
}

/** Extracts the raw `ref_code` cookie value from a Cookie header. */
export function parseRefCodeCookie(cookieHeader: string | null): string {
  if (!cookieHeader) return "";
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === "ref_code") {
      return part.slice(eq + 1).trim();
    }
  }
  return "";
}

/** Set-Cookie value that clears the `ref_code` cookie. */
export function clearRefCodeCookie(): string {
  return "ref_code=; Path=/; Max-Age=0; SameSite=Lax";
}
