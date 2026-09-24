"use client";

import Image from "next/image";
import { ArrowUpRight, Lock } from "lucide-react";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";
import { resolvePortfolioImageUrl } from "@/features/portfolio/portfolioUtils";

export function PortfolioCard({ item }: { item: PortfolioItem }) {
  const image = resolvePortfolioImageUrl(item);
  return <a href={item.url} target="_blank" rel="noreferrer" className="group flex flex-col overflow-hidden rounded-xl border border-border bg-bg-elevated transition hover:-translate-y-1 hover:border-brand">
    <div className="flex h-11 items-center gap-2 border-b border-border bg-bg-sunken px-4"><div className="flex gap-1" aria-hidden="true"><span className="size-2 rounded-full bg-danger/70" /><span className="size-2 rounded-full bg-gold/70" /><span className="size-2 rounded-full bg-success/70" /></div><div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-border bg-bg-elevated px-3 py-1"><Lock className="size-3 text-success" aria-hidden="true" /><span className="truncate font-mono text-xs text-ink-muted">{item.domain}</span></div><span className="font-mono text-xs text-success">jonli</span></div>
    <div className="relative aspect-[16/10] overflow-hidden bg-bg-sunken">{image ? <Image src={image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover object-top transition duration-500 group-hover:scale-105" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className="flex h-full flex-col justify-between p-6"><span className="font-mono text-xs text-accent">{item.category}</span><div className="text-center"><h3 className="font-display text-2xl font-semibold text-ink">{item.title}</h3><p className="mt-2 font-mono text-xs text-ink-subtle">{item.domain}</p></div><p className="border-t border-border pt-3 font-mono text-xs text-ink-subtle">Vibe Coding MVP</p></div>}</div>
    <div className="flex flex-1 flex-col p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold text-ink">{item.title}</h3><ArrowUpRight className="size-4 shrink-0 text-accent" aria-hidden="true" /></div><p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{item.description}</p>{item.userCount && <p className="mt-4 border-t border-border pt-4 font-mono text-sm font-semibold text-brand">{item.userCount}</p>}<span className="mt-4 inline-flex w-fit rounded-full border border-border bg-bg-sunken px-3 py-1 font-mono text-xs text-accent">{item.badgeText}</span></div>
  </a>;
}
