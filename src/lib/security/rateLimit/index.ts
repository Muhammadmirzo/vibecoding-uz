import { NextResponse } from "next/server";
import { checkMemoryRateLimit } from "./memoryLimiter";
import { checkRedisRateLimit } from "./redisLimiter";
import { checkPostgresRateLimit } from "./postgresLimiter";
import type { RateLimitConfig, RateLimitResult } from "./presets";

export { PRESETS } from "./presets";
export type { RateLimitConfig, RateLimitResult } from "./presets";

/**
 * SHA-256 hashes an identifier (IP, phone) before it becomes a storage key,
 * so no backend — Redis, Postgres or memory — ever stores a raw identifier.
 * Web Crypto works in Node and Edge runtimes.
 */
export async function hashRateLimitIdentifier(raw: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`rl-v1:${raw}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

/**
 * Checks rate limit with shared backends first: Upstash Redis when
 * configured, then Postgres, with a per-instance memory fallback.
 * Never throws: when every backend is down the memory limiter still
 * answers (fail-open for reads/low-risk writes; auth endpoints keep the
 * pre-W10 memory behaviour instead of going down).
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
  const key = `ratelimit:${prefix}:${await hashRateLimitIdentifier(safeIdentifier)}`;

  // Antifragile: shared backends are preferred, but a missing or failing
  // backend must never take login/OTP/leads/webhooks down — degrade down
  // the chain and say so once in the logs.
  const sharedResult = (await checkRedisRateLimit(key, limit, windowSeconds, now))
    ?? (process.env.NODE_ENV === "test" ? null : await checkPostgresRateLimit(key, limit, windowSeconds, now));
  if (!sharedResult && process.env.NODE_ENV === "production") warnSharedFallbackOnce();
  return sharedResult || checkMemoryRateLimit(key, limit, windowMs, now);
}

let warnedSharedFallback = false;
function warnSharedFallbackOnce() {
  if (warnedSharedFallback) return;
  warnedSharedFallback = true;
  console.warn("[rate-limit] Upstash Redis and Postgres unavailable or not configured — using per-instance memory limits");
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
