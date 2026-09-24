"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import type { SearchItem } from "@/lib/validations/search";
import { SearchInput } from "./SearchInput";
import { CategoryTabs, SearchResults } from "./SearchResults";
import { useSearch } from "./useSearch";

export const SearchModal = React.memo(function SearchModal() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const handleSelect = React.useCallback((item: SearchItem) => {
    setOpen(false);
    router.push(item.url);
  }, [router]);
  const search = useSearch(handleSelect);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((previous) => !previous);
      }
    };
    const handleCustomToggle = () => setOpen((previous) => !previous);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("toggle-search-modal", handleCustomToggle);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("toggle-search-modal", handleCustomToggle);
    };
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-150" />
        <Dialog.Content className="fixed left-1/2 top-[15%] z-50 w-full max-w-2xl -translate-x-1/2 px-4 focus:outline-none">
          <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-bg-elevated shadow-lg flex flex-col">
            <Dialog.Title className="sr-only">Qidiruv darchasi</Dialog.Title>
            <SearchInput
              query={search.query}
              loading={search.loading}
              onChange={search.setQuery}
              onClear={() => search.setQuery("")}
              onKeyDown={search.handleInputKeyDown}
            />
            <CategoryTabs category={search.category} onChange={search.setCategory} />
            <SearchResults
              query={search.query}
              loading={search.loading}
              results={search.results}
              selectedIndex={search.selectedIndex}
              onSelect={search.selectItem}
              onSelectIndex={search.setSelectedIndex}
            />
            <div className="flex items-center justify-between px-4 py-2.5 bg-bg-sunken border-t border-border text-[11px] text-ink-muted font-mono">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1 py-0.5 rounded bg-bg-elevated border border-border">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-bg-elevated border border-border">↓</kbd> tanlash</span>
                <span><kbd className="px-1 py-0.5 rounded bg-bg-elevated border border-border">↵</kbd> o'tish</span>
              </div>
              <div><kbd className="px-1 py-0.5 rounded bg-bg-elevated border border-border">ESC</kbd> yopish</div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});
