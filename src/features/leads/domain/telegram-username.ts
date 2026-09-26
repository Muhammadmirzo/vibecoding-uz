/**
 * Telegram username rules (pure, no I/O).
 *
 * Visitors type `@ali` or `ali` — both are the same handle, so the client and
 * the server agree on one canonical form: a leading `@` plus 3–32 characters of
 * `[A-Za-z0-9_]`. Telegram itself allows 5–32, but we keep 3 for backwards
 * compatibility with the existing Zod schema.
 */
const TELEGRAM_HANDLE = /^[A-Za-z0-9_]{3,32}$/;

/** Strips spaces and a leading `@`; returns "" for anything unusable. */
export function normalizeTelegramUsername(value: unknown): string {
  if (typeof value !== "string") return "";
  const cleaned = value.trim().replace(/\s+/g, "").replace(/^@+/, "");
  return TELEGRAM_HANDLE.test(cleaned) ? `@${cleaned}` : "";
}

/** Accepts a handle with or without the leading `@`. */
export function isValidTelegramUsername(value: string): boolean {
  return normalizeTelegramUsername(value) !== "";
}

/** The stored form of a value that came from a form field or a phone column. */
export function canonicalTelegramContact(value: unknown): string {
  const username = normalizeTelegramUsername(value);
  if (username) return username;
  return typeof value === "string" ? value.trim() : "";
}
