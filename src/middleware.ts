import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";
import { contentSecurityPolicy, SECURITY_HEADERS } from "@/lib/security/headers";

const ADMIN_ROLES = ["superadmin", "admin", "manager"];
const ALL_AUTHENTICATED_ROLES = ["superadmin", "admin", "manager", "mentor", "student"];

function withSecurityHeaders(response: NextResponse, nonce: string): NextResponse {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    try {
      response.headers.set(name, value);
    } catch {
      // Ignore read-only headers implementations.
    }
  }
  response.headers.set("Content-Security-Policy", contentSecurityPolicy(nonce));
  return response;
}

function unauthorizedJson(nonce: string) {
  return withSecurityHeaders(
    NextResponse.json(
      { error: "Autentifikatsiya talab qilinadi (Unauthorized)" },
      { status: 401 }
    ),
    nonce
  );
}

function forbiddenJson(nonce: string) {
  return withSecurityHeaders(
    NextResponse.json(
      { error: "Ruxsat etilmagan amal (Forbidden)" },
      { status: 403 }
    ),
    nonce
  );
}

export async function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  if (!request || !request.nextUrl) {
    return withSecurityHeaders(NextResponse.next(), nonce);
  }

  const pathname = request.nextUrl.pathname || "";

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isStudentCabinetRoute = pathname.startsWith("/kabinet") || pathname.startsWith("/api/kabinet");

  if (!isAdminRoute && !isStudentCabinetRoute) {
    const publicRequestHeaders = new Headers(request.headers);
    publicRequestHeaders.set("x-nonce", nonce);
    return withSecurityHeaders(NextResponse.next({ request: { headers: publicRequestHeaders } }), nonce);
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
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)), nonce);
    }
    return withSecurityHeaders(NextResponse.next(), nonce);
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return unauthorizedJson(nonce);
    }
    if (isAdminRoute) {
      const adminLoginUrl = new URL("/admin/login", request.url);
      adminLoginUrl.searchParams.set("redirect", pathname);
      return withSecurityHeaders(NextResponse.redirect(adminLoginUrl), nonce);
    }
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "1");
    loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
    return withSecurityHeaders(NextResponse.redirect(loginUrl), nonce);
  }

  if (isAdminRoute) {
    if (!session.role || !ADMIN_ROLES.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return forbiddenJson(nonce);
      }
      return withSecurityHeaders(NextResponse.redirect(new URL("/kabinet", request.url)), nonce);
    }
  }

  if (isStudentCabinetRoute) {
    if (!session.role || !ALL_AUTHENTICATED_ROLES.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return forbiddenJson(nonce);
      }
      return withSecurityHeaders(NextResponse.redirect(new URL("/", request.url)), nonce);
    }
  }

  const requestHeaders = new Headers(request.headers || {});
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-user-id", session.userId || "");
  requestHeaders.set("x-user-role", session.role || "student");
  requestHeaders.set("x-session-id", session.sessionId || session.userId || "");

  return withSecurityHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    }),
    nonce
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)"],
};
