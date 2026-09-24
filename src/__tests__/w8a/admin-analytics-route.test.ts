import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const requireAdmin = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/require-auth", () => ({ requireAdmin }));
vi.mock("@/features/analytics/server/analytics.repository", () => ({ drizzleAnalyticsRepository: {} }));
vi.mock("@/features/analytics/server/analytics.service", () => ({ getAnalyticsReport: vi.fn().mockResolvedValue({ summary: "ok" }) }));

import { GET } from "@/app/api/v1/admin/analytics/[report]/route";

function context(report = "overview") { return { params: Promise.resolve({ report }) }; }
function request(url = "https://master-2-jade.vercel.app/api/v1/admin/analytics/overview?from=2026-09-01&to=2026-09-08") { return new Request(url); }

beforeEach(() => requireAdmin.mockReset().mockResolvedValue({ ok: true, session: { userId: "u", role: "admin", sessionId: "s" } }));

describe("GET /api/v1/admin/analytics/[report]", () => {
  it("returns 401 when unauthenticated", async () => {
    requireAdmin.mockResolvedValue({ ok: false, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) });
    const response = await GET(request(), context());
    expect(response.status).toBe(401);
  });
  it("returns 403 when the authenticated role is forbidden", async () => {
    requireAdmin.mockResolvedValue({ ok: false, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) });
    expect((await GET(request(), context())).status).toBe(403);
  });
  it("returns a v1 envelope for an admin report", async () => {
    const response = await GET(request(), context());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { summary: "ok" } });
  });
  it("rejects an unknown report", async () => {
    const response = await GET(request("https://master-2-jade.vercel.app/api/v1/admin/analytics/nope?from=2026-09-01&to=2026-09-08"), context("nope"));
    expect(response.status).toBe(400);
  });
});
