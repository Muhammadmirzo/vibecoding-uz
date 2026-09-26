/**
 * UTM passthrough for the referral redirect (pure, no I/O).
 *
 * `/ref/<code>?utm_source=…` used to drop the UTM parameters: the redirect
 * built a fresh target URL, so the paid-traffic attribution was lost before
 * the analytics tracker could capture it.
 */
export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

const MAX_LENGTH = 256;

/** Copies every present `utm_*` parameter from `from` onto `to`. */
export function carryUtmParams(from: URLSearchParams, to: URL): URL {
  for (const key of UTM_KEYS) {
    const value = from.get(key);
    if (value) to.searchParams.set(key, value.slice(0, MAX_LENGTH));
  }
  return to;
}
