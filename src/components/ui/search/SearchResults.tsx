"use client";

import * as React from "react";
import { BookMarked, BookOpen, ChevronRight, Command, FileText, Sparkles, Video } from "lucide-react";
import type { SearchCategory, SearchItem } from "@/lib/validations/search";
import type { CategoryTab } from "./types";

export const CATEGORY_TABS: CategoryTab[] = [
  { label: "Barchasi", value: "all" },
  { label: "Kurslar", value: "courses" },
  { label: "Lug'at", value: "glossary" },
  { label: "Resurslar", value: "resources" },
  { label: "Blog & Meetlar", value: "blog" },
];

function ResultIcon({ category }: { category: string }) {
  switch (category) {
    case "course": return <BookOpen className="w-4 h-4 text-[var(--color-accent)] shrink-0" />;
    case "glossary": return <BookMarked className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    case "resource": return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
    case "blog": return <Video className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />;
    default: return <Sparkles className="w-4 h-4 text-[var(--color-accent)] shrink-0" />;
  }
}

interface ResultItemProps {
  item: SearchItem;
  selected: boolean;
  onSelect: (item: SearchItem) => void;
  onMouseEnter: () => void;
}

const ResultItem = React.memo(function ResultItem({
  item,
  selected,
  onSelect,
  onMouseEnter,
}: ResultItemProps) {
  return (
    <div
      onClick={() => onSelect(item)}
      onMouseEnter={onMouseEnter}
      className={`group flex items-center justify-between p-3 rounded-[var(--radius-lg)] cursor-pointer transition-colors ${selected ? "bg-[var(--color-accent-soft)]/60 text-[var(--color-ink)]" : "hover:bg-[var(--color-cream-warm)] text-[var(--color-ink)]"}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 p-2 rounded-[var(--radius-md)] bg-[var(--color-cream-warm)] group-hover:bg-[var(--color-cream-deep)] border border-[var(--color-border)]">
          <ResultIcon category={item.category} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{item.title}</span>
            {item.badge && (
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[var(--color-cream-warm)] border border-[var(--color-border)] text-[var(--color-ink-muted)] shrink-0">
                {item.badge}
              </span>
            )}
          </div>
          {item.subtitle && <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">{item.subtitle}</p>}
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selected ? "text-[var(--color-accent)] translate-x-0.5" : "text-[var(--color-ink-subtle)]"}`} />
    </div>
  );
});

interface SearchResultsProps {
  query: string;
  loading: boolean;
  results: SearchItem[];
  selectedIndex: number;
  onSelect: (item: SearchItem) => void;
  onSelectIndex: (index: number) => void;
}

export function SearchResults({ query, loading, results, selectedIndex, onSelect, onSelectIndex }: SearchResultsProps) {
  return (
    <div className="max-h-[360px] overflow-y-auto p-2 divide-y divide-[var(--color-border)]/40">
      {!query.trim() ? (
        <div className="py-12 text-center text-sm text-[var(--color-ink-muted)]">
          <Command className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--color-accent)]" />
          <p className="font-semibold text-[var(--color-ink)]">Nimanidir qidirishni boshlang</p>
          <p className="text-xs mt-1">Masalan: "Claude Code", "Prompting", "Vibe Coding Express"</p>
        </div>
      ) : results.length === 0 && !loading ? (
        <div className="py-12 text-center text-sm text-[var(--color-ink-muted)]">
          <p className="font-semibold text-[var(--color-ink)]">Natija topilmadi</p>
          <p className="text-xs mt-1">"<b>{query}</b>" bo'yicha hech narsa topilmadi.</p>
        </div>
      ) : results.map((item, index) => (
        <ResultItem
          key={item.id}
          item={item}
          selected={index === selectedIndex}
          onSelect={onSelect}
          onMouseEnter={() => onSelectIndex(index)}
        />
      ))}
    </div>
  );
}

interface CategoryTabsProps {
  category: SearchCategory;
  onChange: (category: SearchCategory) => void;
}

export function CategoryTabs({ category, onChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-cream-warm)]/60 border-b border-[var(--color-border)] overflow-x-auto text-xs font-semibold">
      {CATEGORY_TABS.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onChange(tab.value)} className={`px-3 py-1 rounded-[var(--radius-md)] transition-colors whitespace-nowrap ${category === tab.value ? "bg-[var(--color-accent)] text-white shadow-xs" : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)]"}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
