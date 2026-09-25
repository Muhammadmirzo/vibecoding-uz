import { eq } from "drizzle-orm";
import { z } from "zod";
import { BRAND } from "@/config/brand";
import { db } from "@/db";
import { chatConversations, chatMessages } from "@/db/schema";
import type { ChatConversationDto, ChatMessageDto } from "@/features/chat/contracts";
import { postReply } from "@/features/chat/server/chat.service";
import { sendTelegramMessage } from "./messages";

const telegramResultSchema = z.object({
  ok: z.literal(true),
  result: z.object({ message_id: z.number().int().positive() }),
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

export function telegramAdminAllowed(id: string): boolean {
  return (process.env.TELEGRAM_ADMIN_USER_IDS || "")
    .split(",").map((value) => value.trim()).filter(Boolean).includes(id);
}

export async function notifyChatHuman(input: {
  conversationId: string;
  title: string;
  detail: string;
}) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!adminChatId) return { sent: false };
  const link = `${BRAND.url}/admin/chat?conversation=${encodeURIComponent(input.conversationId)}`;
  const text = `<b>${escapeHtml(input.title)}</b>\n${escapeHtml(input.detail)}\n\n<a href="${link}">Saytda ochish</a>`;
  const delivery = await sendTelegramMessage(adminChatId, text, "HTML");
  return { sent: delivery.success };
}

export async function notifyVisitorMessage(
  conversation: ChatConversationDto,
  message: ChatMessageDto,
) {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  // Notify on every visitor message: the admin replies from Telegram by replying to
  // this exact notification, so a skipped alert means an unanswerable message.
  if (!adminChatId) return { sent: false };
  const link = `${BRAND.url}/admin/chat?conversation=${encodeURIComponent(conversation.id)}`;
  const text = [
    "<b>Naqsh chat — yangi xabar</b>",
    `Mehmon: ${escapeHtml(conversation.displayName)}`,
    `Sahifa: ${escapeHtml(conversation.sourcePath)}`,
    "",
    escapeHtml(message.body),
    "",
    `<a href="${link}">Saytda ochish</a>`,
  ].join("\n");
  const delivery = await sendTelegramMessage(adminChatId, text, "HTML");
  const parsed = delivery.success ? telegramResultSchema.safeParse(delivery.data) : null;
  if (!parsed?.success) return { sent: false };
  await db.update(chatMessages).set({ telegramMessageId: String(parsed.data.result.message_id) })
    .where(eq(chatMessages.id, message.id));
  return { sent: true, messageId: parsed.data.result.message_id };
}

export async function handleTelegramChatReply(update: {
  from?: { id?: number };
  message?: {
    message_id?: number;
    from?: { id?: number };
    reply_to_message?: { message_id?: number };
    text?: string;
  };
}): Promise<boolean> {
  const message = update.message;
  // Real Telegram updates carry the sender inside `message.from`.
  const userId = message?.from?.id ?? update.from?.id;
  const parentId = message?.reply_to_message?.message_id;
  if (!message || !userId || !parentId || !message.text || !telegramAdminAllowed(String(userId))) return false;
  const [parent] = await db.select({ conversationId: chatMessages.conversationId })
    .from(chatMessages).where(eq(chatMessages.telegramMessageId, String(parentId))).limit(1);
  if (!parent) return false;
  const clientId = `telegram-${message.message_id}`;
  const reply = await postReply(null, parent.conversationId, message.text, clientId, "telegram");
  await db.update(chatMessages).set({ telegramMessageId: String(message.message_id) })
    .where(eq(chatMessages.id, reply.id));
  return true;
}

export async function conversationExists(id: string) {
  const [row] = await db.select({ id: chatConversations.id }).from(chatConversations).where(eq(chatConversations.id, id)).limit(1);
  return Boolean(row);
}
