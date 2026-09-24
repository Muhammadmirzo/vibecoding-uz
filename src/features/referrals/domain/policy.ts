/** Referral payout policy (pure, no I/O). */

export const REFERRAL_BONUS_RATE = 0.1;
export const MIN_PAYOUT_TIYIN = 50_000 * 100;
export const PAYOUT_STATUSES_COUNTED = ["pending", "approved", "paid"] as const;

/** Earned bonus in tiyin from referred users' settled payments. */
export function earnedBonusTiyin(paidReferredTiyin: number[]): number {
  const total = paidReferredTiyin.reduce((sum, t) => sum + t, 0);
  if (!Number.isSafeInteger(total) || total <= 0) return 0;
  return Math.floor(total * REFERRAL_BONUS_RATE);
}

/** Spendable balance: earned minus payouts that are not rejected. */
export function payoutBalanceTiyin(earnedTiyin: number, countedPayoutsTiyin: number[]): number {
  const reserved = countedPayoutsTiyin.reduce((sum, t) => sum + t, 0);
  return Math.max(0, earnedTiyin - reserved);
}

export type PayoutCheck =
  | { ok: true }
  | { ok: false; reason: "EXCEEDS_BALANCE" | "BELOW_MINIMUM" | "INVALID_AMOUNT"; message: string };

/** The client amount must never exceed the server-computed balance. */
export function checkPayoutAmount(amountTiyin: number, balanceTiyin: number): PayoutCheck {
  if (!Number.isSafeInteger(amountTiyin) || amountTiyin <= 0) {
    return { ok: false, reason: "INVALID_AMOUNT", message: "Summa noto'g'ri kiritildi" };
  }
  if (amountTiyin < MIN_PAYOUT_TIYIN) {
    return { ok: false, reason: "BELOW_MINIMUM", message: "Minimal yechib olish miqdori 50 000 so'm" };
  }
  if (amountTiyin > balanceTiyin) {
    return { ok: false, reason: "EXCEEDS_BALANCE", message: "So'ralgan summa balansdan oshib ketdi" };
  }
  return { ok: true };
}
