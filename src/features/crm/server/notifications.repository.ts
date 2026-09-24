// NOTE(W4-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, broadcastNotifications, enrollments, leads, users } from "@/db/schema";
import type { CreateBroadcastInput } from "@/lib/validations/admin";

export type DbExecutor = Pick<typeof db, "select" | "update" | "insert" | "delete">;

export type BroadcastRow = typeof broadcastNotifications.$inferSelect;

export interface NotificationsRepository {
  listBroadcasts(): Promise<BroadcastRow[]>;
  countUsers(): Promise<number>;
  countEnrollments(): Promise<number>;
  countEnrollmentsByCohort(cohortId: string): Promise<number>;
  countLeadsByStatus(status: "new" | "consultation"): Promise<number>;
  createBroadcastTx(ex: DbExecutor, input: CreateBroadcastInput, recipientCount: number): Promise<BroadcastRow>;
  recordAuditTx(
    ex: DbExecutor,
    input: { action: string; entityType: string; entityId?: string; details: Record<string, unknown>; ip: string },
  ): Promise<void>;
}

export const drizzleNotificationsRepository: NotificationsRepository = {
  async listBroadcasts() {
    return db.select().from(broadcastNotifications).orderBy(desc(broadcastNotifications.createdAt));
  },
  async countUsers() {
    const [row] = await db.select({ total: count(users.id) }).from(users);
    return Number(row?.total || 0);
  },
  async countEnrollments() {
    const [row] = await db.select({ total: count(enrollments.id) }).from(enrollments);
    return Number(row?.total || 0);
  },
  async countEnrollmentsByCohort(cohortId) {
    const [row] = await db
      .select({ total: count(enrollments.id) })
      .from(enrollments)
      .where(eq(enrollments.cohortId, cohortId));
    return Number(row?.total || 0);
  },
  async countLeadsByStatus(status) {
    const [row] = await db.select({ total: count(leads.id) }).from(leads).where(eq(leads.status, status));
    return Number(row?.total || 0);
  },
  async createBroadcastTx(ex, input, recipientCount) {
    const [row] = await ex
      .insert(broadcastNotifications)
      .values({
        title: input.title,
        channel: input.channel,
        targetAudience: input.targetAudience,
        cohortId: input.cohortId || null,
        messageBody: input.messageBody,
        status: input.status,
        recipientsCount: recipientCount,
        sentAt: input.status === "sent" ? new Date() : null,
      })
      .returning();
    return row;
  },
  async recordAuditTx(ex, input) {
    await ex.insert(auditLogs).values({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
      ipAddress: input.ip,
    });
  },
};
