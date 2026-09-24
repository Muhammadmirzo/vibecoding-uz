"use client";

import * as React from "react";
import { useInView } from "./RevealRoot";

interface CountUpProps {
  /** The real end value. Never animate invented numbers (honesty rule). */
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** ms. Default 900 (epic token). */
  duration?: number;
  className?: string;
}

/** Locale formatter shared with tests. Pure. */
export function formatCount(value: number, decimals: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Counts 0 → `end` once, when scrolled into view. rAF only, no scroll
 * listeners. Renders the final value immediately when reduced-motion is
 * requested or motion is off. Only use for real numbers.
 */
export function CountUp({ end, decimals = 0, prefix = "", suffix = "", duration = 900, className }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  // SSR and no-JS render the truthful final value. The client may replay
  // from zero once the real number enters view, but it never starts at 0 in
  // the server HTML.
  const [value, setValue] = React.useState(end);
  const current = React.useRef(0);

  React.useEffect(() => {
    if (!inView) return;
    const root = document.documentElement;
    const animate =
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      root.dataset.motion !== "off";
    if (!animate || duration <= 0) {
      current.current = end;
      setValue(end);
      return;
    }
    let raf = 0;
    current.current = 0;
    setValue(0);
    const from = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * t); // out-expo
      const next = t === 1 ? end : from + (end - from) * eased;
      current.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatCount(value, decimals)}
      {suffix}
    </span>
  );
}
