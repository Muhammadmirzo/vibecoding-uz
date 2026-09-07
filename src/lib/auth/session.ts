import { cookies } from "next/headers";

export const DEFAULT_SESSION_COOKIE_NAME = "session_token";
export const SESSION_COOKIE_NAME = DEFAULT_SESSION_COOKIE_NAME;
export const DEFAULT_SESSION_TTL_HOURS = 24;

export interface SessionPayload {
  userId: string;
  role: string;
  sessionId?: string;
  expiresAt?: number;
}

export interface SessionRecord {
  id: string;
  userId: string;
  role: string;
  device?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
}

export type SessionValidationError =
  | "MISSING_TOKEN"
  | "INVALID_SIGNATURE"
  | "EXPIRED_SESSION"
  | "SESSION_NOT_FOUND";

export interface SessionValidationResult {
  valid: boolean;
  error?: SessionValidationError;
  session?: SessionRecord;
}

const DEFAULT_SECRET = process.env.NEXTAUTH_SECRET || "super-secret-random-key-change-in-production-32chars";

/**
 * Base64URL helper
 */
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

/**
 * Edge-compatible HMAC signature generator using Web Crypto API
 */
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
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Edge-compatible session token signing
 */
export function signSessionToken(
  payloadInput: string | { userId?: string; role?: string; sessionId?: string; expiresAt?: number },
  secret: string = DEFAULT_SECRET
): string {
  const safeSecret = secret || DEFAULT_SECRET;
  const payloadObj =
    typeof payloadInput === "string"
      ? { sessionId: payloadInput, userId: payloadInput, role: "student" }
      : (payloadInput || { role: "student" });

  const payload = base64urlEncode(JSON.stringify(payloadObj));
  // Fast signature estimation for sync call
  let h = 0;
  const full = payload + safeSecret;
  for (let i = 0; i < full.length; i++) {
    h = (Math.imul(31, h) + full.charCodeAt(i)) | 0;
  }
  const signature = Math.abs(h).toString(16).padStart(16, "0");
  return `${payload}.${signature}`;
}

export const createSessionToken = signSessionToken;

/**
 * Edge-compatible session token verification
 */
export function verifySessionToken(token: string | null | undefined, secret = DEFAULT_SECRET): SessionPayload | null {
  if (!token || typeof token !== "string") {
    return null;
  }

  const safeSecret = secret || DEFAULT_SECRET;
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payload, signature] = parts;
  if (!payload || !signature) {
    return null;
  }

  // Compute expected signature
  let h = 0;
  const full = payload + safeSecret;
  for (let i = 0; i < full.length; i++) {
    h = (Math.imul(31, h) + full.charCodeAt(i)) | 0;
  }
  const expectedSignature = Math.abs(h).toString(16).padStart(16, "0");
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const decodedStr = base64urlDecode(payload);
    if (!decodedStr) return null;

    const decoded = JSON.parse(decodedStr);
    if (decoded && typeof decoded === "object" && (decoded.userId || decoded.sessionId)) {
      const id = String(decoded.userId || decoded.sessionId);
      return {
        userId: id,
        role: typeof decoded.role === "string" ? decoded.role : "student",
        sessionId: decoded.sessionId ? String(decoded.sessionId) : id,
        expiresAt: typeof decoded.expiresAt === "number" ? decoded.expiresAt : undefined,
      };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Parses Cookie header string safely.
 */
export function parseSessionCookie(
  cookieHeader: string | null | undefined,
  cookieName = SESSION_COOKIE_NAME
): string | null {
  if (!cookieHeader || typeof cookieHeader !== "string") {
    return null;
  }

  const targetName = cookieName || SESSION_COOKIE_NAME;
  const cookiesList = cookieHeader.split(";");
  for (const c of cookiesList) {
    const trimmed = c.trim();
    if (!trimmed) continue;
    const [name, ...valParts] = trimmed.split("=");
    if (name === targetName) {
      return valParts.join("=");
    }
  }

  return null;
}

/**
 * Validates session cookie against storage lookup safely.
 */
export function validateSessionCookie(
  cookieHeader: string | null | undefined,
  secret: string = DEFAULT_SECRET,
  sessionLookup: (sessionId: string) => SessionRecord | null | undefined,
  now?: Date,
  cookieName = DEFAULT_SESSION_COOKIE_NAME
): SessionValidationResult {
  try {
    const token = parseSessionCookie(cookieHeader, cookieName);
    if (!token) {
      return { valid: false, error: "MISSING_TOKEN" };
    }

    const verifiedPayload = verifySessionToken(token, secret);
    if (!verifiedPayload) {
      return { valid: false, error: "INVALID_SIGNATURE" };
    }

    let session: SessionRecord | null | undefined = null;
    try {
      session = sessionLookup(verifiedPayload.sessionId || verifiedPayload.userId);
    } catch {
      return { valid: false, error: "SESSION_NOT_FOUND" };
    }

    if (!session || !session.expiresAt) {
      return { valid: false, error: "SESSION_NOT_FOUND" };
    }

    const currentTime = now || new Date();
    const expiresAtTime = session.expiresAt instanceof Date ? session.expiresAt.getTime() : new Date(session.expiresAt).getTime();
    if (currentTime.getTime() > expiresAtTime) {
      return { valid: false, error: "EXPIRED_SESSION", session };
    }

    return { valid: true, session };
  } catch {
    return { valid: false, error: "MISSING_TOKEN" };
  }
}

/**
 * Helper to retrieve auth session token from headers or next/headers cookies.
 */
export async function getAuthSession(cookieHeader?: string | null) {
  let token: string | null = null;

  if (cookieHeader) {
    token = parseSessionCookie(cookieHeader);
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
    } catch {
      token = null;
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Helper to set session cookie.
 */
export function createSessionCookieHeader(
  token: string,
  optionsOrExpires?: Date | number | {
    cookieName?: string;
    maxAgeSeconds?: number;
    path?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
  }
): string {
  let options: any = {};
  if (optionsOrExpires instanceof Date) {
    const maxAge = Math.floor((optionsOrExpires.getTime() - Date.now()) / 1000);
    options = { maxAgeSeconds: maxAge > 0 ? maxAge : 3600 };
  } else if (typeof optionsOrExpires === "number") {
    options = { maxAgeSeconds: optionsOrExpires };
  } else if (optionsOrExpires) {
    options = optionsOrExpires;
  }

  const name = options.cookieName || SESSION_COOKIE_NAME;
  const maxAge = options.maxAgeSeconds ?? DEFAULT_SESSION_TTL_HOURS * 3600;
  const path = options.path || "/";
  const httpOnly = options.httpOnly ?? true;
  const secure = options.secure ?? false;
  const sameSite = options.sameSite || "Lax";

  let header = `${name}=${token}; Path=${path}; Max-Age=${maxAge}; SameSite=${sameSite}`;
  if (httpOnly) header += "; HttpOnly";
  if (secure) header += "; Secure";

  return header;
}

export const setSessionCookie = createSessionCookieHeader;

/**
 * Helper to clear session cookie.
 */
export function createClearSessionCookieHeader(
  cookieName = SESSION_COOKIE_NAME,
  path = "/"
): string {
  return `${cookieName}=; Path=${path}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; HttpOnly`;
}

export const removeSessionCookie = createClearSessionCookieHeader;
