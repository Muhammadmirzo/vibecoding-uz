/**
 * Correlation id for one request. Edge-safe (Web Crypto only): the middleware imports it.
 * An incoming `x-request-id` from a proxy or client is kept when it looks sane, so a
 * caller can follow its own id through our logs; anything else is replaced.
 */
export const REQUEST_ID_HEADER = "x-request-id";

const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{8,128}$/;

export function resolveRequestId(incoming: string | null | undefined): string {
  const candidate = incoming?.trim();
  if (candidate && SAFE_REQUEST_ID.test(candidate)) return candidate;
  return crypto.randomUUID();
}

/** Request id of a request that passed the middleware (falls back to a fresh id in tests/scripts). */
export function requestIdFrom(request: Request): string {
  return resolveRequestId(request.headers.get(REQUEST_ID_HEADER));
}
