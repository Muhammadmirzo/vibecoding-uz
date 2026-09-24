// NOTE(W5-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { courses, glossaryTerms } from "@/db/schema";
import type { CourseSearchRow, GlossarySearchRow } from "../domain/search";

export interface SearchRepository {
  searchCourses(pattern: string, limit: number): Promise<CourseSearchRow[]>;
  searchGlossaryTerms(pattern: string, limit: number): Promise<GlossarySearchRow[]>;
}

export const drizzleSearchRepository: SearchRepository = {
  async searchCourses(pattern, limit) {
    return db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        subtitle: courses.subtitle,
        description: courses.description,
        level: courses.level,
      })
      .from(courses)
      .where(
        or(
          ilike(courses.title, pattern),
          ilike(courses.subtitle, pattern),
          ilike(courses.description, pattern),
        ),
      )
      .limit(limit);
  },
  async searchGlossaryTerms(pattern, limit) {
    return db
      .select({
        id: glossaryTerms.id,
        termUz: glossaryTerms.termUz,
        termEn: glossaryTerms.termEn,
        slug: glossaryTerms.slug,
        category: glossaryTerms.category,
        definition: glossaryTerms.definition,
      })
      .from(glossaryTerms)
      .where(
        or(
          ilike(glossaryTerms.termUz, pattern),
          ilike(glossaryTerms.termEn, pattern),
          ilike(glossaryTerms.definition, pattern),
        ),
      )
      .limit(limit);
  },
};
