"use client";

import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      prefetch
      className="flex shrink-0 items-center gap-2 rounded-md text-lg font-bold tracking-tight text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:text-xl"
      aria-label="Vibecoding bosh sahifa"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent font-mono text-base font-black text-white shadow-xs">
        &gt;
      </span>
      <span className="whitespace-nowrap text-lg font-black tracking-tight text-ink md:text-xl">
        vibe<span className="text-accent">coding</span>
      </span>
    </Link>
  );
}
