import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { verifySessionToken } from "./session/token";
import { parseSessionCookie } from "./session/cookie";
import { SESSION_COOKIE_NAME } from "./session/types";
import { passesCsrfCheck } from "@/lib/security/headers";

/**
 * Defense-in-depth authorization for route handlers (Node runtime).
 *
 * Unlike `verifySessionToken` (signature + expiry only, Edge-safe), every
 * helper here validates the session against the `sessions` table, so logout
 * (row delete) and role changes take effect immediately. Middleware keeps
 * doing the cheap token check on the Edge; handlers MUST use these helpers
 * as the authoritative gate.
 */

export const ADMIN_ROLES = ["superadmin", "admin", "manager"] as const;
export const MENTOR_ROLES = ["superadmin", "admin", "manager", "mentor"] as const;

export interface AuthSession {
  userId: string;
  role: string;
  sessionId: string;
}

export interface SessionDeps {
  verifyToken?: typeof verifySessionToken;
  findSessionById?: (sessionId: string) => Promise<{ id: string; userId: string; expiresAt: Date } | null>;
  findUserRole?: (userId: string) => Promise<string | null>;
  now?: () => number;
}

async function defaultFindSessionById(
  sessionId: string
): Promise<{ id: string; userId: string; expiresAt: Date } | null> {
  const [row] = await db
    .select({ id: sessions.id, userId: sessions.userId, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);
  return row ?? null;
}

async function defaultFindUserRole(userId: string): Promise<string | null> {
  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return row?.role ?? null;
}

async function readCookieToken(explicitHeader?: string | null): Promise<string | null> {
  if (explicitHeader !== undefined) {
    return parseSessionCookie(explicitHeader);
  }
  try {
    const store = await cookies();
    return store.get(SESSION_COOKIE_NAME)?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * DB-backed session resolution. Returns null when the token is missing,
 * invalid, expired, has no backing `sessions` row, or the user is gone.
 * The role is always read fresh from `users` (never trusted from the token).
 */
export async function getDbSession(
  cookieHeader?: string | null,
  deps: SessionDeps = {}
): Promise<AuthSession | null> {
  const token = await readCookieToken(cookieHeader);
  if (!token) return null;

  const verify = deps.verifyToken ?? verifySessionToken;
  const payload = await verify(token);
  if (!payload?.sessionId || !payload?.userId) return null;

  const findSession = deps.findSessionById ?? defaultFindSessionById;
  let record: { id: string; userId: string; expiresAt: Date } | null;
  try {
    record = await findSession(payload.sessionId);
  } catch {
    return null;
  }
  if (!record) return null;

  const now = deps.now ? deps.now() : Date.now();
  if (record.expiresAt.getTime() <= now) return null;

  const findRole = deps.findUserRole ?? defaultFindUserRole;
  let role: string | null;
  try {
    role = await findRole(record.userId);
  } catch {
    return null;
  }
  if (!role) return null;

  return { userId: record.userId, role, sessionId: record.id };
}

export type AuthResult =
  | { ok: true; session: AuthSession }
  | { ok: false; response: NextResponse };

function unauthorized(message = "Avtorizatsiyadan o'tilmagan"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

function forbidden(message = "Ruxsat etilmagan amal (Forbidden)"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

const STATE_CHANGING = new Set(["POST", "PATCH", "PUT", "DELETE"]);

function csrfDenies(request: Request | undefined): boolean {
  if (!request) return false;
  if (!STATE_CHANGING.has(request.method.toUpperCase())) return false;
  return !passesCsrfCheck(request);
}

async function gate(
  cookieHeader: string | null | undefined,
  request: Request | undefined,
  allowedRoles: readonly string[] | null,
  deps: SessionDeps,
  forbiddenMessage: string
): Promise<AuthResult> {
  const session = await getDbSession(cookieHeader, deps);
  if (!session) return { ok: false, response: unauthorized() };
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return { ok: false, response: forbidden(forbiddenMessage) };
  }
  if (request && csrfDenies(request)) {
    return { ok: false, response: forbidden("CSRF tekshiruvi muvaffaqiyatsiz") };
  }
  return { ok: true, session };
}

export interface RequireOptions extends SessionDeps {
  cookieHeader?: string | null;
}

/** Any authenticated user (DB-backed). Pass the Request for CSRF checks on mutations. */
export async function requireAuth(
  request?: Request,
  options: RequireOptions = {}
): Promise<AuthResult> {
  const { cookieHeader, ...deps } = options;
  return gate(cookieHeader, request, null, deps, "Ruxsat etilmagan amal (Forbidden)");
}

/** superadmin/admin/manager only (DB-backed). */
export async function requireAdmin(
  request?: Request,
  options: RequireOptions = {}
): Promise<AuthResult> {
  const { cookieHeader, ...deps } = options;
  return gate(cookieHeader, request, ADMIN_ROLES, deps, "Ruxsat etilmagan amal (Forbidden)");
}

/** admin roles + mentor (homework review). Never trusts body.mentorId. */
export async function requireMentor(
  request?: Request,
  options: RequireOptions = {}
): Promise<AuthResult> {
  const { cookieHeader, ...deps } = options;
  return gate(cookieHeader, request, MENTOR_ROLES, deps, "Baholash huquqi yo'q (Forbidden)");
}
