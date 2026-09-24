const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { expiresAt: number; value: Promise<unknown> }>();

export async function cachedAnalytics<T>(key: string, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key);
  if (existing && existing.expiresAt > now) return existing.value as Promise<T>;
  const value = load();
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, value });
  try {
    return await value;
  } catch (error) {
    cache.delete(key);
    throw error;
  }
}

export function analyticsCacheKey(report: string, range: { from: Date; to: Date; granularity?: string; metric?: string; compare?: boolean }): string {
  return [
    report,
    range.from.toISOString(),
    range.to.toISOString(),
    range.granularity ?? "day",
    range.metric ?? "",
    range.compare,
  ].join(":");
}
