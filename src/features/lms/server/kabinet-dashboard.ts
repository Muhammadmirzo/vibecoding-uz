import { drizzleKabinetRepository } from "./kabinet-dashboard.repository";
import type {
  KabinetDashboardPayment,
  KabinetInitialData,
} from "@/features/lms/domain/kabinet-dashboard";

export type { KabinetDashboardPayment, KabinetDashboardUser, KabinetInitialData } from "@/features/lms/domain/kabinet-dashboard";

/** Identity taken from the already-verified session cookie (no DB round trip). */
export interface KabinetSessionHint {
  userId: string;
  sessionId: string;
}

export interface KabinetDashboardDeps {
  /** Authoritative gate: the session row must exist, belong to the user and be unexpired. */
  findSessionUser: (sessionId: string, userId: string) => Promise<{ fullName: string } | null>;
  listPayments: (userId: string) => Promise<KabinetDashboardPayment[]>;
}

const defaultDeps: KabinetDashboardDeps = {
  findSessionUser: (sessionId, userId) => drizzleKabinetRepository.findActiveSessionUser(sessionId, userId),
  listPayments: (userId) => drizzleKabinetRepository.listPayments(userId),
};

/**
 * Server-side prefetch for /kabinet so the first paint already contains the
 * real dashboard instead of a skeleton plus a client-side fetch waterfall.
 *
 * Two queries, issued together: one join that validates the session and returns
 * the display name, one payment read. `null` is returned for every failure mode
 * (revoked session, expired session, DB unreachable, missing user) — the page
 * then renders the dashboard without `initialData` and the client keeps its
 * original fetch path, so this can never 500 the route.
 */
export async function loadKabinetInitialData(
  session: KabinetSessionHint | null,
  deps: KabinetDashboardDeps = defaultDeps
): Promise<KabinetInitialData | null> {
  if (!session?.userId || !session.sessionId) return null;
  try {
    const [sessionUser, payments] = await Promise.all([
      deps.findSessionUser(session.sessionId, session.userId),
      deps.listPayments(session.userId),
    ]);
    // The payment read is discarded when the session gate rejects: nothing is
    // rendered, so a revoked session never reaches the browser.
    if (!sessionUser) return null;
    return { user: { fullName: sessionUser.fullName }, payments };
  } catch {
    return null;
  }
}
