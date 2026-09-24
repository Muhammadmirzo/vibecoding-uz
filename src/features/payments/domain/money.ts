/** Tiyin money helpers. All provider amounts are integer tiyin (1 sum = 100 tiyin). */

export const TIYIN_PER_SUM = 100;

const SUM_PATTERN = /^\d+(?:\.\d{1,2})?$/;

export function isValidSumString(value: string): boolean {
  return SUM_PATTERN.test(value.trim());
}

/** Parses a decimal sum string ("2500000.00") into integer tiyin. Throws on invalid input. */
export function sumToTiyin(sum: string | number): number {
  const normalized = typeof sum === "number" ? sum.toFixed(2) : sum.trim();
  if (!isValidSumString(normalized)) throw new Error(`Noto'g'ri summa: ${String(sum)}`);
  const [whole, fraction = ""] = normalized.split(".");
  const tiyin = Number(whole) * TIYIN_PER_SUM + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(tiyin) || tiyin < 0) throw new Error(`Noto'g'ri summa: ${String(sum)}`);
  return tiyin;
}

/** Formats integer tiyin as a decimal sum string ("2500000.00"). */
export function tiyinToSumString(tiyin: number): string {
  if (!Number.isSafeInteger(tiyin) || tiyin < 0) throw new Error(`Noto'g'ri tiyin: ${String(tiyin)}`);
  return (tiyin / TIYIN_PER_SUM).toFixed(2);
}

/** Formats integer tiyin for Uzbek UI ("2 500 000 so'm"). */
export function formatTiyinUz(tiyin: number): string {
  if (!Number.isSafeInteger(tiyin) || tiyin < 0) throw new Error(`Noto'g'ri tiyin: ${String(tiyin)}`);
  const sum = Math.round(tiyin / TIYIN_PER_SUM);
  return `${sum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;
}

/** True when a stored decimal sum equals a provider tiyin amount. */
export function sumMatchesTiyin(sum: string, tiyin: number): boolean {
  try {
    return sumToTiyin(sum) === tiyin;
  } catch {
    return false;
  }
}
