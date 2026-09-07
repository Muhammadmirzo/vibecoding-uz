import { z } from "zod";
import { uzbekPhoneRegex } from "./auth";

export const updateStudentProfileSchema = z.object({
  fullName: z.string().min(2, "F.I.SH. kamida 2 ta belgidan iborat bo'lishi kerak"),
  email: z.string().email("Noto'g'ri email formati").optional().or(z.literal("")),
  phone: z.string().regex(uzbekPhoneRegex, "Telefon raqam noto'g'ri formatda"),
  avatarUrl: z.string().url("Avatar havola formati noto'g'ri").optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  profession: z.string().optional().or(z.literal("")),
  goal: z.string().optional().or(z.literal("")),
  bio: z.string().optional().or(z.literal("")),
  tgUsername: z.string().optional().or(z.literal("")),
});

export const studentChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Joriy parolni kiriting"),
  newPassword: z.string().min(8, "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak"),
  confirmPassword: z.string().min(8, "Parolni tasdiqlash uchun qayta kiriting"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Yangi parollar bir-biriga mos kelmadi",
  path: ["confirmPassword"],
});

export const studentNotificationSettingsSchema = z.object({
  telegramNotify: z.boolean().default(true),
  emailNotify: z.boolean().default(true),
  smsNotify: z.boolean().default(false),
  homeworkDeadlines: z.boolean().default(true),
  mentorReviews: z.boolean().default(true),
  liveMeetReminders: z.boolean().default(true),
});

export const referralClaimBonusSchema = z.object({
  payoutMethod: z.enum(["uzcard_humo", "course_balance"]),
  cardNumber: z.string().regex(/^[0-9]{16}$/, "Karta raqami 16 xonali bo'lishi kerak").optional().or(z.literal("")),
  cardHolder: z.string().optional().or(z.literal("")),
  amountSum: z.number().min(50000, "Minimal yechib olish miqdori 50,000 UZS"),
});

export const studentPaymentRequestSchema = z.object({
  enrollmentId: z.string().optional(),
  provider: z.enum(["payme", "click"]),
  installmentMonth: z.number().int().min(1).max(12).optional(),
  amountSum: z.number().positive("Summa kiritilishi kerak"),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type StudentChangePasswordInput = z.infer<typeof studentChangePasswordSchema>;
export type StudentNotificationSettingsInput = z.infer<typeof studentNotificationSettingsSchema>;
export type ReferralClaimBonusInput = z.infer<typeof referralClaimBonusSchema>;
export type StudentPaymentRequestInput = z.infer<typeof studentPaymentRequestSchema>;
