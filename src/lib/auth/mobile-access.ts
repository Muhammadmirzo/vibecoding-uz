/**
 * Short-lived mobile access tokens: signed JWT (HS256-style HMAC-SHA256),
 * Edge-safe (WebCrypto only). Never put secrets or PII in the payload.
 */

export const MOBILE_TOKEN_AUDIENCE = "naqsh-mobile";
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export interface MobileAccessPayload {
  sub: string;
  role: string;
  sid: string;
  aud: string;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.API_JWT_SECRET || process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("API_JWT_SECRET or SESSION_SECRET must be configured in production");
  }
  return "dev-only-mobile-secret-change-me";
}

function b64urlEncode(data: Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(payload: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

function timingSafeEqualHex(expected: Uint8Array, suppliedHex: string): boolean {
  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected[i] ^ Number.parseInt(suppliedHex.slice(i * 2, i * 2 + 2), 16);
  }
  return diff === 0;
}

export type AccessTokenError = "MISSING" | "BAD_SHAPE" | "BAD_SIGNATURE" | "EXPIRED" | "WRONG_AUD";

export async function signAccessToken(input: { userId: string; role: string; sessionId: string }): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: MobileAccessPayload = {
    sub: input.userId, role: input.role, sid: input.sessionId,
    aud: MOBILE_TOKEN_AUDIENCE, iat: nowSec, exp: nowSec + ACCESS_TOKEN_TTL_SECONDS,
  };
  const header = b64urlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64urlEncode(JSON.stringify(payload));
  const sig = await hmac(`${header}.${body}`, getSecret());
  const hex = Array.from(sig, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${header}.${body}.${hex}`;
}

export async function verifyAccessToken(token: string | null | undefined): Promise<{ payload: MobileAccessPayload } | { error: AccessTokenError }> {
  if (!token) return { error: "MISSING" };
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return { error: "BAD_SHAPE" };
  const [header, body, signature] = parts as [string, string, string];
  try {
    const expected = await hmac(`${header}.${body}`, getSecret());
    if (!timingSafeEqualHex(expected, signature)) return { error: "BAD_SIGNATURE" };
    const decoded = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as Partial<MobileAccessPayload>;
    if (decoded.aud !== MOBILE_TOKEN_AUDIENCE) return { error: "WRONG_AUD" };
    if (typeof decoded.sub !== "string" || !decoded.sub) return { error: "BAD_SHAPE" };
    if (typeof decoded.sid !== "string" || !decoded.sid) return { error: "BAD_SHAPE" };
    if (typeof decoded.exp !== "number" || Date.now() / 1000 > decoded.exp) return { error: "EXPIRED" };
    return {
      payload: {
        sub: decoded.sub, role: typeof decoded.role === "string" ? decoded.role : "student",
        sid: decoded.sid, aud: MOBILE_TOKEN_AUDIENCE,
        iat: typeof decoded.iat === "number" ? decoded.iat : 0, exp: decoded.exp,
      },
    };
  } catch {
    return { error: "BAD_SHAPE" };
  }
}

/** Extracts a bearer token from an Authorization header (constant-shape, no throw). */
export function parseBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer ([A-Za-z0-9\-_.~+/=]+)$/.exec(header.trim());
  return match?.[1] ? match[1].trim() || null : null;
}
