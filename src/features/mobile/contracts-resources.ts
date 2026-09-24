import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { mobileUserSchema } from "./contracts-auth";

extendZodWithOpenApi(z);

const uuid = z.string().uuid();
const isoDate = z.string().datetime();

export const paginationQuerySchema = z.object({
  cursor: z.string().optional().openapi({ example: "2026-01-01T00:00:00.000Z|3fa85f64" }),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).openapi("PaginationQuery");

export const mePatchSchema = z.object({
  fullName: z.string().min(2).max(200).optional(),
  email: z.string().email().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  city: z.string().max(120).optional(),
  profession: z.string().max(160).optional(),
  goal: z.string().max(500).optional(),
  bio: z.string().max(1000).optional(),
  birthDate: z.string().nullable().optional(),
}).openapi("MobileMePatch");

export const meResponseSchema = z.object({ user: mobileUserSchema }).openapi("MobileMe");

export const enrollmentSchema = z.object({
  id: uuid,
  status: z.string(),
  enrolledAt: isoDate,
  course: z.object({ id: uuid, slug: z.string(), title: z.string(), coverUrl: z.string().nullable() }),
  cohort: z.object({ id: uuid, name: z.string(), startsAt: isoDate.nullable() }),
}).openapi("MobileEnrollment");

export const courseCardSchema = z.object({
  id: uuid,
  slug: z.string().openapi({ example: "ai-mahsulot" }),
  title: z.string(),
  subtitle: z.string().nullable(),
  coverUrl: z.string().nullable(),
  level: z.string().nullable(),
  durationWeeks: z.number().nullable(),
  priceSum: z.string(),
  oldPriceSum: z.string().nullable(),
  enrolled: z.boolean(),
}).openapi("MobileCourseCard");

export const lessonItemSchema = z.object({
  id: uuid,
  title: z.string(),
  durationSec: z.number().nullable(),
  isFreePreview: z.boolean(),
  locked: z.boolean(),
  sortOrder: z.number().nullable(),
}).openapi("MobileLessonItem");

export const courseDetailSchema = courseCardSchema.extend({
  description: z.string().nullable(),
  sections: z.array(z.object({
    id: uuid, title: z.string(),
    lessons: z.array(lessonItemSchema),
  })),
}).openapi("MobileCourseDetail");

export const lessonDetailSchema = z.object({
  course: z.object({ id: uuid, slug: z.string(), title: z.string() }),
  section: z.object({ id: uuid, title: z.string() }),
  lesson: z.object({
    id: uuid, title: z.string(),
    videoUrl: z.string().nullable(),
    videoHlsUrl: z.string().nullable(),
    durationSec: z.number().nullable(),
    contentMd: z.string().nullable(),
    materialsJson: z.unknown(),
    isFreePreview: z.boolean(),
  }),
  positionSec: z.number(),
  completed: z.boolean(),
}).openapi("MobileLessonDetail");

export const progressRequestSchema = z.object({
  positionSec: z.number().int().min(0).max(86400),
  completed: z.boolean().default(false),
}).openapi("MobileProgressRequest");

export const homeworkSubmitSchema = z.object({
  assignmentId: uuid,
  fileUrls: z.array(z.string().url()).max(10).default([]),
  githubUrl: z.string().url().nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
}).openapi("MobileHomeworkSubmit");

export const homeworkItemSchema = z.object({
  id: uuid,
  assignmentId: uuid,
  assignmentTitle: z.string(),
  lessonTitle: z.string().nullable(),
  status: z.string(),
  score: z.string().nullable(),
  feedbackMd: z.string().nullable(),
  submittedAt: isoDate,
  attemptNo: z.number(),
}).openapi("MobileHomeworkItem");

export const paymentItemSchema = z.object({
  id: uuid,
  provider: z.string(),
  amountSum: z.string(),
  currency: z.literal("UZS"),
  status: z.string(),
  paidAt: isoDate.nullable(),
  createdAt: isoDate,
  enrollmentId: uuid.nullable(),
}).openapi("MobilePaymentItem");

export const certificateSchema = z.object({
  status: z.enum(["issued", "not_eligible", "no_enrollment"]),
  certificate: z.object({
    code: z.string(), holderName: z.string(), courseTitle: z.string(),
    finalScore: z.number(), issuedAt: isoDate, downloadUrl: z.string(),
  }).nullable(),
  reasons: z.array(z.string()).optional(),
}).openapi("MobileCertificate");

export const referralSchema = z.object({
  code: z.string().openapi({ example: "3FA85F64" }),
  deepLink: z.string().openapi({ example: "https://naqsh.uz/ref/3FA85F64" }),
  earnedTiyin: z.number().openapi({ example: 250000 }),
  earnedSum: z.number(),
  balanceTiyin: z.number(),
  referredPaidCount: z.number(),
  currency: z.literal("UZS"),
}).openapi("MobileReferral");

export const pushRegisterSchema = z.object({
  platform: z.enum(["ios", "android", "web", "expo"]).openapi({ example: "expo" }),
  pushToken: z.string().min(8).max(512).openapi({ example: "ExponentPushToken[xxxx]" }),
  appVersion: z.string().max(32).optional(),
  locale: z.enum(["uz", "ru", "en"]).default("uz"),
  deviceId: z.string().max(128).optional(),
}).openapi("MobilePushRegister");

export const appConfigSchema = z.object({
  minAppVersion: z.object({ ios: z.string(), android: z.string() }),
  latestAppVersion: z.object({ ios: z.string(), android: z.string() }),
  updateRequired: z.boolean(),
  featureFlags: z.record(z.boolean()),
  support: z.object({ telegram: z.string(), email: z.string(), phone: z.string() }),
  chatEnabled: z.boolean(),
  deepLinks: z.object({ course: z.string(), cabinet: z.string(), referral: z.string() }),
  deprecationPolicy: z.string(),
}).openapi("MobileAppConfig");

export const errorEnvelopeSchema = z.object({
  error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }),
}).openapi("ErrorEnvelope");
