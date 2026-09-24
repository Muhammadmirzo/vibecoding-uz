import { afterEach, describe, expect, it, vi } from "vitest";

// Regression: in production missing/failing shared backends (Upstash Redis,
// Postgres) must degrade to the per-instance limiter instead of throwing
// (throwing took login/OTP/leads down).
describe("checkRateLimit without Redis in production", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("falls back to memory limits instead of throwing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    vi.stubEnv("DATABASE_URL", "");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { checkRateLimit } = await import("@/lib/security/rateLimit");

    const config = { limit: 2, windowSeconds: 60, prefix: "degrade-test" };
    await expect(checkRateLimit("1.2.3.4", config)).resolves.toMatchObject({ success: true });
    await expect(checkRateLimit("1.2.3.4", config)).resolves.toMatchObject({ success: true });
    await expect(checkRateLimit("1.2.3.4", config)).resolves.toMatchObject({ success: false });
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
