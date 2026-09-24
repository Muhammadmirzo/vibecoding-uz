/**
 * Short-lived, signed, single-use Telegram account-link tokens.
 *
 * Replaces the previous `/start <user-UUID>` deep-link scheme, which let
 * anyone link an arbitrary account by guessing/supplying a user id.
 * Token layout (base64url payload + hex HMAC-SHA256 signature):
 *
 *   base64url("<userId>.<expiresAtMs>.<nonce>") . hex(hmac(secret, payload))
 *
 * Single-use is enforced with a best-effort in-memory consumed-nonce set
 * (sufficient for one instance; rotate/expire quickly via the short TTL).
 * Web-Crypto only, so this module is Edge-runtime compatible.
 */

const consumedNonces = new Map<string, number>();

const TOKEN_TTL_SECONDS = 15 * 60;

function getLinkSecret(configured?: string): string {
  if (configured) return configured;
  const fromEnv =
    process.env.TELEGRAM_LINK_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    throw new Error("TELEGRAM_LINK_SECRET (or SESSION_SECRET) must be configured in production");
  }
  return "dev-only-telegram-link-secret";
}

function base64urlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function hmacHex(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function pruneConsumed(now: number): void {
  for (const [nonce, exp] of consumedNonces) {
    if (exp <= now) consumedNonces.delete(nonce);
  }
}

export interface TelegramLinkTokenOptions {
  secret?: string;
  ttlSeconds?: number;
  now?: number;
}

/** Issues a signed link token for the given user id. */
export async function createTelegramLinkToken(
  userId: string,
  options: TelegramLinkTokenOptions = {}
): Promise<string> {
  if (!userId) throw new Error("createTelegramLinkToken requires a userId");
  const now = options.now ?? Date.now();
  const ttl = options.ttlSeconds ?? TOKEN_TTL_SECONDS;
  const payload = base64urlEncode(`${userId}.${now + ttl * 1000}.${randomNonce()}`);
  const signature = await hmacHex(payload, getLinkSecret(options.secret));
  return `${payload}.${signature}`;
}

export interface VerifiedTelegramLink {
  userId: string;
}

/**
 * Verifies signature + expiry WITHOUT consuming (safe to call for
 * pre-validation). Returns null when invalid or expired.
 */
export async function verifyTelegramLinkToken(
  token: string | null | undefined,
  options: TelegramLinkTokenOptions = {}
): Promise<VerifiedTelegramLink | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [payload, signature] = parts as [string, string];

  const expected = await hmacHex(payload, getLinkSecret(options.secret));
  if (!timingSafeEqualHex(expected, signature.toLowerCase())) return null;

  let decoded: string;
  try {
    decoded = base64urlDecode(payload);
  } catch {
    return null;
  }
  const segments = decoded.split(".");
  if (segments.length !== 3) return null;
  const [userId, expRaw, nonce] = segments as [string, string, string];
  if (!userId || !nonce) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp)) return null;
  const now = options.now ?? Date.now();
  if (now > exp) return null;
  if (consumedNonces.has(nonce)) return null;
  return { userId };
}

/**
 * Verifies signature + expiry AND marks the token single-use.
 * This is the only function handlers should use to redeem a token.
 */
export async function consumeTelegramLinkToken(
  token: string | null | undefined,
  options: TelegramLinkTokenOptions = {}
): Promise<VerifiedTelegramLink | null> {
  const verified = await verifyTelegramLinkToken(token, options);
  if (!verified || !token) return null;
  let nonce: string | null = null;
  try {
    const payload = (token as string).split(".")[0] as string;
    nonce = base64urlDecode(payload).split(".")[2] ?? null;
  } catch {
    return null;
  }
  if (!nonce) return null;
  const now = options.now ?? Date.now();
  pruneConsumed(now);
  if (consumedNonces.has(nonce)) return null;
  // Re-derive expiry for the consumed-entry TTL (best effort).
  let exp = now + TOKEN_TTL_SECONDS * 1000;
  try {
    const payload = (token as string).split(".")[0] as string;
    const parsed = Number(base64urlDecode(payload).split(".")[1]);
    if (Number.isFinite(parsed)) exp = parsed;
  } catch {
    // Keep fallback expiry.
  }
  consumedNonces.set(nonce, exp);
  return verified;
}

/** Test-only: resets the in-memory single-use store. */
export function __resetTelegramLinkTokensForTests(): void {
  consumedNonces.clear();
}
