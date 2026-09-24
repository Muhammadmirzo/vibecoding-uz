import {
  DEFAULT_SESSION_TTL_HOURS,
  SESSION_COOKIE_NAME,
} from "./types";

interface SessionCookieOptions {
  cookieName?: string;
  maxAgeSeconds?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
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
 * Helper to set session cookie.
 */
export function createSessionCookieHeader(
  token: string,
  optionsOrExpires?: Date | number | SessionCookieOptions
): string {
  let options: SessionCookieOptions = {};
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
  const secure = options.secure ?? process.env.NODE_ENV === "production";
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
  let header = `${cookieName}=; Path=${path}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; HttpOnly`;
  if (process.env.NODE_ENV === "production") header += "; Secure";
  return header;
}

export const removeSessionCookie = createClearSessionCookieHeader;
