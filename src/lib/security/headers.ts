/**
 * Shared security headers + lightweight CSRF/secret helpers.
 * Edge-runtime compatible (no Node.js imports).
 */

export const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  // CSP is intentionally permissive enough for Next.js runtime chunks,
  // next/font (Google Fonts) and the Telegram Login widget, while still
  // blocking object/plugins and constraining frame/script sources.
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://oauth.telegram.org",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://api.telegram.org",
    "frame-src https://oauth.telegram.org https://telegram.org",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

type HeadersLike = { set(name: string, value: string): void };

/** Applies the shared security headers to any headers-like object. */
export function applySecurityHeaders<T extends HeadersLike>(target: T): T {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    try {
      target.set(name, value);
    } catch {
      // Ignore read-only headers implementations.
    }
  }
  return target;
}

/**
 * Lightweight CSRF check for cookie-authenticated mutations.
 * Browsers always send Origin (fetch/POST) or Referer (form navigation).
 * When neither is present (curl, server-to-server, same-origin GET) the
 * request is allowed; when present, the origin host must match the Host.
 */
export function isOriginAllowed(
  originOrReferer: string | null | undefined,
  host: string | null | undefined
): boolean {
  if (!originOrReferer) return true;
  if (!host) return false;
  let originHost: string;
  try {
    originHost = new URL(originOrReferer).host.toLowerCase();
  } catch {
    return false;
  }
  return originHost === host.toLowerCase();
}

/** Extracts the effective request host (Host header preferred). */
export function getRequestHost(request: Request): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost && forwardedHost.trim()) {
    return forwardedHost.split(",")[0]?.trim() || null;
  }
  return request.headers.get("host") || request.headers.get("x-forwarded-host");
}

/** Returns true when a state-changing request passes the Origin/Referer check. */
export function passesCsrfCheck(request: Request): boolean {
  const origin = request.headers.get("origin") || request.headers.get("referer");
  return isOriginAllowed(origin, getRequestHost(request));
}

/**
 * Constant-time comparison of a caller-supplied webhook secret against the
 * expected value. Returns false when either side is missing.
 */
export function verifyWebhookSecret(
  provided: string | null | undefined,
  expected: string | null | undefined
): boolean {
  if (!provided || !expected) return false;
  if (provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
