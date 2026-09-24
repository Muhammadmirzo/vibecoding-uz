import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { Card } from "@/components/ui/Surfaces";
import "./w6c.css";

export interface TocItem {
  id: string;
  label: string;
}

/** Sticky table of contents for long-form pages. Server-rendered anchors. */
export function TocNav({ items, title = "Mundarija" }: { items: TocItem[]; title?: string }) {
  return (
    <nav aria-label={title} className="w6c-toc hidden lg:block">
      <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">{title}</p>
      <div>
        {items.map((item) => (
          <a key={item.id} href={`#${item.id}`}>{item.label}</a>
        ))}
      </div>
    </nav>
  );
}

/** Official-feel certificate seal: static SVG, CSS-gated stroke draw. */
export function Seal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="Rasmiy muhr" className={cn("size-24", className)}>
      <circle cx="60" cy="60" r="54" pathLength={1} className="w6c-seal-draw" />
      <circle cx="60" cy="60" r="46" pathLength={1} className="w6c-seal-draw" opacity={0.45} />
      <path
        d="M60 34l7.5 12.6 14.4 2.4-10.2 10.4 2.2 14.5L60 66.8l-13.9 7.1 2.2-14.5-10.2-10.4 14.4-2.4z"
        pathLength={1}
        className="w6c-seal-draw"
      />
      <path d="M52 60l6 6 11-12" pathLength={1} className="w6c-seal-draw" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Calm empty state used across cabinet and filtered lists. */
export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <span className="grid size-14 place-items-center rounded-full bg-bg-sunken text-ink-subtle" aria-hidden="true">
        <Inbox className="size-7" />
      </span>
      <h2 className="mt-5 font-display text-xl font-semibold text-ink">{title}</h2>
      {body && <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{body}</p>}
      {action && <div className="mt-6 flex flex-col gap-3 sm:flex-row">{action}</div>}
    </Card>
  );
}

/**
 * CLS-safe skeleton: fixed minimum heights matching the real cards,
 * opacity-only pulse (no layout shift when data arrives).
 */
export function PageSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)} aria-hidden="true" role="presentation">
      <div className="w6c-skel h-8 w-56" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="w6c-skel h-28 w-full" />
      ))}
    </div>
  );
}

/**
 * Calm long-form layout: compact hero + sticky desktop TOC + readable
 * prose card. Reading text is never animated.
 */
export function LegalLayout({
  eyebrow,
  title,
  updated,
  toc,
  children,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  toc: TocItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg text-ink">
      <div className="w6c-hero">
        <div className="w6c-hero-mesh" aria-hidden="true" />
        <div className="mx-auto w-full max-w-container px-5 pb-10 pt-28 sm:px-8 sm:pt-32">
          <div className="max-w-3xl">
            <p className="w6c-load text-sm font-semibold tracking-wide text-accent" style={{ "--i": 0 } as React.CSSProperties}>{eyebrow}</p>
            <h1 className="w6c-load mt-3 max-w-4xl text-balance font-display text-[clamp(1.9rem,1.2rem+2.4vw,2.9rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-ink" style={{ "--i": 1 } as React.CSSProperties}>
              {title}
            </h1>
            {updated && <p className="w6c-load mt-3 text-sm text-ink-subtle" style={{ "--i": 2 } as React.CSSProperties}>{updated}</p>}
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-container px-5 pb-20 sm:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="rounded-xl border border-border bg-bg-elevated p-6 shadow-sm sm:p-10">
            <div className="w6c-prose">{children}</div>
          </div>
          <TocNav items={toc} />
        </div>
      </div>
    </div>
  );
}
