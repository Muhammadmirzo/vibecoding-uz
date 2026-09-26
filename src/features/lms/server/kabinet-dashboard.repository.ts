// Only `server/*.repository.ts` may import `@/db` (CODER_AGENT_RULES §2).
import { and, desc, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { payments, sessions, users } from "@/db/schema";

export interface KabinetSessionUser {
  userId: string;
  fullName: string;
}

export interface KabinetPaymentRow {
  enrollmentId: string | null;
  status: string;
}

export interface KabinetDashboardRepository {
  /**
   * Single round trip that validates the session row AND returns the display
   * name. `getDbSession()` needs two sequential queries (sessions, then users)
   * and the dashboard only needs the name, so /kabinet does the join itself.
   */
  findActiveSessionUser(sessionId: string, userId: string): Promise<KabinetSessionUser | null>;
  listPayments(userId: string): Promise<KabinetPaymentRow[]>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const drizzleKabinetRepository: KabinetDashboardRepository = {
  async findActiveSessionUser(sessionId, userId) {
    // A malformed id would make Postgres raise 22P02 and burn a round trip.
    if (!UUID.test(sessionId) || !UUID.test(userId)) return null;
    const [row] = await db
      .select({ userId: sessions.userId, fullName: users.fullName })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(sessions.userId, userId),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);
    return row ?? null;
  },
  async listPayments(userId) {
    // A malformed id would make Postgres raise 22P02 and burn a round trip.
    if (!UUID.test(userId)) return [];
    return db
      .select({ enrollmentId: payments.enrollmentId, status: payments.status })
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  },
};
