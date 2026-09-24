"use client";

import { Search } from "lucide-react";

export function SearchButton() {
  const openSearch = () => window.dispatchEvent(new CustomEvent("toggle-search-modal"));

  return (
    <button
      type="button"
      onClick={openSearch}
      className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-bg-sunken px-3 text-xs font-medium text-ink-muted transition-colors hover:bg-bg-elevated-warm hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent"
      title="Qidiruv (Ctrl+K)"
      aria-label="Global qidiruvni ochish"
    >
      <Search className="h-4 w-4 text-accent" aria-hidden="true" />
      <span className="hidden 2xl:inline">Qidirish...</span>
      <kbd className="hidden rounded border border-border bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-ink-muted 2xl:inline-block">⌘K</kbd>
    </button>
  );
}
