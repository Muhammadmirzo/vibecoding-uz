import { validateSessionCookie, SessionRecord } from "../lib/auth/session";

export type UserRole = "superadmin" | "admin" | "manager" | "mentor" | "student";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  superadmin: 50,
  admin: 40,
  manager: 30,
  mentor: 20,
  student: 10,
};

export function isRoleAtLeast(userRole: string, minRole: UserRole): boolean {
  const userRank = ROLE_HIERARCHY[userRole as UserRole] ?? 0;
  const minRank = ROLE_HIERARCHY[minRole] ?? 0;
  return userRank >= minRank;
}

export function hasRole(userRole: string | null | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export interface RouteRule {
  prefix: string;
  allowedRoles: UserRole[] | "public";
}

export const ROUTE_PERMISSIONS: RouteRule[] = [
  { prefix: "/admin/system", allowedRoles: ["superadmin"] },
  { prefix: "/admin", allowedRoles: ["superadmin", "admin"] },
  { prefix: "/crm", allowedRoles: ["superadmin", "admin", "manager"] },
  { prefix: "/mentor", allowedRoles: ["superadmin", "admin", "mentor"] },
  { prefix: "/cabinet", allowedRoles: ["superadmin", "admin", "manager", "mentor", "student"] },
  { prefix: "/lms", allowedRoles: ["superadmin", "admin", "manager", "mentor", "student"] },
];

export interface AuthorizationResult {
  authorized: boolean;
  reason?: "UNAUTHENTICATED" | "UNAUTHORIZED_ROLE";
  allowedRoles?: string[];
  redirectUrl?: string;
}

export function authorizeRoute(
  pathname: string,
  userRole: string | null | undefined
): AuthorizationResult {
  // Find matching route rule (longest matching prefix)
  const matchedRule = ROUTE_PERMISSIONS.slice()
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((rule) => pathname.startsWith(rule.prefix));

  // If route has no rule or is public, allow access
  if (!matchedRule || matchedRule.allowedRoles === "public") {
    return { authorized: true };
  }

  // If route requires auth and user is unauthenticated
  if (!userRole) {
    return {
      authorized: false,
      reason: "UNAUTHENTICATED",
      allowedRoles: matchedRule.allowedRoles,
      redirectUrl: "/login",
    };
  }

  // Check if user role is in allowed roles
  if (!matchedRule.allowedRoles.includes(userRole as UserRole)) {
    return {
      authorized: false,
      reason: "UNAUTHORIZED_ROLE",
      allowedRoles: matchedRule.allowedRoles,
      redirectUrl: "/unauthorized",
    };
  }

  return { authorized: true };
}

export interface MiddlewareRequest {
  pathname: string;
  headers: Record<string, string | undefined>;
}

export interface MiddlewareResponse {
  status: 200 | 401 | 403;
  authorized: boolean;
  error?: "UNAUTHENTICATED" | "UNAUTHORIZED_ROLE" | "INVALID_SESSION";
  userRole?: string;
  userId?: string;
  redirectUrl?: string;
}

export function rbacMiddleware(
  req: MiddlewareRequest,
  options: {
    secret: string;
    sessionLookup: (sessionId: string) => SessionRecord | null | undefined;
    now?: Date;
  }
): MiddlewareResponse {
  const cookieHeader = req.headers["cookie"] || req.headers["Cookie"];
  const validation = validateSessionCookie(cookieHeader, options.secret, options.sessionLookup, options.now);

  const activeRole = validation.valid && validation.session ? validation.session.role : null;
  const authCheck = authorizeRoute(req.pathname, activeRole);

  if (authCheck.authorized) {
    return {
      status: 200,
      authorized: true,
      userRole: activeRole || undefined,
      userId: validation.session?.userId,
    };
  }

  if (authCheck.reason === "UNAUTHENTICATED") {
    return {
      status: 401,
      authorized: false,
      error: "UNAUTHENTICATED",
      redirectUrl: authCheck.redirectUrl,
    };
  }

  return {
    status: 403,
    authorized: false,
    error: "UNAUTHORIZED_ROLE",
    redirectUrl: authCheck.redirectUrl,
  };
}
