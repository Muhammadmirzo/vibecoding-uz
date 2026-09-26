import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";
import { contentSecurityPolicy, SECURITY_HEADERS } from "@/lib/security/headers";
import { isClosedRoute } from "@/lib/features/closed";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/request-id";

const ADMIN_ROLES = ["superadmin", "admin", "manager"];
const ALL_AUTHENTICATED_ROLES = ["superadmin", "admin", "manager", "mentor", "student"];

type Ctx = { nonce: string; requestId: string };

function withSecurityHeaders(response: NextResponse, { nonce, requestId }: Ctx): NextResponse {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    try {
      response.headers.set(name, value);
    } catch {
      // Ignore read-only headers implementations.
    }
  }
  response.headers.set("Content-Security-Policy", contentSecurityPolicy(nonce));
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

/** Forwarded request headers: nonce/CSP for rendering + the request id for route handlers and logs. */
function forwardedHeaders(request: NextRequest, { nonce, requestId }: Ctx): Headers {
  const headers = new Headers(request.headers || {});
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", contentSecurityPolicy(nonce));
  headers.set(REQUEST_ID_HEADER, requestId);
  return headers;
}

function unauthorizedJson(ctx: Ctx) {
  return withSecurityHeaders(
    NextResponse.json(
      { error: "Autentifikatsiya talab qilinadi (Unauthorized)" },
      { status: 401 }
    ),
    ctx
  );
}

function forbiddenJson(ctx: Ctx) {
  return withSecurityHeaders(
    NextResponse.json(
      { error: "Ruxsat etilmagan amal (Forbidden)" },
      { status: 403 }
    ),
    ctx
  );
}

export async function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const ctx: Ctx = { nonce, requestId: resolveRequestId(request?.headers?.get(REQUEST_ID_HEADER)) };
  if (!request || !request.nextUrl) {
    return withSecurityHeaders(NextResponse.next(), ctx);
  }

  const pathname = request.nextUrl.pathname || "";

  // W10: yopiq funksiyalar sahifalari (reestr: src/lib/features/closed.ts)
  // hidden va unreachable — kod saqlanadi, bayroq ochilganda qaytadi.
  // Layout'dagi notFound() statik prerenderda 200 qaytargani uchun
  // real 404 shu yerda kafolatlanadi.
  if (isClosedRoute(pathname)) {
    return withSecurityHeaders(
      new NextResponse("Bu sahifa topilmadi", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      }),
      ctx,
    );
  }

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isStudentCabinetRoute = pathname.startsWith("/kabinet") || pathname.startsWith("/api/kabinet");

  if (!isAdminRoute && !isStudentCabinetRoute) {
    return withSecurityHeaders(NextResponse.next({ request: { headers: forwardedHeaders(request, ctx) } }), ctx);
  }

  let token: string | undefined;
  try {
    token = request.cookies?.get(SESSION_COOKIE_NAME)?.value;
  } catch {
    token = undefined;
  }

  // NOTE (Edge): this is a signature + expiry check only. It cannot consult
  // the sessions table here, so logout/role revocation is enforced by the
  // DB-backed requireAuth()/requireAdmin()/requireMentor() gates inside each
  // protected route handler (defense in depth; also mitigates CVE-2025-29927
  // class middleware-bypass issues).
  const session = token ? await verifySessionToken(token) : null;

  // Allow public access to /admin/login
  if (pathname.startsWith("/admin/login")) {
    if (session && session.role && ADMIN_ROLES.includes(session.role)) {
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)), ctx);
    }
    return withSecurityHeaders(NextResponse.next({ request: { headers: forwardedHeaders(request, ctx) } }), ctx);
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return unauthorizedJson(ctx);
    }
    if (isAdminRoute) {
      const adminLoginUrl = new URL("/admin/login", request.url);
      adminLoginUrl.searchParams.set("redirect", pathname);
      return withSecurityHeaders(NextResponse.redirect(adminLoginUrl), ctx);
    }
    // /kabinet (exact) renders its own server-side guest CTA (cheap cookie
    // check, no DB) so a guest gets LCP content on the first response
    // instead of a 307 round trip to "/". Subpages still redirect: they
    // assume an authenticated shell.
    if (pathname === "/kabinet" || pathname === "/kabinet/") {
      return withSecurityHeaders(
        NextResponse.next({ request: { headers: forwardedHeaders(request, ctx) } }),
        ctx
      );
    }
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "1");
    loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
    return withSecurityHeaders(NextResponse.redirect(loginUrl), ctx);
  }

  if (isAdminRoute) {
    if (!session.role || !ADMIN_ROLES.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return forbiddenJson(ctx);
      }
      return withSecurityHeaders(NextResponse.redirect(new URL("/kabinet", request.url)), ctx);
    }
  }

  if (isStudentCabinetRoute) {
    if (!session.role || !ALL_AUTHENTICATED_ROLES.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return forbiddenJson(ctx);
      }
      return withSecurityHeaders(NextResponse.redirect(new URL("/", request.url)), ctx);
    }
  }

  const requestHeaders = forwardedHeaders(request, ctx);
  requestHeaders.set("x-user-id", session.userId || "");
  requestHeaders.set("x-user-role", session.role || "student");
  requestHeaders.set("x-session-id", session.sessionId || session.userId || "");

  return withSecurityHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
    ctx
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)"],
};
