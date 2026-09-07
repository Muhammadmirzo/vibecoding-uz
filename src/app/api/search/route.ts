import { NextRequest, NextResponse } from "next/server";
import { ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { courses, glossaryTerms } from "@/db/schema";
import { searchQuerySchema, searchItemSchema, SearchItem } from "@/lib/validations/search";

// Pre-defined static resources & blog items to index alongside database content
const staticSearchData: SearchItem[] = [
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
    subtitle: "Ibrohim Qodirov bilan jonli suhbat va real Keyslar",
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

// Simple in-memory query cache with TTL (60s)
interface CacheEntry {
  data: {
    query: string;
    category: string;
    total: number;
    results: SearchItem[];
  };
  expiresAt: number;
}

const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000;

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const rawQuery = url.searchParams.get("q") || "";
    const rawCategory = url.searchParams.get("category") || "all";
    const rawLimit = parseInt(url.searchParams.get("limit") || "20", 10);

    const parsed = searchQuerySchema.safeParse({
      q: rawQuery,
      category: rawCategory,
      limit: rawLimit,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Yaroqsiz qidiruv parametri", details: parsed.error.format() },
        {
          status: 400,
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    const { q, category, limit } = parsed.data;
    const cacheKey = `${q.toLowerCase()}:${category}:${limit}`;
    const now = Date.now();

    // Check in-memory TTL cache
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    const searchPattern = `%${q}%`;
    const results: SearchItem[] = [];

    // 1. Search DB Courses
    if (category === "all" || category === "courses") {
      try {
        const matchedCourses = await db
          .select()
          .from(courses)
          .where(
            or(
              ilike(courses.title, searchPattern),
              ilike(courses.subtitle, searchPattern),
              ilike(courses.description, searchPattern)
            )
          )
          .limit(limit);

        for (const c of matchedCourses) {
          results.push(
            searchItemSchema.parse({
              id: c.id,
              title: c.title,
              subtitle: c.subtitle || c.level || undefined,
              description: c.description || undefined,
              category: "course",
              url: `/kurs/${c.slug}`,
              badge: "Kurs",
              icon: "BookOpen",
            })
          );
        }
      } catch (err) {
        console.warn("DB Courses search fallback:", err);
      }
    }

    // 2. Search DB Glossary Terms
    if (category === "all" || category === "glossary") {
      try {
        const matchedTerms = await db
          .select()
          .from(glossaryTerms)
          .where(
            or(
              ilike(glossaryTerms.termUz, searchPattern),
              ilike(glossaryTerms.termEn, searchPattern),
              ilike(glossaryTerms.definition, searchPattern)
            )
          )
          .limit(limit);

        for (const t of matchedTerms) {
          results.push(
            searchItemSchema.parse({
              id: t.id,
              title: `${t.termUz} (${t.termEn})`,
              subtitle: t.category,
              description: t.definition,
              category: "glossary",
              url: `/lugat#${t.slug}`,
              badge: "Lug'at",
              icon: "BookMarked",
            })
          );
        }
      } catch (err) {
        console.warn("DB Glossary search fallback:", err);
      }
    }

    // 3. Search Static Resources & Blog/Meetlar
    const lowerQ = q.toLowerCase();
    for (const item of staticSearchData) {
      if (category !== "all" && item.category !== category) continue;

      const titleMatch = item.title.toLowerCase().includes(lowerQ);
      const subMatch = item.subtitle?.toLowerCase().includes(lowerQ);
      const descMatch = item.description?.toLowerCase().includes(lowerQ);

      if (titleMatch || subMatch || descMatch) {
        results.push(item);
      }
    }

    // Slice results up to max limit
    const finalResults = results.slice(0, limit);
    const responsePayload = {
      query: q,
      category,
      total: finalResults.length,
      results: finalResults,
    };

    // Save to in-memory TTL cache
    searchCache.set(cacheKey, {
      data: responsePayload,
      expiresAt: now + CACHE_TTL_MS,
    });

    return NextResponse.json(responsePayload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("Global search API error:", err);
    return NextResponse.json(
      { error: "Qidiruvda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
