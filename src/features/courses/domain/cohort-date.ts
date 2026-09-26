/**
 * Cohort date parsing (pure, no I/O).
 *
 * `siteConfig.nextCohortDate` is written for humans in Uzbek ("15-Oktyabr,
 * 2026") because it is rendered as page copy. Schema.org `startDate` needs
 * ISO 8601, so every machine-readable consumer converts through here — one
 * parser, so the countdown and the structured data can never disagree.
 */

const UZ_MONTHS: Record<string, number> = {
  yanvar: 0, fevral: 1, mart: 2, aprel: 3, may: 4, iyun: 5,
  iyul: 6, avgust: 7, sentyabr: 8, oktyabr: 9, noyabr: 10, dekabr: 11,
};

const pad = (value: number) => String(value).padStart(2, "0");

/** "15-Oktyabr, 2026" → Date in local time, or null when unparseable. */
export function parseCohortDate(raw: string): Date | null {
  const match = raw.match(/(\d{1,2})\s*-\s*([A-Za-z'‘`]+),?\s*(\d{4})/);
  if (!match) return null;
  const month = UZ_MONTHS[match[2].toLowerCase().replace(/['‘`]/g, "")];
  if (month === undefined) return null;
  const day = Number(match[1]);
  if (day < 1 || day > 31) return null;
  return new Date(Number(match[3]), month, day);
}

/**
 * ISO 8601 calendar date (`YYYY-MM-DD`) for schema.org, or null when the
 * configured value cannot be parsed — an unparseable date must not reach
 * structured data as a lie.
 */
export function cohortDateToIso(raw: string): string | null {
  const date = parseCohortDate(raw);
  if (!date) return null;
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
