import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/security/rateLimit/redisLimiter", () => ({
  checkRedisRateLimit: async () => ({ success: true, limit: 10, remaining: 9, reset: 1, retryAfterSec: 0 }),
}));

const { mockPgCheck } = vi.hoisted(() => ({ mockPgCheck: vi.fn() }));
vi.mock("@/lib/security/rateLimit/postgresLimiter", () => ({
  checkPostgresRateLimit: mockPgCheck,
  cleanupRateLimitBuckets: async () => undefined,
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  mockPgCheck.mockReset();
});

/** Redis answers → Postgres must never be touched (order: Upstash first). */
describe("W10 Redis-first order", () => {
  it("prefers Redis and skips Postgres when Redis answers", async () => {
    mockPgCheck.mockRejectedValue(new Error("must not be called"));
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DATABASE_URL", "postgres://test/test");
    const { checkRateLimit } = await import("@/lib/security/rateLimit");
    const result = await checkRateLimit("order-redis", { limit: 10, windowSeconds: 60, prefix: "w10-order" });
    expect(result).toMatchObject({ success: true, remaining: 9 });
    expect(mockPgCheck).not.toHaveBeenCalled();
  });
});
