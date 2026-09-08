import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";

const ADMIN_ROLES = ["superadmin", "admin", "manager"];
const ALL_AUTHENTICATED_ROLES = ["superadmin", "admin", "manager", "mentor", "student"];

export async function middleware(request: NextRequest) {
  if (!request || !request.nextUrl) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname || "";

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isStudentCabinetRoute = pathname.startsWith("/kabinet") || pathname.startsWith("/api/kabinet");

  if (!isAdminRoute && !isStudentCabinetRoute) {
    return NextResponse.next();
  }

  let token: string | undefined;
  try {
    token = request.cookies?.get(SESSION_COOKIE_NAME)?.value;
  } catch {
    token = undefined;
  }

  const session = token ? verifySessionToken(token) : null;

  // Allow public access to /admin/login
  if (pathname.startsWith("/admin/login")) {
    if (session && session.role && ADMIN_ROLES.includes(session.role)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Autentifikatsiya talab qilinadi (Unauthorized)" },
        { status: 401 }
      );
    }
    if (isAdminRoute) {
      const adminLoginUrl = new URL("/admin/login", request.url);
      adminLoginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute) {
    if (!session.role || !ADMIN_ROLES.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Ruxsat etilmagan amal (Forbidden)" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/kabinet", request.url));
    }
  }

  if (isStudentCabinetRoute) {
    if (!session.role || !ALL_AUTHENTICATED_ROLES.includes(session.role)) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Ruxsat etilmagan amal (Forbidden)" },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const requestHeaders = new Headers(request.headers || {});
  requestHeaders.set("x-user-id", session.userId || "");
  requestHeaders.set("x-user-role", session.role || "student");
  requestHeaders.set("x-session-id", session.sessionId || session.userId || "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/kabinet/:path*", "/api/kabinet/:path*"],
};
