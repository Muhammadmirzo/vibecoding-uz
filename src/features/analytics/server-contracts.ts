import { z } from "zod";
import { analyticsEventInputSchema, type AnalyticsEventInput, type AnalyticsEventType } from "./contracts";

const serverBase = z.object({
  eventId: z.string().uuid().optional(),
  occurredAt: z.string().datetime({ offset: true }).optional(),
  sessionId: z.string().uuid().optional(),
  userId: z.string().uuid().nullable().optional(),
  path: z.string().trim().startsWith("/").max(2048).default("/"),
  referrerHost: z.string().trim().min(1).max(256).nullable().optional(),
  utmSource: z.string().trim().min(1).max(256).nullable().optional(),
  utmMedium: z.string().trim().min(1).max(256).nullable().optional(),
  utmCampaign: z.string().trim().min(1).max(256).nullable().optional(),
  utmTerm: z.string().trim().min(1).max(256).nullable().optional(),
  utmContent: z.string().trim().min(1).max(256).nullable().optional(),
  device: z.enum(["mobile", "tablet", "desktop"]).default("desktop"),
  browserFamily: z.string().trim().min(1).max(256).default("server"),
  country: z.string().trim().length(2).toUpperCase().nullable().optional(),
  visitorToken: z.string().min(16).max(256).optional(),
  valueUzs: z.number().int().positive().nullable().optional(),
});

function serverVariant<T extends AnalyticsEventType>(type: T) {
  return serverBase.extend({
    type: z.literal(type),
    props: z.unknown(),
  });
}

export const serverAnalyticsEventSchema = z.discriminatedUnion("type", [
  serverVariant("lead_created"),
  serverVariant("signup"),
  serverVariant("login"),
  serverVariant("checkout_start"),
  serverVariant("payment_success"),
  serverVariant("payment_failed"),
  serverVariant("lesson_start"),
  serverVariant("lesson_complete"),
  serverVariant("homework_submit"),
  serverVariant("diagnostic_complete"),
]);

export type ServerAnalyticsEvent = z.input<typeof serverAnalyticsEventSchema>;

export function toAnalyticsEventInput(
  event: ServerAnalyticsEvent,
  defaults: Pick<AnalyticsEventInput, "eventId" | "occurredAt" | "sessionId">,
): AnalyticsEventInput {
  return analyticsEventInputSchema.parse({
    ...event,
    eventId: event.eventId ?? defaults.eventId,
    occurredAt: event.occurredAt ?? defaults.occurredAt,
    sessionId: event.sessionId ?? defaults.sessionId,
  });
}
