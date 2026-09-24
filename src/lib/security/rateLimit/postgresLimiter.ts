import { sql, type SQL } from "drizzle-orm";
import type { RateLimitResult } from "./presets";

/**
 * Postgres-backed fixed-window rate limiter (W10).
 *
 * One atomic UPSERT per check, so concurrent serverless instances share the
 * same counter: expired windows reset to 1, live windows increment.
 * `key` already contains a SHA-256 hash (see index.ts) — raw IPs are never
 * stored. Any DB failure returns `null` so the caller can degrade to the
 * per-instance memory limiter; this function never throws.
 */

export interface BucketRow {
  count: number | string | null;
  window_start: Date | string | null;
}

export type PostgresQueryRunner = (query: SQL<unknown>) => Promise<unknown>;

function normalizeRows(raw: unknown): BucketRow[] {
  if (Array.isArray(raw)) return raw as BucketRow[];
  if (raw && typeof raw === "object" && Array.isArray((raw as { rows?: unknown }).rows)) {
    return (raw as { rows: BucketRow[] }).rows;
  }
  return [];
}

async function defaultRunner(query: SQL<unknown>): Promise<unknown> {
  const { db } = await import("@/db");
  return db.execute(query);
}

function toCount(value: BucketRow["count"]): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) ? parsed : 1;
}

/** Upper bound for one Postgres attempt — requests must never wait on the DB. */
const PG_TIMEOUT_MS = 1000;
const TIMED_OUT = Symbol("rate-limit-timeout");

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | typeof TIMED_OUT> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<typeof TIMED_OUT>((resolve) => {
    timer = setTimeout(() => resolve(TIMED_OUT), ms);
  });
  return Promise.race([
    promise.then(
      (value) => { clearTimeout(timer); return value; },
      (error: unknown) => { clearTimeout(timer); throw error; },
    ),
    timeout,
  ]);
}

/** Fixed-window start (epoch ms) for `now`. Exported for tests. */
export function windowStartMs(now: number, windowMs: number): number {
  return Math.floor(now / windowMs) * windowMs;
}

export function buildCheckQuery(key: string, windowStart: Date): SQL<unknown> {
  return sql`INSERT INTO rate_limit_buckets ("key", window_start, "count")
    VALUES (${key}, ${windowStart}, 1)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN rate_limit_buckets.window_start < EXCLUDED.window_start THEN 1 ELSE rate_limit_buckets."count" + 1 END,
      window_start = CASE WHEN rate_limit_buckets.window_start < EXCLUDED.window_start THEN EXCLUDED.window_start ELSE rate_limit_buckets.window_start END
    RETURNING "count", window_start`;
}

export async function checkPostgresRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  now: number,
  runQuery: PostgresQueryRunner = defaultRunner,
): Promise<RateLimitResult | null> {
  if (!process.env.DATABASE_URL) return null;
  const windowMs = Math.max(1, windowSeconds) * 1000;
  const start = new Date(windowStartMs(now, windowMs));
  const reset = start.getTime() + windowMs;
  try {
    const outcome = await withTimeout(runQuery(buildCheckQuery(key, start)), PG_TIMEOUT_MS);
    if (outcome === TIMED_OUT) {
      console.warn("[rate-limit] Postgres timed out, degrading to memory limits");
      return null;
    }
    const rows = normalizeRows(outcome);
    const count = rows.length > 0 ? toCount(rows[0].count) : 1;
    if (count > limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
        retryAfterSec: Math.max(1, Math.ceil((reset - now) / 1000)),
      };
    }
    return { success: true, limit, remaining: Math.max(0, limit - count), reset, retryAfterSec: 0 };
  } catch (error) {
    console.warn("[rate-limit] Postgres unavailable, degrading to memory limits:", error);
    return null;
  }
}

/** Cutoff for expired-bucket cleanup. Exported for tests. */
export function cleanupCutoff(now: number, maxAgeSeconds: number): Date {
  return new Date(now - Math.max(60, maxAgeSeconds) * 1000);
}

/**
 * Deletes expired buckets. Best-effort: used by the cron route, never throws
 * so a cleanup failure can never fail the cron run.
 */
export async function cleanupRateLimitBuckets(
  maxAgeSeconds = 7200,
  runQuery: PostgresQueryRunner = defaultRunner,
): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const cutoff = cleanupCutoff(Date.now(), maxAgeSeconds);
    await runQuery(sql`DELETE FROM rate_limit_buckets WHERE window_start < ${cutoff}`);
  } catch (error) {
    console.warn("[rate-limit] bucket cleanup failed (ignored):", error);
  }
}
