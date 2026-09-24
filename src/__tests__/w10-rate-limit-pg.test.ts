import { PgDialect } from "drizzle-orm/pg-core";
import { afterEach, describe, expect, it, vi } from "vitest";

const { mockDbExecute } = vi.hoisted(() => ({ mockDbExecute: vi.fn() }));
vi.mock("@/db", () => ({ db: { execute: mockDbExecute } }));

import {
  buildCheckQuery,
  checkPostgresRateLimit,
  cleanupCutoff,
  cleanupRateLimitBuckets,
  windowStartMs,
  type BucketRow,
  type PostgresQueryRunner,
} from "@/lib/security/rateLimit/postgresLimiter";

function fakeRunner(rows: BucketRow[], onQuery?: (text: string) => void): PostgresQueryRunner {
  return async (query) => {
    if (onQuery) onQuery(sqlText(query));
    return rows;
  };
}

/** Best-effort text extraction from a drizzle SQL template (for assertions). */
function sqlText(query: unknown): string {
  const chunks = (query as { queryChunks?: unknown[] }).queryChunks ?? [];
  return chunks
    .map((chunk) => {
      if (chunk && typeof chunk === "object" && "value" in chunk) {
        const value = (chunk as { value: unknown }).value;
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.filter((part) => typeof part === "string").join("");
      }
      return " ? ";
    })
    .join("");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
  mockDbExecute.mockReset();
});

describe("W10 postgres rate limiter", () => {
  it("anchors fixed windows and computes cleanup cutoffs", () => {
    expect(windowStartMs(61_000, 60_000)).toBe(60_000);
    expect(windowStartMs(119_999, 60_000)).toBe(60_000);
    expect(cleanupCutoff(1_000_000, 7200).getTime()).toBe(1_000_000 - 7_200_000);
  });

  it("issues a single atomic upsert (no read-then-write race)", () => {
    const text = sqlText(buildCheckQuery("k", new Date(60_000))).toUpperCase();
    expect(text).toContain("INSERT INTO");
    expect(text).toContain("ON CONFLICT");
    expect(text).toContain("EXCLUDED");
    expect(text).toContain("RETURNING");
    // Expired windows reset, live windows increment — inside one statement.
    expect(text).toContain("CASE WHEN");
  });

  it("allows under-limit hits with decreasing remaining", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://test/test");
    const first = await checkPostgresRateLimit("k", 3, 60, 61_000, fakeRunner([{ count: 1, window_start: new Date(60_000) }]));
    expect(first).toMatchObject({ success: true, limit: 3, remaining: 2, retryAfterSec: 0 });
    const last = await checkPostgresRateLimit("k", 3, 60, 61_000, fakeRunner([{ count: 3, window_start: new Date(60_000) }]));
    expect(last).toMatchObject({ success: true, limit: 3, remaining: 0 });
  });

  it("blocks over-limit hits with a retry-after inside the same window", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://test/test");
    const blocked = await checkPostgresRateLimit("k", 2, 60, 70_000, fakeRunner([{ count: 5, window_start: new Date(60_000) }]));
    expect(blocked).toMatchObject({ success: false, limit: 2, remaining: 0, reset: 120_000 });
    expect(blocked?.retryAfterSec).toBeGreaterThan(0);
  });

  it("treats string counts and empty results safely (never throws)", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://test/test");
    const fromString = await checkPostgresRateLimit("k", 5, 60, 61_000, fakeRunner([{ count: "2", window_start: new Date() }]));
    expect(fromString).toMatchObject({ success: true, remaining: 3 });
    const empty = await checkPostgresRateLimit("k", 5, 60, 61_000, fakeRunner([]));
    expect(empty).toMatchObject({ success: true });
  });

  it("returns null without touching the DB when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const runner = vi.fn(async () => []);
    await expect(checkPostgresRateLimit("k", 5, 60, 61_000, runner)).resolves.toBeNull();
    expect(runner).not.toHaveBeenCalled();
  });

  it("fails open (null, never throws) when the DB is down", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://test/test");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const failing: PostgresQueryRunner = async () => { throw new Error("connection refused"); };
    await expect(checkPostgresRateLimit("k", 5, 60, 61_000, failing)).resolves.toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("cleans up expired buckets and never fails the caller", async () => {
    vi.stubEnv("DATABASE_URL", "postgres://test/test");
    const seen: string[] = [];
    await cleanupRateLimitBuckets(7200, fakeRunner([], (text) => seen.push(text)));
    expect(seen.join(" ").toUpperCase()).toContain("DELETE FROM");
    await expect(cleanupRateLimitBuckets(7200, async () => { throw new Error("down"); })).resolves.toBeUndefined();
    vi.stubEnv("DATABASE_URL", "");
    const runner = vi.fn(async () => []);
    await cleanupRateLimitBuckets(7200, runner);
    expect(runner).not.toHaveBeenCalled();
  });
});

describe("W10 fallback order (Upstash → Postgres → memory)", () => {
  it("uses Postgres when Redis env is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("DATABASE_URL", "postgres://test/test");
    mockDbExecute.mockResolvedValue([{ count: 1, window_start: new Date() }]);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { checkRateLimit } = await import("@/lib/security/rateLimit");
    const result = await checkRateLimit("order-pg", { limit: 7, windowSeconds: 60, prefix: "w10-order" });
    expect(result).toMatchObject({ success: true, limit: 7, remaining: 6 });
    expect(mockDbExecute).toHaveBeenCalled();
    const text = sqlText(mockDbExecute.mock.calls[0][0]).toUpperCase();
    expect(text).toContain("INSERT INTO");
    expect(text).toContain("RATE_LIMIT_BUCKETS");
    warn.mockRestore();
  });

  it("degrades to memory (never throws) when Postgres is down", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("DATABASE_URL", "postgres://test/test");
    mockDbExecute.mockRejectedValue(new Error("connection refused"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { checkRateLimit } = await import("@/lib/security/rateLimit");
    const config = { limit: 2, windowSeconds: 60, prefix: "w10-degraded" };
    await expect(checkRateLimit("order-mem", config)).resolves.toMatchObject({ success: true, limit: 2 });
    await expect(checkRateLimit("order-mem", config)).resolves.toMatchObject({ success: true });
    await expect(checkRateLimit("order-mem", config)).resolves.toMatchObject({ success: false });
    warn.mockRestore();
  });

  it("hashes identifiers so storage keys never contain raw IPs", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const { checkRateLimit, hashRateLimitIdentifier } = await import("@/lib/security/rateLimit");
    const hashed = await hashRateLimitIdentifier("1.2.3.4");
    expect(hashed).not.toContain("1.2.3.4");
    expect(hashed).toMatch(/^[0-9a-f]{32}$/);
    await expect(checkRateLimit("1.2.3.4", { limit: 1, windowSeconds: 60, prefix: "w10-hash" })).resolves.toMatchObject({ success: true });
    await expect(checkRateLimit("1.2.3.4", { limit: 1, windowSeconds: 60, prefix: "w10-hash" })).resolves.toMatchObject({ success: false });
  });
  it("sends only primitive params — postgres-js rejects raw Date objects in production", () => {
    const { params } = new PgDialect().sqlToQuery(buildCheckQuery("k", new Date(60_000)));
    expect(params.some((param) => param instanceof Date)).toBe(false);
    expect(params).toContain(new Date(60_000).toISOString());
  });
});
