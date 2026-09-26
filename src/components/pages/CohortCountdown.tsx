"use client";

import * as React from "react";
import { parseCohortDate } from "@/features/courses/domain/cohort-date";

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
