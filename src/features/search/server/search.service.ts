import type { SearchCategory, SearchItem } from "@/lib/validations/search";
import {
  createSearchResponse,
  mapCourse,
  mapGlossaryTerm,
  matchStaticItems,
  type SearchResponse,
} from "../domain/search";
import type { SearchRepository } from "./search.repository";

export interface GlobalSearchInput {
  q: string;
  category: SearchCategory;
  limit: number;
}

/**
 * Global search use case (read-only, no transaction). Each DB source is
 * isolated in its own try/catch so a failing table degrades to the static
 * index instead of failing the whole query (legacy behavior preserved).
 */
export async function globalSearch(
  repo: SearchRepository,
  input: GlobalSearchInput,
): Promise<SearchResponse> {
  const { q, category, limit } = input;
  const pattern = `%${q}%`;
  const results: SearchItem[] = [];

  if (category === "all" || category === "courses") {
    try {
      const matched = await repo.searchCourses(pattern, limit);
      results.push(...matched.map(mapCourse));
    } catch {
      // Fall through to the static index below.
    }
  }
  if (category === "all" || category === "glossary") {
    try {
      const matched = await repo.searchGlossaryTerms(pattern, limit);
      results.push(...matched.map(mapGlossaryTerm));
    } catch {
      // Fall through to the static index below.
    }
  }

  results.push(...matchStaticItems(q, category));
  return createSearchResponse(q, category, results, limit);
}
