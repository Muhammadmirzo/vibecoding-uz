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
    <div className="relative flex items-center border-b border-border px-4 py-3.5">
      <Search className="w-5 h-5 text-ink-muted shrink-0 mr-3" />
      <input
        type="text"
        value={query}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Kurslar, lug'at, resurslar va vebinarlardan qidirish..."
        className="w-full bg-transparent text-base font-medium text-ink placeholder-ink-muted focus:outline-none"
        autoFocus
      />
      {loading ? (
        <Loader2 className="w-5 h-5 text-accent animate-spin shrink-0 ml-2" />
      ) : query ? (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex size-11 items-center justify-center text-ink-muted hover:text-ink transition-colors rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  );
});
