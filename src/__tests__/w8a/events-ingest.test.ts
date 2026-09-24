import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const insertMany = vi.hoisted(() => vi.fn());
const rateLimit = vi.hoisted(() => vi.fn());

vi.mock("@/features/analytics/server/event.repository", () => ({
  analyticsEventRepository: { insertMany },
}));
vi.mock("@/lib/security/rateLimit", async () => {
  const { NextResponse } = await import("next/server");
  return {
    checkRateLimit: rateLimit,
    createRateLimitResponse: (result: { retryAfterSec: number }) => NextResponse.json({ error: "rate" }, { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } }),
  };
});

import { POST } from "@/app/api/v1/events/route";

const event = {
  eventId: "11111111-1111-4111-8111-111111111111",
  type: "page_view",
  occurredAt: "2026-09-24T10:00:00.000Z",
  sessionId: "22222222-2222-4222-8222-222222222222",
  path: "/",
  device: "desktop",
  browserFamily: "Chrome",
  props: {},
};

function request(body: unknown, userAgent = "Mozilla/5.0 Chrome/120") {
  return new NextRequest("https://master-2-jade.vercel.app/api/v1/events", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": userAgent, origin: "https://master-2-jade.vercel.app", host: "master-2-jade.vercel.app" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  insertMany.mockReset().mockResolvedValue(1);
  rateLimit.mockReset().mockResolvedValue({ success: true, limit: 60, remaining: 59, reset: Date.now() + 60_000, retryAfterSec: 60 });
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

describe("POST /api/v1/events", () => {
  it("validates and accepts an anonymous batch with a secure visitor cookie", async () => {
    const response = await POST(request({ events: [event] }));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ data: { accepted: 1 } });
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("Secure");
    expect(insertMany).toHaveBeenCalledOnce();
  });

  it("deduplicates by returning the repository insert count", async () => {
    insertMany.mockResolvedValue(0);
    const response = await POST(request({ events: [event] }));
    expect(await response.json()).toEqual({ data: { accepted: 0 } });
  });

  it("filters known bots before storage", async () => {
    const response = await POST(request({ events: [event] }, "HeadlessChrome/120"));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ data: { accepted: 0 } });
    expect(insertMany).not.toHaveBeenCalled();
  });

  it("returns 202 and drops the batch when storage is down", async () => {
    insertMany.mockRejectedValue(new Error("database unavailable"));
    const response = await POST(request({ events: [event] }));
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ data: { accepted: 0 } });
  });

  it("enforces the public write rate limit", async () => {
    rateLimit.mockResolvedValue({ success: false, limit: 60, remaining: 0, reset: Date.now() + 60_000, retryAfterSec: 60 });
    const response = await POST(request({ events: [event] }));
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });

  it("rejects invalid batches", async () => {
    const response = await POST(request({ events: [] }));
    expect(response.status).toBe(400);
    expect(insertMany).not.toHaveBeenCalled();
  });
});
