import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { fail, ok, type V1Meta } from "./respond";
import type { AuthSession } from "@/lib/auth/require-auth";

export const SUPPORTED_LOCALES = ["uz", "ru", "en"] as const;

/** Resolves Accept-Language to a supported locale (content stays Uzbek for now). */
export function resolveLocale(request: Request): "uz" | "ru" | "en" {
  const header = request.headers.get("accept-language") ?? "";
  const first = header.split(",")[0]?.split(";")[0]?.trim().toLowerCase().slice(0, 2);
  if (first === "ru" || first === "en") return first;
  return "uz";
}

export function requestIdOf(request: Request): string {
  return request.headers.get("x-request-id")?.trim() || randomUUID();
}

function withV1Headers(response: NextResponse, request: Request): NextResponse {
  response.headers.set("X-Request-Id", requestIdOf(request));
  response.headers.set("X-Api-Version", "v1");
  response.headers.set("Content-Language", resolveLocale(request));
  return response;
}

export interface V1Context {
  session: AuthSession;
  requestId: string;
  locale: "uz" | "ru" | "en";
}

type AuthedHandler = (ctx: V1Context) => Promise<NextResponse> | NextResponse;

/**
 * Thin v1 wrapper: maps any thrown error / legacy gate response into the v1
 * envelope and stamps every response with X-Request-Id, X-Api-Version and
 * Content-Language. Handlers MUST still call requireAuth/requireAdmin first.
 */
export async function v1(request: Request, handler: AuthedHandler): Promise<NextResponse> {
  try {
    const { requireAuth } = await import("@/lib/auth/require-auth");
    const auth = await requireAuth(request);
    if (!auth.ok) return withV1Headers(await fail(auth.response), request);
    const response = await handler({
      session: auth.session, requestId: requestIdOf(request), locale: resolveLocale(request),
    });
    return withV1Headers(response, request);
  } catch (error) {
    return withV1Headers(await fail(error), request);
  }
}

/**
 * Same as `v1`, but gates on admin roles (superadmin/admin/manager) instead of
 * plain auth. Handlers MUST NOT call requireAuth/requireAdmin themselves.
 */
export async function v1Admin(request: Request, handler: AuthedHandler): Promise<NextResponse> {
  try {
    const { requireAdmin } = await import("@/lib/auth/require-auth");
    const auth = await requireAdmin(request);
    if (!auth.ok) return withV1Headers(await fail(auth.response), request);
    const response = await handler({
      session: auth.session, requestId: requestIdOf(request), locale: resolveLocale(request),
    });
    return withV1Headers(response, request);
  } catch (error) {
    return withV1Headers(await fail(error), request);
  }
}

type PublicHandler = (ctx: { requestId: string; locale: "uz" | "ru" | "en" }) => Promise<NextResponse> | NextResponse;

/** Same envelope + headers for unauthenticated v1 endpoints (token, config, openapi). */
export async function v1Public(request: Request, handler: PublicHandler): Promise<NextResponse> {
  try {
    const response = await handler({ requestId: requestIdOf(request), locale: resolveLocale(request) });
    return withV1Headers(response, request);
  } catch (error) {
    return withV1Headers(await fail(error), request);
  }
}

/** Public GET cache headers: short edge cache, ETag over the body. */
export function cached(data: unknown, meta?: V1Meta, maxAgeSec = 60): NextResponse {
  const body = JSON.stringify(meta ? { data, meta } : { data });
  const etag = `"${createHash("sha256").update(body).digest("hex").slice(0, 27)}"`;
  return NextResponse.json(meta ? { data, meta } : { data }, {
    status: 200,
    headers: { ETag: etag, "Cache-Control": `public, max-age=${maxAgeSec}, stale-while-revalidate=300` },
  });
}

/** Marks a response deprecated per the API deprecation policy (docs/MOBILE_API.md). */
export function sunset(response: NextResponse, sunsetAt: string, successor?: string): NextResponse {
  response.headers.set("Sunset", sunsetAt);
  if (successor) response.headers.set("Deprecation", `version="v1", date="${sunsetAt}"`);
  response.headers.set("Sunset-Policy", "https://naqsh.uz/docs/api-deprecation");
  return response;
}

export { ok };
