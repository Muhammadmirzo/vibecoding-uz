import { z } from "zod";

export const uzbekPhoneRegex = /^\+998[0-9]{9}$/;

export const userRoleSchema = z.enum(["superadmin", "admin", "manager", "mentor", "student"]);

export const userSchema = z.object({
  id: z.string().uuid(),
  phone: z.string(),
  fullName: z.string(),
  email: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  role: userRoleSchema,
  createdAt: z.date().or(z.string()),
});

export const loginSchema = z.object({
  phone: z.string().min(1, { message: "Telefon raqam kiritilishi shart" }),
  password: z.string().optional(),
});

export const registerSchema = z.object({
  phone: z.string().regex(uzbekPhoneRegex, {
    message: "Telefon raqam +998 bilan boshlanishi va 12 xonali bo'lishi kerak (masalan: +998901234567)",
  }),
  fullName: z.string().min(2, {
    message: "F.I.SH. kamida 2 ta belgidan iborat bo'lishi kerak",
  }),
  password: z.string().min(8, {
    message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak",
  }),
  email: z
    .string()
    .email({ message: "Email formati noto'g'ri" })
    .optional()
    .or(z.literal("")),
  locale: z.enum(["uz", "ru", "en"]).default("uz"),
});

export const loginPasswordSchema = z.object({
  phone: z.string().regex(uzbekPhoneRegex, {
    message: "Telefon raqam noto'g'ri formatda",
  }),
  password: z.string().min(1, {
    message: "Parol kiritilishi shart",
  }),
});

export const otpPurposeEnum = z.enum(["register", "login", "reset_password"]).default("login");

export const otpRequestSchema = z.object({
  phone: z.string().regex(uzbekPhoneRegex, {
    message: "Telefon raqam noto'g'ri formatda",
  }),
  purpose: otpPurposeEnum.optional(),
});

export const otpSendSchema = otpRequestSchema;

export const otpVerifySchema = z.object({
  phone: z.string().regex(uzbekPhoneRegex, {
    message: "Telefon raqam noto'g'ri formatda",
  }),
  code: z.string().regex(/^[0-9]{6}$/, {
    message: "OTP kodi 6 xonali raqam bo'lishi kerak",
  }),
  fullName: z.string().optional(),
  purpose: otpPurposeEnum.optional(),
});

export const passwordResetSchema = z.object({
  phone: z.string().regex(uzbekPhoneRegex, {
    message: "Telefon raqam noto'g'ri formatda",
  }),
  otpCode: z.string().regex(/^[0-9]{6}$/, {
    message: "OTP kodi 6 xonali raqam bo'lishi kerak",
  }),
  newPassword: z.string().min(8, {
    message: "Yangi parol kamida 8 ta belgidan iborat bo'lishi kerak",
  }),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, { message: "F.I.SH. kamida 2 ta belgidan iborat bo'lishi kerak" }).optional(),
  email: z.string().email({ message: "Email formati noto'g'ri" }).optional().or(z.literal("")),
  avatarUrl: z.string().url({ message: "Avatar URL formati noto'g'ri" }).optional().or(z.literal("")),
  locale: z.enum(["uz", "ru", "en"]).optional(),
  city: z.string().optional(),
  profession: z.string().optional(),
  goal: z.string().optional(),
  bio: z.string().optional(),
  birthDate: z.string().optional(),
});

export const updateMeSchema = updateProfileSchema;

export type User = z.infer<typeof userSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginPasswordInput = z.infer<typeof loginPasswordSchema>;
export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
