import { describe, expect, it } from "vitest";
import { globalSearch } from "@/features/search/server/search.service";
import type { SearchRepository } from "@/features/search/server/search.repository";
import type { CourseSearchRow, GlossarySearchRow } from "@/features/search/domain/search";

const course: CourseSearchRow = {
  id: "course-1",
  title: "Vibe Coding Express",
  slug: "vibe-coding-express",
  subtitle: "0 dan MVP gacha",
  description: "AI bilan 8 haftada ilova",
  level: "Boshlang'ich",
};

const term: GlossarySearchRow = {
  id: "term-1",
  termUz: "Prompt",
  termEn: "Prompt",
  slug: "prompt",
  category: "AI",
  definition: "AI ga beriladigan buyruq matni",
};

function makeRepo(opts: { failCourses?: boolean; failTerms?: boolean } = {}): SearchRepository {
  return {
    searchCourses: async (pattern, limit) => {
      if (opts.failCourses) throw new Error("courses down");
      expect(pattern).toContain("vibe");
      return [course].slice(0, limit);
    },
    searchGlossaryTerms: async (_pattern, limit) => {
      if (opts.failTerms) throw new Error("glossary down");
      return [term].slice(0, limit);
    },
  };
}

describe("globalSearch", () => {
  it("merges course, glossary and static results", async () => {
    const res = await globalSearch(makeRepo(), { q: "vibe", category: "all", limit: 20 });
    expect(res.query).toBe("vibe");
    expect(res.category).toBe("all");
    const urls = res.results.map((r) => r.url);
    expect(urls).toContain("/kurs/vibe-coding-express");
    expect(urls).toContain("/lugat#prompt");
    expect(res.total).toBe(res.results.length);
  });

  it("scopes DB sources by category", async () => {
    const coursesOnly = await globalSearch(makeRepo(), { q: "vibe", category: "courses", limit: 20 });
    expect(coursesOnly.results.some((r) => r.category === "course")).toBe(true);
    expect(coursesOnly.results.some((r) => r.category === "glossary")).toBe(false);

    const glossaryOnly = await globalSearch(makeRepo(), { q: "prompt", category: "glossary", limit: 20 });
    expect(glossaryOnly.results.some((r) => r.category === "glossary")).toBe(true);
    expect(glossaryOnly.results.some((r) => r.category === "course")).toBe(false);
  });

  it("degrades to the static index when a table fails", async () => {
    const res = await globalSearch(makeRepo({ failCourses: true, failTerms: true }), {
      q: "vibe",
      category: "all",
      limit: 20,
    });
    expect(res.results.length).toBeGreaterThan(0);
    expect(res.results.every((r) => r.category === "resource" || r.category === "blog")).toBe(true);
  });

  it("respects the limit", async () => {
    const res = await globalSearch(makeRepo(), { q: "vibe", category: "all", limit: 1 });
    expect(res.results).toHaveLength(1);
    expect(res.total).toBe(1);
  });
});
