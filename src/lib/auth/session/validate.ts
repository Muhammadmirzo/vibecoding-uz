import { cookies } from "next/headers";
import { parseSessionCookie } from "./cookie";
import { DEFAULT_SECRET } from "./constants";
import { verifySessionToken } from "./token";
import {
  DEFAULT_SESSION_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  type SessionRecord,
  type SessionValidationResult,
} from "./types";

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
    const expiresAtTime = session.expiresAt instanceof Date
      ? session.expiresAt.getTime()
      : new Date(session.expiresAt).getTime();
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
