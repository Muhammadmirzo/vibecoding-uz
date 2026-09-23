import { NextResponse } from "next/server";
import { checkMemoryRateLimit } from "./memoryLimiter";
import { checkRedisRateLimit } from "./redisLimiter";
import type { RateLimitConfig, RateLimitResult } from "./presets";

export { PRESETS } from "./presets";
export type { RateLimitConfig, RateLimitResult } from "./presets";

/**
 * Checks rate limit using Upstash Redis when configured, with an in-memory
 * sliding-window fallback.
 */
export async function checkRateLimit(
  identifier: string | null | undefined,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const safeIdentifier = identifier && typeof identifier === "string"
    ? identifier.trim()
    : String(identifier || "anonymous");
  const limit = Math.max(1, config?.limit || 10);
  const windowSeconds = Math.max(1, config?.windowSeconds || 60);
  const prefix = config?.prefix || "rl";
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const key = `ratelimit:${prefix}:${safeIdentifier}`;

  const redisResult = await checkRedisRateLimit(key, limit, windowSeconds, now);
  return redisResult || checkMemoryRateLimit(key, limit, windowMs, now);
}

/** Extracts a client IP address from request headers safely. */
export function getClientIp(request?: Request | null): string {
  if (!request || !request.headers) return "127.0.0.1";
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor && typeof forwardedFor === "string") {
      const firstIp = forwardedFor.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp && typeof realIp === "string" && realIp.trim()) return realIp.trim();
  } catch {
    // Edge runtime fallback
  }
  return "127.0.0.1";
}

/** Creates a standard HTTP 429 response with rate-limit headers. */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfterSec = Math.max(1, result?.retryAfterSec || 60);
  const limit = result?.limit || 10;
  const remaining = Math.max(0, result?.remaining || 0);
  const resetSec = Math.ceil((result?.reset || Date.now() + 60000) / 1000);

  return NextResponse.json(
    {
      error: "Juda ko'p urinish joylandi. Iltimos, biroz kutib qaytadan urinib ko'ring.",
      retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSec.toString(),
        "X-RateLimit-Limit": limit.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": resetSec.toString(),
      },
    }
  );
}

export const rateLimit = checkRateLimit;
