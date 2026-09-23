import type { RateLimitResult } from "./presets";

interface MemoryStoreEntry {
  timestamps: number[];
}

/** In-memory sliding-window store. */
class MemoryRateLimiter {
  private store = new Map<string, MemoryStoreEntry>();

  check(key: string, limit: number, windowMs: number, now: number): RateLimitResult {
    const entry = this.store.get(key) || { timestamps: [] };
    const windowStart = now - windowMs;
    const validTimestamps = entry.timestamps.filter((timestamp) => timestamp > windowStart);

    if (validTimestamps.length >= limit) {
      const oldestTimestamp = validTimestamps[0];
      const reset = oldestTimestamp + windowMs;
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
        retryAfterSec: Math.max(1, Math.ceil((reset - now) / 1000)),
      };
    }

    validTimestamps.push(now);
    this.store.set(key, { timestamps: validTimestamps });
    return {
      success: true,
      limit,
      remaining: limit - validTimestamps.length,
      reset: now + windowMs,
      retryAfterSec: 0,
    };
  }

  cleanup(now: number, maxAgeMs: number = 3600 * 1000): void {
    for (const [key, entry] of this.store.entries()) {
      const recent = entry.timestamps.filter((timestamp) => now - timestamp < maxAgeMs);
      if (recent.length === 0) this.store.delete(key);
      else this.store.set(key, { timestamps: recent });
    }
  }
}

const memoryLimiter = new MemoryRateLimiter();

export function checkMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number
): RateLimitResult {
  return memoryLimiter.check(key, limit, windowMs, now);
}
