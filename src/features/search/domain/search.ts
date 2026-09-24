import { searchItemSchema, type SearchCategory, type SearchItem } from "@/lib/validations/search";

export const STATIC_SEARCH_DATA: SearchItem[] = [
  {
    id: "res-1",
    title: "Vibe Coding Prompt Framework",
    subtitle: "AI bilan tezkor prototip yaratish uchun 15 ta tayyor prompt",
    category: "resource",
    url: "/resurslar#prompt-framework",
    badge: "PDF / Shablon",
    icon: "FileText",
  },
  {
    id: "res-2",
    title: "Claude Code & Cursor Sozlamalari Cheat-sheet",
    subtitle: "Ideal AI muloqot va CLI integratsiyasi qo'llanmasi",
    category: "resource",
    url: "/resurslar#cheat-sheet",
    badge: "Qo'llanma",
    icon: "Code",
  },
  {
    id: "blog-1",
    title: "Vibe Coding: Nega 2026-yilda dasturlash tili emas, g'oya muhim?",
    subtitle: "Mirzo bilan jonli suhbat va real Keyslar",
    category: "blog",
    url: "/bepul-dars",
    badge: "Vebinar",
    icon: "Video",
  },
  {
    id: "blog-2",
    title: "EduBaza (27 000+ o'qituvchi) qanday 100% AI bilan qurildi?",
    subtitle: "Mahsulot arxitekturasi va startup tajribasi",
    category: "blog",
    url: "/meetlar",
    badge: "Keys",
    icon: "Calendar",
  },
];

export interface CourseSearchRow {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  level: string | null;
}

export interface GlossarySearchRow {
  id: string;
  termUz: string;
  termEn: string;
  slug: string;
  category: string;
  definition: string;
}

export interface SearchResponse {
  query: string;
  category: SearchCategory;
  total: number;
  results: SearchItem[];
}

export function mapCourse(course: CourseSearchRow): SearchItem {
  return searchItemSchema.parse({
    id: course.id,
    title: course.title,
    subtitle: course.subtitle || course.level || undefined,
    description: course.description || undefined,
    category: "course",
    url: `/kurs/${course.slug}`,
    badge: "Kurs",
    icon: "BookOpen",
  });
}

export function mapGlossaryTerm(term: GlossarySearchRow): SearchItem {
  return searchItemSchema.parse({
    id: term.id,
    title: `${term.termUz} (${term.termEn})`,
    subtitle: term.category,
    description: term.definition,
    category: "glossary",
    url: `/lugat#${term.slug}`,
    badge: "Lug'at",
    icon: "BookMarked",
  });
}

export function matchStaticItems(
  query: string,
  category: SearchCategory,
  data: SearchItem[] = STATIC_SEARCH_DATA,
): SearchItem[] {
  const normalizedQuery = query.toLowerCase();
  return data.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    return (
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.subtitle?.toLowerCase().includes(normalizedQuery) ||
      item.description?.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function createSearchResponse(
  query: string,
  category: SearchCategory,
  results: SearchItem[],
  limit: number,
): SearchResponse {
  const finalResults = results.slice(0, limit);
  return { query, category, total: finalResults.length, results: finalResults };
}
