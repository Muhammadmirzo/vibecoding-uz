import { z } from "zod";

export const ANALYTICS_EVENT_TYPES = [
  "page_view",
  "page_leave",
  "cta_click",
  "form_start",
  "form_submit",
  "lead_created",
  "diagnostic_start",
  "diagnostic_complete",
  "signup",
  "login",
  "checkout_start",
  "payment_success",
  "payment_failed",
  "lesson_start",
  "lesson_complete",
  "homework_submit",
  "chat_open",
  "chat_message",
] as const;

export const analyticsEventTypeSchema = z.enum(ANALYTICS_EVENT_TYPES);
export type AnalyticsEventType = z.infer<typeof analyticsEventTypeSchema>;

export const deviceSchema = z.enum(["mobile", "tablet", "desktop"]);
export type AnalyticsDevice = z.infer<typeof deviceSchema>;

const shortText = z.string().trim().min(1).max(256);
const optionalText = z.string().trim().min(1).max(256).nullable().optional();
const optionalUuid = z.string().uuid().nullable().optional();
const emptyProps = z.object({}).strict();
const noValue: z.ZodType<number | null | undefined> = z.null().optional();

const eventBase = z.object({
  eventId: z.string().uuid(),
  occurredAt: z.string().datetime({ offset: true }),
  sessionId: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  path: z.string().trim().startsWith("/").max(2048),
  referrerHost: optionalText,
  utmSource: optionalText,
  utmMedium: optionalText,
  utmCampaign: optionalText,
  utmTerm: optionalText,
  utmContent: optionalText,
  device: deviceSchema,
  browserFamily: shortText,
  country: z.string().trim().length(2).toUpperCase().nullable().optional(),
});

const eventVariant = <T extends z.ZodTypeAny>(type: AnalyticsEventType, props: T, valueUzs: z.ZodType<number | null | undefined> = noValue) =>
  eventBase.extend({
    type: z.literal(type),
    props: props.refine(
      (value) => new TextEncoder().encode(JSON.stringify(value)).byteLength <= 2048,
      "Event props 2 KB dan oshmasligi kerak",
    ),
    valueUzs,
  });

export const analyticsEventInputSchema = z.discriminatedUnion("type", [
  eventVariant("page_view", emptyProps),
  eventVariant("page_leave", z.object({
    engagedMs: z.number().int().min(0).max(86_400_000),
    scrollDepth: z.number().int().min(0).max(100),
  }).strict()),
  eventVariant("cta_click", z.object({ id: shortText }).strict()),
  eventVariant("form_start", z.object({ formId: shortText }).strict()),
  eventVariant("form_submit", z.object({ formId: shortText }).strict()),
  eventVariant("lead_created", z.object({ leadId: z.string().uuid(), source: shortText }).strict()),
  eventVariant("diagnostic_start", z.object({ diagnosticId: z.string().uuid() }).strict()),
  eventVariant("diagnostic_complete", z.object({ diagnosticId: z.string().uuid(), result: shortText }).strict()),
  eventVariant("signup", z.object({ method: shortText }).strict()),
  eventVariant("login", z.object({ method: shortText }).strict()),
  eventVariant("checkout_start", z.object({ courseId: optionalUuid, courseSlug: shortText.optional() }).strict()),
  eventVariant("payment_success", z.object({ paymentId: z.string().uuid(), courseId: optionalUuid }).strict(), z.number().int().positive().nullable().optional()),
  eventVariant("payment_failed", z.object({ paymentId: z.string().uuid().optional(), reasonCode: shortText.optional() }).strict()),
  eventVariant("lesson_start", z.object({ lessonId: z.string().uuid(), courseId: optionalUuid }).strict()),
  eventVariant("lesson_complete", z.object({ lessonId: z.string().uuid(), courseId: optionalUuid }).strict()),
  eventVariant("homework_submit", z.object({ submissionId: z.string().uuid(), assignmentId: z.string().uuid(), courseId: optionalUuid }).strict()),
  eventVariant("chat_open", z.object({ widget: shortText }).strict()),
  eventVariant("chat_message", z.object({ conversationId: z.string().uuid().optional(), messageLength: z.number().int().min(0).max(10_000) }).strict()),
]);

export const analyticsBatchSchema = z.object({
  events: z.array(analyticsEventInputSchema).min(1).max(25),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventInputSchema>;
export type AnalyticsBatch = z.infer<typeof analyticsBatchSchema>;
