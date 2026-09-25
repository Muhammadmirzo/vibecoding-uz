/**
 * broadcast_notification write path: real audience count + a queued
 * broadcast_notifications row + its audit_logs row, the last two in ONE
 * transaction (a failed audit insert rolls the broadcast row back).
 */
import { count, eq, inArray } from "drizzle-orm";
import {
  broadcastNotifications,
  cohorts,
  enrollments,
  homeworkSubmissions,
  leads,
  users,
} from "../../src/db/schema";
import { recordMcpAudit, type DbExecutor } from "./db-audit";

async function loadDbModule() {
  return import("../../src/db");
}

export interface BroadcastInput {
  title: string;
  channel: string;
  targetAudience: string;
  messageBody: string;
  cohortId?: string;
}

export interface QueuedBroadcast {
  id: string;
  title: string;
  channel: string;
  targetAudience: string;
  recipientsCount: number;
  status: string;
  createdAt: string;
}

async function countAudience(db: DbExecutor, audience: string, cohortId: string | undefined): Promise<number> {
  if (audience === "all_users") {
    const rows = await db.select({ n: count() }).from(users);
    return rows[0]?.n ?? 0;
  }
  if (audience === "active_students") {
    const rows = await db
      .select({ n: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "active"));
    return rows[0]?.n ?? 0;
  }
  if (audience === "leads_new" || audience === "leads_consultation") {
    const status = audience === "leads_new" ? "new" : "consultation";
    const rows = await db.select({ n: count() }).from(leads).where(eq(leads.status, status));
    return rows[0]?.n ?? 0;
  }
  if (audience === "cohort_students") {
    if (cohortId === undefined) throw new Error("cohort_required");
    const [cohort] = await db
      .select({ id: cohorts.id })
      .from(cohorts)
      .where(eq(cohorts.id, cohortId))
      .limit(1);
    if (cohort === undefined) throw new Error("cohort_not_found");
    const rows = await db
      .select({ n: count() })
      .from(enrollments)
      .where(eq(enrollments.cohortId, cohortId));
    return rows[0]?.n ?? 0;
  }
  if (audience === "pending_homework") {
    const rows = await db
      .selectDistinct({ userId: homeworkSubmissions.userId })
      .from(homeworkSubmissions)
      .where(inArray(homeworkSubmissions.status, ["submitted", "reviewing"]));
    return rows.length;
  }
  return 0;
}

export function isCohortAudience(audience: string): boolean {
  return audience === "cohort_students";
}

/**
 * Records the broadcast as a queued row and returns the real recipient
 * count. It does NOT send anything: no sender worker exists yet, so the
 * status stays "queued" and sentAt stays null. Never reports fake delivery.
 */
export async function queueBroadcastRecord(input: BroadcastInput): Promise<QueuedBroadcast> {
  const { db, withTransactionLock } = await loadDbModule();
  const recipientsCount = await countAudience(db, input.targetAudience, input.cohortId);
  return withTransactionLock(`broadcast:${input.title}:${Date.now()}`, async (tx) => {
    if (!tx) throw new Error("transaction_unavailable");
    return insertBroadcast(tx, input, recipientsCount);
  });
}

async function insertBroadcast(ex: DbExecutor, input: BroadcastInput, recipientsCount: number): Promise<QueuedBroadcast> {
  const [row] = await ex
    .insert(broadcastNotifications)
    .values({
      title: input.title,
      channel: input.channel,
      targetAudience: input.targetAudience,
      cohortId: input.cohortId,
      messageBody: input.messageBody,
      status: "queued",
      recipientsCount,
    })
    .returning({
      id: broadcastNotifications.id,
      title: broadcastNotifications.title,
      channel: broadcastNotifications.channel,
      targetAudience: broadcastNotifications.targetAudience,
      recipientsCount: broadcastNotifications.recipientsCount,
      status: broadcastNotifications.status,
      createdAt: broadcastNotifications.createdAt,
    });
  if (row === undefined) throw new Error("broadcast_insert_failed");
  await recordMcpAudit(ex, {
    action: "notification.broadcast",
    entityType: "broadcast_notification",
    entityId: row.id,
    details: {
      title: row.title,
      channel: row.channel,
      targetAudience: row.targetAudience,
      recipientsCount,
      status: "queued",
    },
  });
  return {
    id: row.id,
    title: row.title,
    channel: row.channel,
    targetAudience: row.targetAudience,
    recipientsCount: row.recipientsCount,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
