"use client";

import { useMemo, useState } from "react";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";

export function usePortfolioFilters(items: PortfolioItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Barchasi");
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("uz-UZ");
    return items.filter((item) => {
      const categoryMatches = selectedCategory === "Barchasi" || item.category === selectedCategory;
      const searchMatches = !query || [item.title, item.domain, item.description].some((value) => value.toLocaleLowerCase("uz-UZ").includes(query));
      return categoryMatches && searchMatches;
    });
  }, [items, searchQuery, selectedCategory]);
  return { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, filteredItems };
}
