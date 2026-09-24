import { withTransactionLock } from "@/db";
import { ServiceError } from "@/lib/http/errors";
import type { CreateBroadcastInput } from "@/lib/validations/admin";
import { FALLBACK_RECIPIENT_COUNT, resolveAudience } from "../domain/notifications-policy";
import type { BroadcastRow, DbExecutor, NotificationsRepository } from "./notifications.repository";

export async function listBroadcasts(repo: NotificationsRepository): Promise<BroadcastRow[]> {
  return repo.listBroadcasts();
}

export interface CreateBroadcastOutcome {
  broadcast: BroadcastRow;
}

export async function createBroadcast(
  repo: NotificationsRepository,
  input: CreateBroadcastInput,
  opts: { ip: string },
): Promise<CreateBroadcastOutcome> {
  const audience = resolveAudience(input.targetAudience, input.cohortId);
  let recipientCount = FALLBACK_RECIPIENT_COUNT;
  if (audience.kind === "all_users") recipientCount = await repo.countUsers();
  else if (audience.kind === "active_students") recipientCount = await repo.countEnrollments();
  else if (audience.kind === "cohort_students") recipientCount = await repo.countEnrollmentsByCohort(audience.cohortId);
  else if (audience.kind === "leads_new") recipientCount = await repo.countLeadsByStatus("new");
  else if (audience.kind === "leads_consultation") recipientCount = await repo.countLeadsByStatus("consultation");

  return withTransactionLock(`broadcast:${input.title}:${Date.now()}`, async (tx) => {
    const ex = tx as DbExecutor;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Baza tranzaksiyasi mavjud emas", 503);
    const broadcast = await repo.createBroadcastTx(ex, input, recipientCount);
    await repo.recordAuditTx(ex, {
      action: "notification.broadcast",
      entityType: "broadcast_notification",
      entityId: broadcast.id,
      details: { title: broadcast.title, channel: broadcast.channel, recipientsCount: recipientCount },
      ip: opts.ip,
    });
    return { broadcast };
  });
}
