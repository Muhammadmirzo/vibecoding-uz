import { z } from "zod";

export const testimonialTypeSchema = z.enum(["video", "text"]);

export const testimonialItemSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(2, "Ism-familiya kiritilishi kerak"),
  role: z.string().min(2, "Mutaxassislik yoki lavozim kiritilishi kerak"),
  company: z.string().optional(),
  avatarUrl: z.string().optional(),
  courseTitle: z.string().min(2, "Kurs nomi kiritilishi kerak"),
  cohortName: z.string().optional(),
  type: testimonialTypeSchema.default("text"),
  videoUrl: z.string().url("Video URL formati noto'g'ri").optional().or(z.literal("")),
  videoDuration: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  body: z.string().min(5, "Fikr matni kiritilishi kerak"),
  rating: z.number().int().min(1).max(5).default(5),
  verified: z.boolean().default(true),
  resultMetric: z.string().optional(),
  publishedAt: z.string().optional(),
});

export const testimonialFilterSchema = z.object({
  rating: z.enum(["all", "5", "4", "3"]).default("all"),
  type: z.enum(["all", "video", "text"]).default("all"),
  course: z.string().default("all"),
});

export type TestimonialItem = z.infer<typeof testimonialItemSchema>;
export type TestimonialFilterInput = z.infer<typeof testimonialFilterSchema>;
