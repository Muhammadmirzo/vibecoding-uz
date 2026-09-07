import { z } from "zod";

export const tgAuthLinkSchema = z.object({
  tgUserId: z.string().min(1, { message: "Telegram foydalanuvchi ID si bo'sh bo'lishi mumkin emas" }),
  tgUsername: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  linkToken: z.string().optional().nullable(),
});

export const operatorHandoffSchema = z.object({
  tgUserId: z.string().min(1, { message: "Telegram ID kiritilishi shart" }),
  tgUsername: z.string().optional().nullable(),
  userFullName: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

export const homeworkAlertSchema = z.object({
  submissionId: z.string().uuid({ message: "Topshiriq ID si noto'g'ri" }),
  userId: z.string().uuid({ message: "Foydalanuvchi ID si noto'g'ri" }),
  assignmentTitle: z.string().min(1, { message: "Topshiriq sarlavhasi kiritilishi kerak" }),
  status: z.enum(["submitted", "approved", "rejected"]),
  score: z.number().min(0).max(10).optional().nullable(),
  feedbackMd: z.string().optional().nullable(),
});

export const meetReminderSchema = z.object({
  chatId: z.string().min(1, { message: "Telegram chat ID kiritilishi shart" }),
  title: z.string().min(1, { message: "Uchrashuv sarlavhasi kiritilishi kerak" }),
  startsAt: z.union([z.string(), z.date()]),
  meetingUrl: z.string().url({ message: "Havola formati noto'g'ri" }).optional().nullable(),
});

export type TgAuthLinkInput = z.infer<typeof tgAuthLinkSchema>;
export type OperatorHandoffInput = z.infer<typeof operatorHandoffSchema>;
export type HomeworkAlertInput = z.infer<typeof homeworkAlertSchema>;
export type MeetReminderInput = z.infer<typeof meetReminderSchema>;
