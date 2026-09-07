"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  X,
  BookOpen,
  BookMarked,
  FileText,
  Video,
  Loader2,
  ChevronRight,
  Sparkles,
  Command,
} from "lucide-react";
import { SearchItem, SearchCategory } from "@/lib/validations/search";

const CATEGORY_TABS: { label: string; value: SearchCategory }[] = [
  { label: "Barchasi", value: "all" },
  { label: "Kurslar", value: "courses" },
  { label: "Lug'at", value: "glossary" },
  { label: "Resurslar", value: "resources" },
  { label: "Blog & Meetlar", value: "blog" },
];

function renderIcon(cat: string) {
  switch (cat) {
    case "course":
      return <BookOpen className="w-4 h-4 text-[var(--color-accent)] shrink-0" />;
    case "glossary":
      return <BookMarked className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    case "resource":
      return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />;
    case "blog":
      return <Video className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />;
    default:
      return <Sparkles className="w-4 h-4 text-[var(--color-accent)] shrink-0" />;
  }
}

interface SearchResultItemProps {
  item: SearchItem;
  isSelected: boolean;
  onSelect: (item: SearchItem) => void;
  onMouseEnter: () => void;
}

const SearchResultItem = React.memo(function SearchResultItem({
  item,
  isSelected,
  onSelect,
  onMouseEnter,
}: SearchResultItemProps) {
  return (
    <div
      onClick={() => onSelect(item)}
      onMouseEnter={onMouseEnter}
      className={`group flex items-center justify-between p-3 rounded-[var(--radius-lg)] cursor-pointer transition-colors ${
        isSelected
          ? "bg-[var(--color-accent-soft)]/60 text-[var(--color-ink)]"
          : "hover:bg-[var(--color-cream-warm)] text-[var(--color-ink)]"
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 p-2 rounded-[var(--radius-md)] bg-[var(--color-cream-warm)] group-hover:bg-[var(--color-cream-deep)] border border-[var(--color-border)]">
          {renderIcon(item.category)}
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
          {item.subtitle && (
            <p className="text-xs text-[var(--color-ink-muted)] truncate mt-0.5">
              {item.subtitle}
            </p>
          )}
        </div>
      </div>
      <ChevronRight
        className={`w-4 h-4 shrink-0 transition-transform ${
          isSelected ? "text-[var(--color-accent)] translate-x-0.5" : "text-[var(--color-ink-subtle)]"
        }`}
      />
    </div>
  );
});

export const SearchModal = React.memo(function SearchModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<SearchCategory>("all");
  const [results, setResults] = React.useState<SearchItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Global Ctrl+K / Cmd+K and custom event listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomToggle = () => setOpen((prev) => !prev);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("toggle-search-modal", handleCustomToggle);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("toggle-search-modal", handleCustomToggle);
    };
  }, []);

  // Fetch results when query or category changes
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&category=${category}`
        );
        if (res.ok) {
          const data = (await res.json()) as { results: SearchItem[] };
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error("Search fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, category]);

  const handleSelectItem = React.useCallback(
    (item: SearchItem) => {
      setOpen(false);
      setQuery("");
      router.push(item.url);
    },
    [router]
  );

  // Keyboard navigation within modal results
  const handleInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((prev) => (prev + 1) % results.length);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelectItem(results[selectedIndex]);
        }
      }
    },
    [results, selectedIndex, handleSelectItem]
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150" />
        <Dialog.Content className="fixed left-1/2 top-[15%] z-50 w-full max-w-2xl -translate-x-1/2 px-4 focus:outline-none">
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-cream)] shadow-[var(--shadow-xl)] flex flex-col">
            <Dialog.Title className="sr-only">Qidiruv darchasi</Dialog.Title>

            {/* Input Header */}
            <div className="relative flex items-center border-b border-[var(--color-border)] px-4 py-3.5">
              <Search className="w-5 h-5 text-[var(--color-ink-muted)] shrink-0 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Kurslar, lug'at, resurslar va vebinarlardan qidirish..."
                className="w-full bg-transparent text-base font-medium text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-none"
                autoFocus
              />
              {loading ? (
                <Loader2 className="w-5 h-5 text-[var(--color-accent)] animate-spin shrink-0 ml-2" />
              ) : query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null}
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-cream-warm)]/60 border-b border-[var(--color-border)] overflow-x-auto text-xs font-semibold">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setCategory(tab.value)}
                  className={`px-3 py-1 rounded-[var(--radius-md)] transition-colors whitespace-nowrap ${
                    category === tab.value
                      ? "bg-[var(--color-accent)] text-white shadow-xs"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-cream-warm)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Results List */}
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
              ) : (
                results.map((item, idx) => (
                  <SearchResultItem
                    key={item.id}
                    item={item}
                    isSelected={idx === selectedIndex}
                    onSelect={handleSelectItem}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  />
                ))
              )}
            </div>

            {/* Footer Hotkey Tips */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-cream-warm)] border-t border-[var(--color-border)] text-[11px] text-[var(--color-ink-muted)] font-mono">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1 py-0.5 rounded bg-[var(--color-cream)] border border-[var(--color-border)]">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-[var(--color-cream)] border border-[var(--color-border)]">↓</kbd> tanlash</span>
                <span><kbd className="px-1 py-0.5 rounded bg-[var(--color-cream)] border border-[var(--color-border)]">↵</kbd> o'tish</span>
              </div>
              <div>
                <kbd className="px-1 py-0.5 rounded bg-[var(--color-cream)] border border-[var(--color-border)]">ESC</kbd> yopish
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
