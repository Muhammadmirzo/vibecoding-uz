"use client";

import { Search } from "lucide-react";
import { PORTFOLIO_CATEGORIES } from "@/lib/validations/portfolio";

type Props = { itemsCount: number; searchQuery: string; selectedCategory: string; onSearch: (value: string) => void; onCategory: (value: string) => void; };
export function PortfolioFilters({ itemsCount, searchQuery, selectedCategory, onSearch, onCategory }: Props) {
  return (
      <>
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-cream border border-border p-4 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-subtle absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Portfolio yoki domen bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-cream-warm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onCategory("Barchasi")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
              selectedCategory === "Barchasi"
                ? "bg-accent text-white"
                : "bg-cream-warm text-ink-muted hover:text-ink"
            }`}
          >
            Barchasi ({itemsCount})
          </button>
          {PORTFOLIO_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-accent text-white"
                  : "bg-cream-warm text-ink-muted hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
