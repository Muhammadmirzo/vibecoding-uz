import { NextRequest, NextResponse } from "next/server";
import { searchQuerySchema } from "@/lib/validations/search";
import type { SearchResponse } from "@/features/search/domain/search";
import { drizzleSearchRepository } from "@/features/search/server/search.repository";
import { globalSearch } from "@/features/search/server/search.service";
import { errorResponse } from "@/lib/http/errors";
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  PRESETS,
} from "@/lib/security/rateLimit";

const CACHE_TTL_MS = 60 * 1000;
const searchCache = new Map<string, { data: SearchResponse; expiresAt: number }>();

const CACHE_HEADERS = { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" };

export async function GET(req: NextRequest) {
  try {
    const rl = await checkRateLimit(`search:${getClientIp(req)}`, PRESETS.SEARCH);
    if (!rl.success) return createRateLimitResponse(rl);

    const url = new URL(req.url);
    const parsed = searchQuerySchema.parse({
      q: url.searchParams.get("q") || "",
      category: url.searchParams.get("category") || "all",
      limit: Number.parseInt(url.searchParams.get("limit") || "20", 10),
    });

    const { q, category, limit } = parsed;
    const cacheKey = `${q.toLowerCase()}:${category}:${limit}`;
    const now = Date.now();
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data, { headers: CACHE_HEADERS });
    }

    const responsePayload = await globalSearch(drizzleSearchRepository, { q, category, limit });
    searchCache.set(cacheKey, { data: responsePayload, expiresAt: now + CACHE_TTL_MS });
    return NextResponse.json(responsePayload, { headers: CACHE_HEADERS });
  } catch (error) {
    return errorResponse(error);
  }
}
