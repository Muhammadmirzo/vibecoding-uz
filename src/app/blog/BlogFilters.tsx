import { Search } from "lucide-react";

interface BlogFiltersProps {
  query: string;
  selectedCategory: string;
  onQueryChange: (value: string) => void;
  onClearQuery: () => void;
  onCategorySelect: (category: string) => void;
}

interface BlogFiltersPropsWithCategories extends BlogFiltersProps {
  categories: readonly string[];
}

export function BlogFilters({
  query,
  selectedCategory,
  onQueryChange,
  onClearQuery,
  onCategorySelect,
  categories,
}: BlogFiltersPropsWithCategories) {
  return (
    <div className="mx-auto max-w-[900px] space-y-5">
      <div className="relative">
        <label htmlFor="blog-search" className="sr-only">Maqolalarni qidirish</label>
        <Search className="absolute left-4 top-3.5 h-5 w-5 text-ink-subtle" />
        <input
          id="blog-search"
          type="search"
          placeholder="Maqolalarni qidiring..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="h-12 w-full rounded-xl border border-border-strong bg-bg-elevated pl-12 pr-24 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {query && (
          <button type="button" onClick={onClearQuery} className="absolute right-4 top-3.5 font-mono text-xs text-ink-muted hover:text-accent">
            Tozalash
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto sm:pb-2" aria-label="Kategoriya bo'yicha filtrlash">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onCategorySelect(category)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-all md:text-sm ${
                isSelected
                  ? "bg-accent text-white shadow-sm"
                  : "border border-border bg-bg-elevated text-ink-muted hover:bg-bg-sunken hover:text-ink"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
}
