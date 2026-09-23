import type { SearchCategory, SearchItem } from "@/lib/validations/search";

export interface CategoryTab {
  label: string;
  value: SearchCategory;
}

export interface SearchApiResponse {
  results: SearchItem[];
}
