import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";
import { SECURITY_HEADERS } from "@/lib/security/headers";

const ADMIN_ROLES = ["superadmin", "admin", "manager"];
const ALL_AUTHENTICATED_ROLES = ["superadmin", "admin", "manager", "mentor", "student"];

function withSecurityHeaders(response: NextResponse): NextResponse {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    try {
      response.headers.set(name, value);
    } catch {
      // Ignore read-only headers implementations.
    }
  }
  return response;
}

function unauthorizedJson() {
  return withSecurityHeaders(
    NextResponse.json(
      { error: "Autentifikatsiya talab qilinadi (Unauthorized)" },
      { status: 401 }
    )
  );
}

function forbiddenJson() {
  return withSecurityHeaders(
    NextResponse.json(
      { error: "Ruxsat etilmagan amal (Forbidden)" },
      { status: 403 }
    )
  );
}

export async function middleware(request: NextRequest) {
  if (!request || !request.nextUrl) {
    return withSecurityHeaders(NextResponse.next());
  }

  const pathname = request.nextUrl.pathname || "";

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isStudentCabinetRoute = pathname.startsWith("/kabinet") || pathname.startsWith("/api/kabinet");

  if (!isAdminRoute && !isStudentCabinetRoute) {
    return withSecurityHeaders(NextResponse.next());
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
      return withSecurityHeaders(NextResponse.redirect(new URL("/admin", request.url)));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return unauthorizedJson();
    }
    if (isAdminRoute) {
      const adminLoginUrl = new URL("/admin/login", request.url);
      adminLoginUrl.searchParams.set("redirect", pathname);
      return withSecurityHeaders(NextResponse.redirect(adminLoginUrl));
    }
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("auth", "1");
    loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (isAdminRoute) {
    if (!session.role || !ADMIN_ROLES.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return forbiddenJson();
      }
      return withSecurityHeaders(NextResponse.redirect(new URL("/kabinet", request.url)));
    }
  }

  if (isStudentCabinetRoute) {
    if (!session.role || !ALL_AUTHENTICATED_ROLES.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return forbiddenJson();
      }
      return withSecurityHeaders(NextResponse.redirect(new URL("/", request.url)));
    }
  }

  const requestHeaders = new Headers(request.headers || {});
  requestHeaders.set("x-user-id", session.userId || "");
  requestHeaders.set("x-user-role", session.role || "student");
  requestHeaders.set("x-session-id", session.sessionId || session.userId || "");

  return withSecurityHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  );
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/kabinet/:path*", "/api/kabinet/:path*"],
};
