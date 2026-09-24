import { z } from "zod";

export const chatStatusSchema = z.enum(["open", "pending", "closed"]);
export const aiModeSchema = z.enum(["off", "assist", "auto"]);
export const chatSenderSchema = z.enum(["visitor", "admin", "ai", "system"]);
const text = z.string().trim().min(1).max(2000);
export const sendMessageSchema = z.object({ clientId: z.string().uuid(), body: text, sourcePath: z.string().max(500).default("/"), device: z.string().max(120).default("unknown"), name: z.string().trim().min(2).max(80).optional(), phone: z.string().max(30).optional(), telegram: z.string().max(64).optional(), honeypot: z.string().max(0).optional() });
export const messagesQuerySchema = z.object({ after: z.string().datetime().optional(), conversationId: z.string().uuid().optional() });
export const conversationPatchSchema = z.object({ status: chatStatusSchema.optional(), assignedAdminId: z.string().uuid().nullable().optional(), aiMode: aiModeSchema.optional() });
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ChatMessageDto = { id: string; conversationId: string; clientId: string; sender: z.infer<typeof chatSenderSchema>; body: string; createdAt: string; readAt: string | null };
export type ChatConversationDto = { id: string; displayName: string; status: z.infer<typeof chatStatusSchema>; aiMode: z.infer<typeof aiModeSchema>; lastMessageAt: string; unreadForAdmin: number; unreadForVisitor: number; sourcePath: string; device: string; contactPhone: string | null; contactTelegram: string | null };
export type ChatSettingsInput = { enabled: boolean; welcomeText: string; officeHours: { start: number; end: number; tz: string }; offlineText: string; aiDefaultMode: "off" | "assist" | "auto"; aiModel: string; aiDailyReplyCap: number; aiPersona: string; telegramNotify: boolean; quickReplies: string[] };
export const chatSettingsSchema = z.object({ enabled: z.boolean().default(true), welcomeText: z.string().max(500).default("Salom! Naqsh jamoasiga xabar yozing — yordam beramiz."), officeHours: z.object({ start: z.number().int().min(0).max(24).default(9), end: z.number().int().min(0).max(24).default(19), tz: z.string().default("Asia/Tashkent") }).default({ start: 9, end: 19, tz: "Asia/Tashkent" }), offlineText: z.string().max(500).default("Hozir oflaynmiz — raqamingizni qoldiring, Telegram orqali javob beramiz"), aiDefaultMode: aiModeSchema.default("assist"), aiModel: z.string().default("claude-sonnet-5"), aiDailyReplyCap: z.number().int().min(1).max(100).default(40), aiPersona: z.string().max(1000).default("Yordamchi, aniq va samimiy Naqsh yordamchisi."), telegramNotify: z.boolean().default(true), quickReplies: z.array(z.string().max(80)).max(8).default(["Kurs tanlashda yordam", "To'lov savoli", "Bepul dars"]) });
export const chatSettingsRowSchema = z.object({ value: chatSettingsSchema });
