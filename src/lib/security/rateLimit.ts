import { NextResponse } from "next/server";

export interface RateLimitConfig {
  /** Maximum number of allowed requests within windowSeconds */
  limit: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Prefix for cache keys (e.g. 'otp', 'login', 'quiz') */
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Timestamp in milliseconds when the limit resets
  retryAfterSec: number;
}

// Memory Store Entry structure
interface MemoryStoreEntry {
  timestamps: number[];
}

// In-Memory Sliding Window Store
class MemoryRateLimiter {
  private store = new Map<string, MemoryStoreEntry>();

  check(key: string, limit: number, windowMs: number, now: number): RateLimitResult {
    const entry = this.store.get(key) || { timestamps: [] };
    const windowStart = now - windowMs;

    // Filter out timestamps older than the window
    const validTimestamps = entry.timestamps.filter((ts) => ts > windowStart);

    if (validTimestamps.length >= limit) {
      const oldestTimestamp = validTimestamps[0];
      const reset = oldestTimestamp + windowMs;
      const retryAfterSec = Math.max(1, Math.ceil((reset - now) / 1000));

      return {
        success: false,
        limit,
        remaining: 0,
        reset,
        retryAfterSec,
      };
    }

    validTimestamps.push(now);
    this.store.set(key, { timestamps: validTimestamps });

    const reset = now + windowMs;
    const remaining = limit - validTimestamps.length;

    return {
      success: true,
      limit,
      remaining,
      reset,
      retryAfterSec: 0,
    };
  }

  // Periodic cleanup of expired keys
  cleanup(now: number, maxAgeMs: number = 3600 * 1000) {
    for (const [key, entry] of this.store.entries()) {
      const recent = entry.timestamps.filter((ts) => now - ts < maxAgeMs);
      if (recent.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, { timestamps: recent });
      }
    }
  }
}

const memoryLimiter = new MemoryRateLimiter();

/**
 * Checks rate limit for a given identifier using Upstash Redis if configured,
 * falling back to in-memory sliding window rate limiting.
 */
export async function checkRateLimit(
  identifier: string | null | undefined,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const safeIdentifier = identifier && typeof identifier === "string" ? identifier.trim() : String(identifier || "anonymous");
  const limit = Math.max(1, config?.limit || 10);
  const windowSeconds = Math.max(1, config?.windowSeconds || 60);
  const prefix = config?.prefix || "rl";

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const key = `ratelimit:${prefix}:${safeIdentifier}`;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (redisUrl && redisToken) {
    try {
      const windowBucket = Math.floor(now / windowMs);
      const redisKey = `${key}:${windowBucket}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout for Redis REST

      const res = await fetch(`${redisUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, windowSeconds * 2],
        ]),
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const currentCount = Array.isArray(data) && typeof data[0]?.result === "number" ? data[0].result : 1;
        const reset = (windowBucket + 1) * windowMs;

        if (currentCount > limit) {
          const retryAfterSec = Math.max(1, Math.ceil((reset - now) / 1000));
          return {
            success: false,
            limit,
            remaining: 0,
            reset,
            retryAfterSec,
          };
        }

        return {
          success: true,
          limit,
          remaining: Math.max(0, limit - currentCount),
          reset,
          retryAfterSec: 0,
        };
      }
    } catch (error) {
      console.warn("[RateLimit] Upstash Redis request failed, falling back to Memory Store:", error);
    }
  }

  // Fallback to In-Memory sliding window rate limiter
  return memoryLimiter.check(key, limit, windowMs, now);
}

/**
 * Helper to extract client IP address from Next.js request headers safely
 */
export function getClientIp(request?: Request | null): string {
  if (!request || !request.headers) {
    return "127.0.0.1";
  }
  try {
    const xff = request.headers.get("x-forwarded-for");
    if (xff && typeof xff === "string") {
      const firstIp = xff.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }
    const realIp = request.headers.get("x-real-ip");
    if (realIp && typeof realIp === "string" && realIp.trim()) {
      return realIp.trim();
    }
  } catch {
    // Edge runtime fallback
  }
  return "127.0.0.1";
}

/**
 * Creates a standard HTTP 429 Too Many Requests response with standard RateLimit headers.
 */
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

// Preset configurations as specified in §12 & Prompt:
export const PRESETS = {
  /** OTP requests: max 3 requests per 5 minutes (300s) */
  OTP: { limit: 3, windowSeconds: 300, prefix: "otp" },
  /** Login attempts: max 5 attempts per 15 minutes (900s) */
  LOGIN: { limit: 5, windowSeconds: 900, prefix: "login" },
  /** Quiz form submissions: max 5 submissions per 10 minutes (600s) */
  QUIZ: { limit: 5, windowSeconds: 600, prefix: "quiz" },
} as const;

export const rateLimit = checkRateLimit;

