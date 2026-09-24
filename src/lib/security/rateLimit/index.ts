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

  // Antifragile: Redis (shared across instances) is preferred, but a missing or
  // failing Redis must never take login/OTP/leads/webhooks down — degrade to the
  // per-instance limiter and say so once in the logs.
  const redisResult = await checkRedisRateLimit(key, limit, windowSeconds, now);
  if (!redisResult && process.env.NODE_ENV === "production") warnMemoryFallbackOnce();
  return redisResult || checkMemoryRateLimit(key, limit, windowMs, now);
}

let warnedMemoryFallback = false;
function warnMemoryFallbackOnce() {
  if (warnedMemoryFallback) return;
  warnedMemoryFallback = true;
  console.warn("[rate-limit] Upstash Redis unavailable or not configured — using per-instance memory limits");
}

const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6 = /^[0-9a-f:]+$/i;
function validIp(value: string): string | null {
  const candidate = value.trim();
  const valid = IPV4.test(candidate)
    ? candidate.split(".").every((part) => Number(part) <= 255)
    : IPV6.test(candidate) && candidate.includes(":");
  return valid ? candidate : null;
}

/** Extracts a platform-normalized client IP; raw XFF is only trusted in development. */
export function getClientIp(request?: Request | null): string {
  if (!request?.headers) return "127.0.0.1";
  const platform = request.headers.get("x-vercel-forwarded-for") ||
    (process.env.NODE_ENV !== "production" ? request.headers.get("x-forwarded-for") : null);
  const first = platform?.split(",")[0];
  return (first && validIp(first)) || validIp(request.headers.get("x-real-ip") || "") || "127.0.0.1";
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
