"use client";

import * as React from "react";
import { Lock, ArrowUpRight, Hammer } from "lucide-react";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";

interface PortfolioCardProps {
  item: PortfolioItem;
  className?: string;
}

export function PortfolioCard({ item, className = "" }: PortfolioCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${item.title} — Saytni ochish`}
      className={`group flex flex-col rounded-2xl border border-border bg-cream-warm overflow-hidden shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-accent-line ${className}`}
    >
      {/* Apple MacBook Browser Header Bar */}
      <div className="flex items-center gap-2.5 px-3.5 h-10 border-b border-border bg-cream-deep/60">
        <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-cream border border-border">
          <Lock className="w-2.5 h-2.5 shrink-0 text-success" />
          <span className="truncate text-xs font-mono text-ink-subtle">{item.domain}</span>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-mono text-success">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="hidden sm:inline font-semibold">jonli</span>
        </span>
      </div>

      {/* MacBook Screen Viewport with Image Zoom Effect */}
      <div className="relative aspect-[16/10] bg-cream-deep overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-500"
        />
      </div>

      {/* Card Content Footer */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg md:text-xl font-bold text-ink leading-snug group-hover:text-accent transition-colors">
            {item.title}
          </h3>
          <ArrowUpRight className="w-4 h-4 shrink-0 mt-1 text-ink-subtle group-hover:text-accent transition-colors" />
        </div>
        <p className="text-xs md:text-sm text-ink-muted mt-1.5 leading-relaxed flex-1">
          {item.description}
        </p>

        {item.userCount && (
          <div className="mt-4 pt-4 border-t border-border flex items-baseline gap-2">
            <span className="font-serif italic text-xl md:text-2xl font-bold text-accent tabular-nums">
              {item.userCount.split(" ")[0]}
            </span>
            <span className="text-xs font-mono text-ink-subtle">
              {item.userCount.split(" ").slice(1).join(" ")}
            </span>
          </div>
        )}

        <span className="mt-3 inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full border border-accent-line text-xs font-mono text-accent bg-accent-soft/40">
          <Hammer className="w-3 h-3" />
          <span>{item.badgeText}</span>
        </span>
      </div>
    </a>
  );
}
