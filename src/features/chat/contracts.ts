import { z } from "zod";

export const chatStatusSchema = z.enum(["open", "pending", "closed"]);
export const aiModeSchema = z.enum(["off", "assist", "auto"]);
export const aiProviderSchema = z.enum(["anthropic", "external"]);
export const chatSenderSchema = z.enum(["visitor", "admin", "ai", "system"]);
const bodySchema = z.string().trim().min(1).max(2000);

export const sendMessageSchema = z.object({
  clientId: z.string().uuid(),
  body: bodySchema,
  sourcePath: z.string().max(500).default("/"),
  device: z.string().max(120).default("unknown"),
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().min(6).max(30).optional(),
  telegram: z.string().trim().min(3).max(64).optional(),
  honeypot: z.string().max(200).optional(),
}).refine((value) => !value.phone || !value.telegram, {
  message: "Telefon yoki Telegramdan birini kiriting",
  path: ["phone"],
});

export const messagesQuerySchema = z.object({
  after: z.string().datetime().optional(),
  conversationId: z.string().uuid().optional(),
});

export const adminConversationsQuerySchema = z.object({
  id: z.string().uuid().optional(),
  status: z.enum(["open", "pending", "closed", "assigned", "all"]).default("open"),
  q: z.string().trim().max(100).default(""),
});

export const conversationPatchSchema = z.object({
  conversationId: z.string().uuid(),
  status: chatStatusSchema.optional(),
  assignedAdminId: z.string().uuid().nullable().optional(),
  assignToMe: z.boolean().optional(),
  aiMode: aiModeSchema.optional(),
}).refine((value) => value.status !== undefined || value.assignedAdminId !== undefined || value.assignToMe !== undefined || value.aiMode !== undefined);

export const adminReplySchema = z.object({
  conversationId: z.string().uuid(),
  body: bodySchema,
  clientId: z.string().uuid().optional(),
});

export const draftApprovalSchema = z.object({
  conversationId: z.string().uuid(),
  draftId: z.string().uuid(),
});

export const markReadSchema = z.object({ conversationId: z.string().uuid() });
export const chatOpenSchema = z.object({ sourcePath: z.string().max(500).default("/") });

export const chatMessageSchema = z.object({
  id: z.string().uuid(),
  conversationId: z.string().uuid(),
  clientId: z.string(),
  sender: chatSenderSchema,
  body: z.string(),
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().nullable(),
  isDraft: z.boolean(),
  // Short quote of the message this one answers; null for ordinary messages.
  replyTo: z.object({ id: z.string().uuid(), sender: chatSenderSchema, body: z.string() }).nullable().default(null),
});
export const chatConversationSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  status: chatStatusSchema,
  aiMode: aiModeSchema,
  assignedAdminId: z.string().uuid().nullable(),
  userId: z.string().uuid().nullable(),
  leadId: z.string().uuid().nullable(),
  lastMessageAt: z.string().datetime(),
  unreadForAdmin: z.number().int().nonnegative(),
  unreadForVisitor: z.number().int().nonnegative(),
  sourcePath: z.string(),
  device: z.string(),
  contactPhone: z.string().nullable(),
  contactTelegram: z.string().nullable(),
  createdAt: z.string().datetime(),
});
export const chatSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  welcomeText: z.string().max(500).default("Salom! Naqsh jamoasiga xabar yozing — yordam beramiz."),
  officeHours: z.object({
    start: z.number().int().min(0).max(23).default(9),
    end: z.number().int().min(1).max(24).default(19),
    tz: z.literal("Asia/Tashkent").default("Asia/Tashkent"),
  }).default({ start: 9, end: 19, tz: "Asia/Tashkent" }),
  replyTimeMinutes: z.number().int().min(1).max(1440).default(10),
  offlineText: z.string().max(500).default("Hozir oflaynmiz — raqamingizni qoldiring, Telegram orqali javob beramiz"),
  aiDefaultMode: aiModeSchema.default("assist"),
  aiProvider: aiProviderSchema.default("anthropic"),
  aiModel: z.string().default("claude-sonnet-5"),
  aiDailyReplyCap: z.number().int().min(1).max(100).default(40),
  aiPersona: z.string().max(1000).default("Yordamchi, aniq va samimiy Naqsh yordamchisi."),
  telegramNotify: z.boolean().default(true),
  quickReplies: z.array(z.string().min(1).max(80)).max(8).default(["Kurs tanlashda yordam", "To'lov savoli", "Bepul dars"]),
});
/** What `publicChatSettings()` actually exposes to visitors — no AI/internal config. */
export const publicChatSettingsSchema = chatSettingsSchema.pick({
  enabled: true, welcomeText: true, officeHours: true, replyTimeMinutes: true, offlineText: true, quickReplies: true,
});
export const chatSettingsRowSchema = z.object({ value: chatSettingsSchema });
export const chatBootstrapSchema = z.object({ conversation: chatConversationSchema.nullable(), settings: chatSettingsSchema });
export const chatMessagesResponseSchema = z.object({ conversation: chatConversationSchema.nullable(), messages: z.array(chatMessageSchema), nextCursor: z.string().nullable() });
export const adminThreadSchema = z.object({ conversation: chatConversationSchema, messages: z.array(chatMessageSchema) });

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ChatMessageDto = z.infer<typeof chatMessageSchema>;
export type ChatConversationDto = z.infer<typeof chatConversationSchema>;
export type ChatSettingsInput = z.infer<typeof chatSettingsSchema>;
export type ConversationPatchInput = z.infer<typeof conversationPatchSchema>;
