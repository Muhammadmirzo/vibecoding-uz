import type { RateLimitResult } from "./presets";

export async function checkRedisRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  now: number
): Promise<RateLimitResult | null> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) return null;

  try {
    const windowMs = windowSeconds * 1000;
    const windowBucket = Math.floor(now / windowMs);
    const redisKey = `${key}:${windowBucket}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${redisUrl}/pipeline`, {
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
    if (!response.ok) return null;

    const data: unknown = await response.json();
    const currentCount = Array.isArray(data)
      && typeof data[0] === "object"
      && data[0] !== null
      && "result" in data[0]
      && typeof data[0].result === "number"
      ? data[0].result
      : 1;
    const reset = (windowBucket + 1) * windowMs;

    if (currentCount > limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
        retryAfterSec: Math.max(1, Math.ceil((reset - now) / 1000)),
      };
    }

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - currentCount),
      reset,
      retryAfterSec: 0,
    };
  } catch (error) {
    console.warn("[RateLimit] Upstash Redis request failed, falling back to Memory Store:", error);
    return null;
  }
}
