"use client";

import * as React from "react";
import type { SearchCategory, SearchItem } from "@/lib/validations/search";
import type { SearchApiResponse } from "./types";

export function useSearch(onSelect: (item: SearchItem) => void) {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<SearchCategory>("all");
  const [results, setResults] = React.useState<SearchItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}&category=${category}`,
        );
        if (response.ok) {
          const data = (await response.json()) as SearchApiResponse;
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Search fetch failed:", error);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, category]);

  const selectItem = React.useCallback((item: SearchItem) => {
    setQuery("");
    onSelect(item);
  }, [onSelect]);

  const handleInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((previous) => (previous + 1) % results.length);
        }
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (results.length > 0) {
          setSelectedIndex((previous) => (previous - 1 + results.length) % results.length);
        }
      } else if (event.key === "Enter") {
        event.preventDefault();
        const selected = results[selectedIndex];
        if (selected) selectItem(selected);
      }
    },
    [results, selectedIndex, selectItem],
  );

  return {
    query,
    setQuery,
    category,
    setCategory,
    results,
    loading,
    selectedIndex,
    setSelectedIndex,
    selectItem,
    handleInputKeyDown,
  };
}
