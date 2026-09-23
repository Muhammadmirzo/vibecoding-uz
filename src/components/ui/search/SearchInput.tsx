"use client";

import * as React from "react";
import { Loader2, Search, X } from "lucide-react";

interface SearchInputProps {
  query: string;
  loading: boolean;
  onChange: (value: string) => void;
  onClear: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchInput = React.memo(function SearchInput({
  query,
  loading,
  onChange,
  onClear,
  onKeyDown,
}: SearchInputProps) {
  return (
    <div className="relative flex items-center border-b border-[var(--color-border)] px-4 py-3.5">
      <Search className="w-5 h-5 text-[var(--color-ink-muted)] shrink-0 mr-3" />
      <input
        type="text"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Kurslar, lug'at, resurslar va vebinarlardan qidirish..."
        className="w-full bg-transparent text-base font-medium text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-none"
        autoFocus
      />
      {loading ? (
        <Loader2 className="w-5 h-5 text-[var(--color-accent)] animate-spin shrink-0 ml-2" />
      ) : query ? (
        <button
          type="button"
          onClick={onClear}
          className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
});
