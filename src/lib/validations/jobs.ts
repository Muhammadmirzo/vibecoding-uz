import { z } from "zod";
import { uzbekPhoneRegex } from "./auth";

export const jobOpeningSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(2, "Lavozim nomi kiritilishi shart"),
  department: z.string().min(2, "Bo'lim nomi kiritilishi shart"),
  location: z.string().default("Toshkent / Masofaviy"),
  type: z.string().default("To'liq stavka"),
  salary: z.string().optional(),
  experience: z.string().optional(),
  descriptionMd: z.string().min(10, "Tavsif kiritilishi shart"),
  responsibilities: z.array(z.string()).min(1, "Kamida 1 ta vazifa kiritilishi lozim"),
  requirements: z.array(z.string()).min(1, "Kamida 1 ta talab kiritilishi lozim"),
  benefits: z.array(z.string()).optional(),
  status: z.enum(["active", "closed"]).default("active"),
  createdAt: z.string().optional(),
});

export const applyJobSchema = z.object({
  jobId: z.string().optional(),
  jobSlug: z.string().optional(),
  jobTitle: z.string().min(1, "Vakansiya tanlanishi lozim"),
  fullName: z.string().min(2, "F.I.SH. kamida 2 ta belgidan iborat bo'lishi kerak"),
  phone: z.string().regex(uzbekPhoneRegex, {
    message: "Telefon raqami +998 bilan boshlanishi va 12 xonali bo'lishi kerak (masalan: +998901234567)",
  }),
  telegramUsername: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().url("Noto'g'ri portfolio/rezyume havolasi formati").optional().or(z.literal("")),
  portfolioUrl: z.string().url("Noto'g'ri GitHub/portfolio havolasi").optional().or(z.literal("")),
  experience: z.string().optional(),
  coverLetter: z.string().optional(),
});

export type JobOpening = z.infer<typeof jobOpeningSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
