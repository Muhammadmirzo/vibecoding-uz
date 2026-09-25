import { describe, expect, it } from "vitest";
import { fail } from "@/lib/api/v1/respond";
import { createRateLimitResponse } from "@/lib/security/rateLimit";

/**
 * Regression test for a real bug: several v1 routes (auth/token, auth/refresh,
 * auth/telegram/start, auth/telegram/status, homework) used to `return
 * createRateLimitResponse(limited)` directly instead of `fail(createRateLimitResponse(limited))`.
 * `createRateLimitResponse` returns the *legacy* error shape (`{ error: "text", retryAfterSec }`),
 * not the documented v1 envelope (`{ error: { code, message } }`) — so mobile clients parsing
 * `error.code` would get `undefined` on every 429. `fail()` normalizes it; this test locks that in.
 */
describe("v1 rate-limit responses use the documented error envelope", () => {
  it("wraps a legacy rate-limit Response into { error: { code, message } } and keeps Retry-After", async () => {
    const legacy = createRateLimitResponse({ success: false, limit: 10, remaining: 0, reset: Date.now() + 5000, retryAfterSec: 5 });
    // Sanity check: the legacy helper itself still returns the old shape.
    const legacyBody = await legacy.clone().json();
    expect(legacyBody).not.toHaveProperty("error.code");
    expect(typeof legacyBody.error).toBe("string");

    const v1Response = await fail(createRateLimitResponse({ success: false, limit: 10, remaining: 0, reset: Date.now() + 5000, retryAfterSec: 5 }));
    expect(v1Response.status).toBe(429);
    expect(v1Response.headers.get("Retry-After")).toBe("5");
    const body = await v1Response.json();
    expect(body.error.code).toBe("rate_limited");
    expect(typeof body.error.message).toBe("string");
  });
});
