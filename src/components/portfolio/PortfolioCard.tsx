"use client";

import * as React from "react";
import { Lock, ArrowUpRight, Hammer } from "lucide-react";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";

interface PortfolioCardProps {
  item: PortfolioItem;
  variant?: "dark" | "light";
  className?: string;
}

export function PortfolioCard({
  item,
  variant = "dark",
  className = "",
}: PortfolioCardProps) {
  const isDark = variant === "dark";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${item.title} — Saytni ochish`}
      className={`group flex flex-col rounded-2xl overflow-hidden transition-colors ${
        isDark
          ? "border border-white/10 bg-white/[0.05] hover:border-accent/60 hover:bg-white/[0.08]"
          : "border border-border bg-cream-warm hover:border-accent-line hover:shadow-md"
      } ${className}`}
    >
      {/* Apple MacBook Browser Header Bar */}
      <div
        className={`flex items-center gap-2.5 px-3.5 h-10 border-b ${
          isDark
            ? "border-white/10 bg-white/[0.04]"
            : "border-border bg-cream-deep/60"
        }`}
      >
        <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div
          className={`flex-1 min-w-0 flex items-center gap-1.5 h-6 px-2.5 rounded-full border ${
            isDark
              ? "bg-white/[0.06] border-white/10 text-white/70"
              : "bg-cream border-border text-ink-subtle"
          }`}
        >
          <Lock className="w-2.5 h-2.5 shrink-0 text-[#28c840]" />
          <span className="truncate text-xs font-mono">{item.domain}</span>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-mono text-[#28c840]">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#28c840]" />
          </span>
          <span className="hidden sm:inline font-semibold">jonli</span>
        </span>
      </div>

      {/* MacBook Screen Viewport */}
      <div
        className={`relative aspect-[16/10] overflow-hidden ${
          isDark ? "bg-white/[0.03]" : "bg-cream-deep"
        }`}
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Card Content Footer */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-3 min-w-0">
          <h3
            className={`text-lg md:text-xl font-bold leading-snug group-hover:text-accent transition-colors min-w-0 break-words ${
              isDark ? "text-white" : "text-ink"
            }`}
          >
            {item.title}
          </h3>
          <ArrowUpRight
            className={`w-4 h-4 shrink-0 mt-1 group-hover:text-accent transition-colors ${
              isDark ? "text-white/70" : "text-ink-subtle"
            }`}
          />
        </div>
        <p
          className={`text-xs md:text-sm mt-1.5 leading-relaxed flex-1 ${
            isDark ? "text-white/70" : "text-ink-muted"
          }`}
        >
          {item.description}
        </p>

        {item.userCount && (
          <div
            className={`mt-4 pt-4 flex items-baseline gap-2 ${
              isDark ? "border-t border-white/10" : "border-t border-border"
            }`}
          >
            <span className="font-serif italic text-xl md:text-2xl font-bold text-accent tabular-nums">
              {item.userCount.split(" ")[0]}
            </span>
            <span
              className={`text-xs font-mono ${
                isDark ? "text-white/70" : "text-ink-subtle"
              }`}
            >
              {item.userCount.split(" ").slice(1).join(" ")}
            </span>
          </div>
        )}

        <span
          className={`mt-3 inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full border text-xs font-mono text-accent ${
            isDark
              ? "border-accent/40 bg-accent/10"
              : "border-accent-line bg-accent-soft/40"
          }`}
        >
          <Hammer className="w-3 h-3" />
          <span>{item.badgeText}</span>
        </span>
      </div>
    </a>
  );
}
