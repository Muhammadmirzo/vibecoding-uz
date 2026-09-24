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
    case "course": return <BookOpen className="w-4 h-4 text-accent shrink-0" />;
    case "glossary": return <BookMarked className="w-4 h-4 text-success shrink-0" />;
    case "resource": return <FileText className="w-4 h-4 text-brand shrink-0" />;
    case "blog": return <Video className="w-4 h-4 text-gold shrink-0" />;
    default: return <Sparkles className="w-4 h-4 text-accent shrink-0" />;
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
      className={`group flex items-center justify-between p-3 rounded-[var(--radius-lg)] cursor-pointer transition-colors ${selected ? "bg-accent-soft/60 text-ink" : "hover:bg-bg-sunken text-ink"}`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 p-2 rounded-[var(--radius-md)] bg-bg-sunken group-hover:bg-border/60 border border-border">
          <ResultIcon category={item.category} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{item.title}</span>
            {item.badge && (
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-bg-sunken border border-border text-ink-muted shrink-0">
                {item.badge}
              </span>
            )}
          </div>
          {item.subtitle && <p className="text-xs text-ink-muted truncate mt-0.5">{item.subtitle}</p>}
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selected ? "text-accent translate-x-0.5" : "text-ink-subtle"}`} />
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
    <div className="max-h-[360px] overflow-y-auto p-2 divide-y divide-border/40">
      {!query.trim() ? (
        <div className="py-12 text-center text-sm text-ink-muted">
          <Command className="w-8 h-8 mx-auto mb-2 opacity-40 text-accent" />
          <p className="font-semibold text-ink">Nimanidir qidirishni boshlang</p>
          <p className="text-xs mt-1">Masalan: "Claude Code", "Prompting", "Vibe Coding Express"</p>
        </div>
      ) : results.length === 0 && !loading ? (
        <div className="py-12 text-center text-sm text-ink-muted">
          <p className="font-semibold text-ink">Natija topilmadi</p>
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
    <div className="flex items-center gap-1.5 px-4 py-2 bg-bg-sunken/60 border-b border-border overflow-x-auto text-xs font-semibold">
      {CATEGORY_TABS.map((tab) => (
        <button key={tab.value} type="button" onClick={() => onChange(tab.value)} className={`px-3 py-1 rounded-[var(--radius-md)] transition-colors whitespace-nowrap ${category === tab.value ? "bg-accent text-ink shadow-sm" : "text-ink-muted hover:text-ink hover:bg-bg-sunken"}`}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
