import { ServiceError } from "@/lib/http/errors";
import type { AuthSessionRepository } from "./auth-session.repository";

export interface SessionTokenVerifier {
  verify(token: string): Promise<{ sessionId?: unknown } | null>;
}

/**
 * Logout use case: best-effort session-row delete. Never throws for a
 * missing/invalid token — the route always clears the cookie, so logout
 * succeeds even when the DB write fails (identical legacy semantics).
 */
export async function logoutSession(
  repo: AuthSessionRepository,
  verifier: SessionTokenVerifier,
  token: string | null | undefined,
): Promise<{ revoked: boolean }> {
  if (!token) return { revoked: false };
  let sessionId: string | null = null;
  try {
    const payload = await verifier.verify(token);
    const raw = payload?.sessionId;
    sessionId = typeof raw === "string" && raw.length > 0 ? raw : null;
  } catch {
    return { revoked: false };
  }
  if (!sessionId) return { revoked: false };
  try {
    await repo.deleteSession(sessionId);
  } catch (error) {
    throw new ServiceError("PROVIDER_UNAVAILABLE", "Sessiyani o'chirishda xatolik", 503);
  }
  return { revoked: true };
}
