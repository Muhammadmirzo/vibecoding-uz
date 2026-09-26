/**
 * Price truth for the pay page (/kabinet/to-lovlar).
 *
 * Checkout charges `cohorts.price_sum` (server, `checkout.service.ts`), so the
 * amount the student sees on the pay page must be the cohort amount the server
 * resolved — never the siteConfig marketing string, which can be stale and
 * which belongs to the marketing/waitlist surfaces only (L14: no invented
 * numbers). No I/O here: the cohort lookup happens server-side.
 */

import { formatUzs } from "../format";

/** Tiyin (the server's money unit) -> so'm, rounded to kopecks. */
export function tiyinToUzs(tiyin: number): number {
  return Math.round(tiyin) / 100;
}

export interface PayablePrice {
  /** The trusted cohort amount in tiyin, or null when nothing is payable. */
  amountTiyin: number | null;
  /** The same amount in so'm, or null when nothing is payable. */
  amount: number | null;
  /** `"550 000 so'm"` — what the server will charge, or null. */
  label: string | null;
  /**
   * The siteConfig price text. Display-only: keep it as the marketing /
   * waitlist line, never as "the amount you will be charged".
   */
  marketingText: string;
}

/**
 * The amount a student is actually charged, formatted as "X so'm".
 *
 * A missing or non-positive cohort amount means nothing is sellable: the
 * caller must then show the waitlist state, not a made-up number.
 */
export function resolvePayablePrice(input: {
  amountTiyin: number | null | undefined;
  marketingText: string;
}): PayablePrice {
  const { marketingText } = input;
  const tiyin = input.amountTiyin ?? null;
  if (tiyin === null || !Number.isFinite(tiyin) || tiyin <= 0) {
    return { amountTiyin: null, amount: null, label: null, marketingText };
  }
  const amount = tiyinToUzs(tiyin);
  return { amountTiyin: tiyin, amount, label: formatUzs(amount), marketingText };
}
