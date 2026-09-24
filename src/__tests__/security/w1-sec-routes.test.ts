import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

// Route-level regression tests: unauthenticated callers must be rejected
// BEFORE any database access. No cookies are set, so the DB-backed gates
// return 401 without touching the database.
import { GET as adminLeadsGet, POST as adminLeadsPost } from "@/app/api/admin/leads/route";
import { GET as adminUsersGet } from "@/app/api/admin/users/route";
import { GET as adminCohortsGet } from "@/app/api/admin/cohorts/route";
import { POST as portfolioPost } from "@/app/api/portfolio/route";
import { PATCH as portfolioPatch } from "@/app/api/portfolio/[id]/route";
import { POST as homeworkReviewPost } from "@/app/api/admin/homework/[id]/review/route";
import { POST as telegramWebhookPost, GET as telegramWebhookGet } from "@/app/api/telegram/webhook/route";

function jsonRequest(url: string, method: string, body?: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json", host: "app.test" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("W1-SEC: admin routes reject unauthenticated callers", () => {
  it("GET /api/admin/leads -> 401", async () => {
    const res = await adminLeadsGet(jsonRequest("https://app.test/api/admin/leads", "GET"));
    expect(res.status).toBe(401);
  });

  it("POST /api/admin/leads -> 401", async () => {
    const res = await adminLeadsPost(jsonRequest("https://app.test/api/admin/leads", "POST", {}));
    expect(res.status).toBe(401);
  });

  it("GET /api/admin/users -> 401", async () => {
    const res = await adminUsersGet(jsonRequest("https://app.test/api/admin/users", "GET"));
    expect(res.status).toBe(401);
  });

  it("GET /api/admin/cohorts -> 401", async () => {
    const res = await adminCohortsGet();
    expect(res.status).toBe(401);
  });

  it("POST /api/admin/homework/[id]/review -> 401 (no mentor fallback)", async () => {
    const res = await homeworkReviewPost(
      jsonRequest("https://app.test/api/admin/homework/x/review", "POST", {
        mentorId: "123e4567-e89b-12d3-a456-426614174000",
        status: "approved",
      }),
      { params: Promise.resolve({ id: "123e4567-e89b-12d3-a456-426614174000" }) }
    );
    expect(res.status).toBe(401);
  });
});

describe("W1-SEC: open portfolio writes now require admin", () => {
  it("POST /api/portfolio -> 401", async () => {
    const res = await portfolioPost(
      jsonRequest("https://app.test/api/portfolio", "POST", { title: "x" })
    );
    expect(res.status).toBe(401);
  });

  it("PATCH /api/portfolio/[id] -> 401 (before UUID validation)", async () => {
    const res = await portfolioPatch(
      jsonRequest("https://app.test/api/portfolio/1", "PATCH", {}),
      { params: Promise.resolve({ id: "not-a-uuid" }) }
    );
    expect(res.status).toBe(401);
  });
});

describe("W1-SEC: telegram webhook requires the secret header", () => {
  it("POST without secret -> 401, GET stays minimal", async () => {
    const res = await telegramWebhookPost(
      jsonRequest("https://app.test/api/telegram/webhook", "POST", { update_id: 1 })
    );
    expect(res.status).toBe(401);
    const get = await telegramWebhookGet();
    expect(get.status).toBe(200);
    const body = (await get.json()) as Record<string, unknown>;
    expect(body).toEqual({ ok: true });
  });
});
