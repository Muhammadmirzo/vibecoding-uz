import { z } from "zod";

export const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, "Mavzu kiritilishi shart"),
  html: z.string().min(1, "HTML tarkibi bo'sh bo'lmasligi kerak"),
  text: z.string().optional(),
  from: z.string().optional(),
  replyTo: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

export const welcomeEmailSchema = z.object({
  to: z.string().email("Yaroqli email kiriting"),
  fullName: z.string().min(1, "Ism kiritilishi shart"),
  courseTitle: z.string().optional(),
});

export type WelcomeEmailInput = z.infer<typeof welcomeEmailSchema>;

export const dripUnlockEmailSchema = z.object({
  to: z.string().email("Yaroqli email kiriting"),
  fullName: z.string().min(1, "Ism kiritilishi shart"),
  lessonTitle: z.string().min(1, "Dars sarlavhasi kiritilishi shart"),
  lessonUrl: z.string().min(1, "Dars havolasi kiritilishi shart"),
});

export type DripUnlockEmailInput = z.infer<typeof dripUnlockEmailSchema>;
