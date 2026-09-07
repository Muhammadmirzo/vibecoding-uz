import { z } from "zod";
import { userRoleSchema, uzbekPhoneRegex } from "./auth";

export const blogPostStatusSchema = z.enum(["draft", "published", "scheduled", "archived"]);

export const createBlogPostSchema = z.object({
  slug: z.string().min(1, { message: "Slug kiritilishi shart" }),
  title: z.string().min(2, { message: "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak" }),
  excerpt: z.string().optional().nullable(),
  contentMd: z.string().min(5, { message: "Maqola matni kiritilishi shart" }),
  coverUrl: z.string().optional().nullable(),
  authorName: z.string().default("Mirzo Academy Team"),
  category: z.string().default("Vibe Coding"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  status: blogPostStatusSchema.default("published"),
  publishedAt: z.string().optional().nullable(),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const siteSettingsSchema = z.object({
  siteTitle: z.string().min(1, { message: "Sayt nomi kiritilishi shart" }),
  supportPhone: z.string().min(1, { message: "Qo'llab-quvvatlash telefoni kiritilishi shart" }),
  supportTelegram: z.string().min(1, { message: "Telegram bog'lanishi kiritilishi shart" }),
  maintenanceMode: z.boolean().default(false),
  defaultCoursePrice: z.string().min(1, { message: "Standart kurs narxi kiritilishi shart" }),
  installmentRate3Months: z.number().min(0).default(0),
  installmentRate6Months: z.number().min(0).default(10),
  guaranteeRefundDays: z.number().min(1).default(14),
  guaranteeTextUz: z.string().min(10, { message: "Kafolat matni kiritilishi shart" }),
  paymeMerchantId: z.string().optional().nullable(),
  paymeSecretKey: z.string().optional().nullable(),
  clickServiceId: z.string().optional().nullable(),
  clickSecretKey: z.string().optional().nullable(),
  telegramBotToken: z.string().optional().nullable(),
  smsApiKey: z.string().optional().nullable(),

  // Dynamic CTA, URLs & Announcement Banner
  headerCtaText: z.string().default("Kurs tanlash"),
  headerCtaLink: z.string().default("/#kurs-tanlash"),
  enrollmentUrl: z.string().default("https://academy.mirzo.uz/kabinet"),
  telegramBotLink: z.string().default("https://t.me/m/ODAfK_QIMjky"),
  announcementBannerText: z.string().optional().nullable(),
  announcementBannerLink: z.string().optional().nullable(),
  enableAnnouncementBanner: z.boolean().default(true),

  // Strategic Feature Flags & Plan Toggles
  enableGamification: z.boolean().default(true),
  enableCommunityForum: z.boolean().default(true),
  enableInteractiveQuizzes: z.boolean().default(true),
  enableB2BEnterprise: z.boolean().default(true),
  enableCardReferrals: z.boolean().default(true),
  enableLevelGating: z.boolean().default(true),
  enableGuaranteeTrust: z.boolean().default(true),
});

export const broadcastChannelSchema = z.enum(["telegram", "email", "sms", "all"]);
export const broadcastAudienceSchema = z.enum([
  "all_users",
  "active_students",
  "leads_new",
  "leads_consultation",
  "cohort_students",
]);

export const createBroadcastSchema = z.object({
  title: z.string().min(2, { message: "Xabarnoma nomi kiritilishi kerak" }),
  channel: broadcastChannelSchema.default("telegram"),
  targetAudience: broadcastAudienceSchema.default("all_users"),
  cohortId: z.string().uuid().optional().nullable(),
  messageBody: z.string().min(5, { message: "Xabar matni kamida 5 ta belgidan iborat bo'lishi kerak" }),
  status: z.enum(["draft", "sent", "failed"]).default("sent"),
});

export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});

export const createStaffSchema = z.object({
  phone: z.string().regex(uzbekPhoneRegex, {
    message: "Telefon raqam +998 bilan boshlanishi va 12 xonali bo'lishi kerak (masalan: +998901234567)",
  }),
  fullName: z.string().min(2, {
    message: "F.I.SH. kamida 2 ta belgidan iborat bo'lishi kerak",
  }),
  email: z.string().email({ message: "Email formati noto'g'ri" }).optional().or(z.literal("")),
  password: z.string().min(8, {
    message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak",
  }),
  role: userRoleSchema.default("admin"),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
