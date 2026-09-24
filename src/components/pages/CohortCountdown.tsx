"use client";

import * as React from "react";

const UZ_MONTHS: Record<string, number> = {
  yanvar: 0, fevral: 1, mart: 2, aprel: 3, may: 4, iyun: 5,
  iyul: 6, avgust: 7, sentyabr: 8, oktyabr: 9, noyabr: 10, dekabr: 11,
};

/** Parse the real cohort date from siteConfig ("15-Oktyabr, 2026"). */
function parseCohortDate(raw: string): Date | null {
  const match = raw.match(/(\d{1,2})\s*-\s*([A-Za-z'‘`]+),?\s*(\d{4})/);
  if (!match) return null;
  const month = UZ_MONTHS[match[2].toLowerCase().replace(/['‘`]/g, "")];
  if (month === undefined) return null;
  return new Date(Number(match[3]), month, Number(match[1]));
}

/**
 * Live cohort countdown derived from the REAL `siteConfig.nextCohortDate`
 * (passed as a plain string prop so the services catalog never enters the
 * client bundle). Renders nothing until mounted (no hydration mismatch)
 * and hides itself when the date is past or unparseable.
 */
export function CohortCountdown({ date, className }: { date: string; className?: string }) {
  const [days, setDays] = React.useState<number | null>(null);

  React.useEffect(() => {
    const target = parseCohortDate(date);
    if (!target) return;
    const diff = Math.ceil((target.getTime() - Date.now()) / 86_400_000);
    if (diff < 0) return;
    setDays(diff);
  }, [date]);

  if (days === null) return null;
  return (
    <p className={className} role="status">
      <span className="inline-flex items-center gap-2 rounded-full bg-gold-soft px-4 py-2 font-mono text-xs font-bold text-gold-hover">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
          <span className="relative inline-flex size-2 rounded-full bg-gold" />
        </span>
        Keyingi guruhgacha {days} kun qoldi
      </span>
    </p>
  );
}
