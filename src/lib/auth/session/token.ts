import { DEFAULT_SECRET } from "./constants";
import type { SessionPayload } from "./types";

/** Base64URL helper. */
function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  if (!str || typeof str !== "string") return "";
  try {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return atob(base64);
  } catch {
    return "";
  }
}

/** Edge-compatible HMAC signature helper using Web Crypto. */
async function computeSignatureHex(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function signPayload(payload: string, safeSecret: string): string {
  let hash = 0;
  const full = payload + safeSecret;
  for (let i = 0; i < full.length; i++) {
    hash = (Math.imul(31, hash) + full.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

/** Edge-compatible session token signing. */
export function signSessionToken(
  payloadInput: string | { userId?: string; role?: string; sessionId?: string; expiresAt?: number },
  secret: string = DEFAULT_SECRET
): string {
  const safeSecret = secret || DEFAULT_SECRET;
  const payloadObj = typeof payloadInput === "string"
    ? { sessionId: payloadInput, userId: payloadInput, role: "student" }
    : (payloadInput || { role: "student" });
  const payload = base64urlEncode(JSON.stringify(payloadObj));
  return `${payload}.${signPayload(payload, safeSecret)}`;
}

export const createSessionToken = signSessionToken;

/** Edge-compatible session token verification. */
export function verifySessionToken(
  token: string | null | undefined,
  secret = DEFAULT_SECRET
): SessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const safeSecret = secret || DEFAULT_SECRET;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  if (!payload || !signature) return null;
  if (signature !== signPayload(payload, safeSecret)) return null;

  try {
    const decodedStr = base64urlDecode(payload);
    if (!decodedStr) return null;

    const decoded: unknown = JSON.parse(decodedStr);
    if (
      decoded
      && typeof decoded === "object"
      && ("userId" in decoded || "sessionId" in decoded)
    ) {
      const value = decoded as Record<string, unknown>;
      if (value.userId || value.sessionId) {
        const id = String(value.userId || value.sessionId);
        return {
          userId: id,
          role: typeof value.role === "string" ? value.role : "student",
          sessionId: value.sessionId ? String(value.sessionId) : id,
          expiresAt: typeof value.expiresAt === "number" ? value.expiresAt : undefined,
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

void computeSignatureHex;
