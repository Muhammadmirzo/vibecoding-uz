import { z } from "zod";

export const sendSmsSchema = z.object({
  phone: z.string().min(7, "Telefon raqami noto'g'ri"),
  message: z.string().min(1, "Xabar matni bo'sh bo'lishi mumkin emas"),
  from: z.string().optional(),
});

export type SendSmsInput = z.infer<typeof sendSmsSchema>;

export const sendOtpSmsSchema = z.object({
  phone: z.string().min(7, "Telefon raqami noto'g'ri"),
  code: z.string().min(4, "Kod kamida 4 xonali bo'lishi kerak"),
});

export type SendOtpSmsInput = z.infer<typeof sendOtpSmsSchema>;
