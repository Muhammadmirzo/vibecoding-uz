import { createHash, randomUUID } from "node:crypto";
import { analyticsEventRepository } from "./event.repository";
import { hashVisitorToken } from "./ingest";
import {
  serverAnalyticsEventSchema,
  toAnalyticsEventInput,
  type ServerAnalyticsEvent,
} from "../server-contracts";

function stableServerSessionId(userId: string | null, occurredAt: Date): string {
  const day = occurredAt.toISOString().slice(0, 10);
  const hash = createHash("sha256").update(`session:${userId ?? "anonymous"}:${day}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

/**
 * Stable server-side analytics entry point for webhooks and product services.
 * It is deliberately best-effort: validation/storage failures are logged and swallowed.
 * The optional visitorToken is hashed immediately and is never persisted raw.
 */
export async function trackServerEvent(input: ServerAnalyticsEvent): Promise<void> {
  try {
    const event = serverAnalyticsEventSchema.parse(input);
    const eventId = event.eventId ?? randomUUID();
    const occurredAt = event.occurredAt ? new Date(event.occurredAt) : new Date();
    const clientEvent = toAnalyticsEventInput(event, {
      eventId,
      occurredAt: occurredAt.toISOString(),
      sessionId: event.sessionId ?? stableServerSessionId(event.userId ?? null, occurredAt),
    });
    const fallbackIdentity = event.userId ? `server-user:${event.userId}` : `server-event:${eventId}`;
    await analyticsEventRepository.insertMany([{
      occurredAt,
      eventId: clientEvent.eventId,
      visitorHash: hashVisitorToken(event.visitorToken ?? fallbackIdentity),
      sessionId: clientEvent.sessionId,
      userId: event.userId ?? null,
      type: clientEvent.type,
      path: clientEvent.path,
      referrerHost: event.referrerHost ?? null,
      utmSource: event.utmSource ?? null,
      utmMedium: event.utmMedium ?? null,
      utmCampaign: event.utmCampaign ?? null,
      utmTerm: event.utmTerm ?? null,
      utmContent: event.utmContent ?? null,
      device: event.device,
      browserFamily: event.browserFamily,
      country: event.country ?? null,
      props: clientEvent.props,
      valueUzs: clientEvent.valueUzs ?? null,
    }]);
  } catch (error) {
    console.warn("[analytics] server event skipped", {
      type: input.type,
      cause: error instanceof Error ? error.name : "unknown",
    });
  }
}
