import { z } from "zod";
import type { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/v1/respond";
import { v1Public } from "@/lib/api/v1/with-v1";
import { passesCsrfCheck } from "@/lib/security/headers";
import { checkRateLimit, createRateLimitResponse } from "@/lib/security/rateLimit";
import { analyticsBatchSchema } from "@/features/analytics/contracts";
import { analyticsEventRepository } from "@/features/analytics/server/event.repository";
import {
  createVisitorToken,
  hashVisitorToken,
  ingestAnalyticsBatch,
  isAnalyticsBot,
} from "@/features/analytics/server/ingest";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "post",
  path: "/api/v1/events",
  tags: ["analytics"],
  summary: "Birinchi tomon analitika hodisalari (batch, anonim tashrifchi cookie)",
  request: { body: { content: { "application/json": { schema: analyticsBatchSchema } } } },
  responses: {
    202: { description: "Qabul qilindi", content: { "application/json": { schema: z.object({ accepted: z.number().int().nonnegative() }) } } },
    403: { description: "CSRF" },
    429: { description: "Juda ko'p so'rov" },
  },
});

const MAX_BODY_BYTES = 16 * 1024;
const VISITOR_COOKIE = "vibe_visitor";
const VISITOR_COOKIE_MAX_AGE = 13 * 30 * 24 * 60 * 60;
const RATE_LIMIT = { limit: 60, windowSeconds: 60, prefix: "analytics_events" } as const;

function validCountry(value: string | null): string | null {
  return value && /^[A-Za-z]{2}$/.test(value) ? value.toUpperCase() : null;
}

export async function POST(request: NextRequest) {
  return v1Public(request, async () => {
    if (!passesCsrfCheck(request)) return fail(new Response(null, { status: 403 }));

    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) return fail(new Response(null, { status: 400 }));

    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return fail(new Response(null, { status: 400 }));
    }
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return fail(new Response(null, { status: 400 }));
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return fail(new Response(null, { status: 400 }));
    }
    const parsed = analyticsBatchSchema.safeParse(body);
    if (!parsed.success) return fail(parsed.error);

    const cookieToken = request.cookies.get(VISITOR_COOKIE)?.value;
    const headerToken = request.headers.get("x-visitor-token")?.trim();
    const suppliedToken = headerToken || cookieToken;
    const visitorToken = suppliedToken && suppliedToken.length >= 16
      ? suppliedToken
      : createVisitorToken();

    const limit = await checkRateLimit(hashVisitorToken(visitorToken), RATE_LIMIT);
    if (!limit.success) return fail(createRateLimitResponse(limit));

    const bot = isAnalyticsBot(request.headers.get("user-agent"));
    let accepted = 0;
    if (!bot) {
      try {
        accepted = await ingestAnalyticsBatch(parsed.data.events, {
          visitorToken,
          country: validCountry(request.headers.get("x-vercel-ip-country")),
        }, { repository: analyticsEventRepository });
      } catch (error) {
        console.warn("[analytics] event batch dropped because storage is unavailable", {
          cause: error instanceof Error ? error.name : "unknown",
        });
      }
    }

    const response = ok({ accepted }, undefined, { status: 202 });
    if (!suppliedToken) {
      response.cookies.set(VISITOR_COOKIE, visitorToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: VISITOR_COOKIE_MAX_AGE,
      });
    }
    return response;
  });
}
