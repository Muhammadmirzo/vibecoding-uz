import { NextRequest, NextResponse } from "next/server";
import { ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { courses, glossaryTerms } from "@/db/schema";
import { searchQuerySchema, type SearchItem } from "@/lib/validations/search";
import {
  createSearchResponse,
  mapCourse,
  mapGlossaryTerm,
  matchStaticItems,
  type SearchResponse,
} from "./searchIndex";

const CACHE_TTL_MS = 60 * 1000;
const searchCache = new Map<string, { data: SearchResponse; expiresAt: number }>();

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const rawQuery = url.searchParams.get("q") || "";
    const rawCategory = url.searchParams.get("category") || "all";
    const rawLimit = Number.parseInt(url.searchParams.get("limit") || "20", 10);
    const parsed = searchQuerySchema.safeParse({ q: rawQuery, category: rawCategory, limit: rawLimit });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Yaroqsiz qidiruv parametri", details: parsed.error.format() },
        { status: 400, headers: CACHE_HEADERS },
      );
    }

    const { q, category, limit } = parsed.data;
    const cacheKey = `${q.toLowerCase()}:${category}:${limit}`;
    const now = Date.now();
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, { headers: CACHE_HEADERS });
    }

    const searchPattern = `%${q}%`;
    const results: SearchItem[] = [];

    if (category === "all" || category === "courses") {
      try {
        const matchedCourses = await db
          .select()
          .from(courses)
          .where(or(
            ilike(courses.title, searchPattern),
            ilike(courses.subtitle, searchPattern),
            ilike(courses.description, searchPattern),
          ))
          .limit(limit);
        results.push(...matchedCourses.map(mapCourse));
      } catch (error) {
        console.warn("DB Courses search fallback:", error);
      }
    }

    if (category === "all" || category === "glossary") {
      try {
        const matchedTerms = await db
          .select()
          .from(glossaryTerms)
          .where(or(
            ilike(glossaryTerms.termUz, searchPattern),
            ilike(glossaryTerms.termEn, searchPattern),
            ilike(glossaryTerms.definition, searchPattern),
          ))
          .limit(limit);
        results.push(...matchedTerms.map(mapGlossaryTerm));
      } catch (error) {
        console.warn("DB Glossary search fallback:", error);
      }
    }

    results.push(...matchStaticItems(q, category));
    const responsePayload = createSearchResponse(q, category, results, limit);
    searchCache.set(cacheKey, { data: responsePayload, expiresAt: now + CACHE_TTL_MS });
    return NextResponse.json(responsePayload, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error("Global search API error:", error);
    return NextResponse.json({ error: "Qidiruvda xatolik yuz berdi" }, { status: 500 });
  }
}
