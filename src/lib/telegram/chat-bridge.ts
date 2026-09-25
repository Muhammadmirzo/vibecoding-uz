import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { BRAND } from "@/config/brand";
import { db } from "@/db";
import { chatConversations, chatMessages } from "@/db/schema";
import type { ChatConversationDto, ChatMessageDto } from "@/features/chat/contracts";
import { postReply } from "@/features/chat/server/chat.service";
import { sendTelegramMessage, setTelegramReaction } from "./messages";

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
    "↩️ <i>Javob uchun shu xabarga Reply qiling</i>",
    `<a href="${link}">Saytda ochish</a>`,
  ].join("\n");
  const delivery = await sendTelegramMessage(adminChatId, text, "HTML");
  const parsed = delivery.success ? telegramResultSchema.safeParse(delivery.data) : null;
  if (!parsed?.success) return { sent: false };
  await db.update(chatMessages).set({ telegramMessageId: String(parsed.data.result.message_id) })
    .where(eq(chatMessages.id, message.id));
  return { sent: true, messageId: parsed.data.result.message_id };
}

type TelegramChatUpdate = {
  from?: { id?: number };
  message?: {
    message_id?: number;
    from?: { id?: number };
    chat?: { id?: number; type?: string };
    reply_to_message?: { message_id?: number; from?: { is_bot?: boolean } };
    text?: string;
  };
};

/**
 * An allowlisted admin answers a visitor by replying (Telegram "Reply") to the bot's
 * notification. Each reply is stored against exactly the visitor message it quotes, so
 * several visitor messages can be answered one by one, in any order, even concurrently.
 * The admin gets a 👍 reaction once the answer is saved, or a short explanation if the
 * reply could not be matched — nothing fails silently.
 *
 * Errors propagate on purpose: the webhook then answers 500 and Telegram re-delivers the
 * update; the `telegram-<message_id>` clientId makes that retry idempotent.
 */
export async function handleTelegramChatReply(update: TelegramChatUpdate): Promise<boolean> {
  const message = update.message;
  // Real Telegram updates carry the sender inside `message.from`.
  const userId = message?.from?.id ?? update.from?.id;
  if (!message?.message_id || !userId || !message.text || !telegramAdminAllowed(String(userId))) return false;
  const chatId = message.chat?.id ?? process.env.TELEGRAM_ADMIN_CHAT_ID;
  const parentId = message.reply_to_message?.message_id;

  if (!parentId) {
    // A plain message in a private chat with the bot has no recipient; say so instead of
    // dropping it. In a group, admins may be talking to each other — stay quiet there.
    if (chatId && message.chat?.type === "private" && !message.text.startsWith("/")) {
      await sendTelegramMessage(chatId, "↩️ Mehmonga javob berish uchun uning xabariga <b>Reply</b> qilib yozing.", "HTML", message.message_id);
    }
    return false;
  }

  const [parent] = await db.select({
    id: chatMessages.id,
    conversationId: chatMessages.conversationId,
    sender: chatMessages.sender,
    replyToId: chatMessages.replyToId,
  }).from(chatMessages).where(eq(chatMessages.telegramMessageId, String(parentId)))
    // Telegram ids are unique per chat only; if the admin chat ever changes, prefer the newest.
    .orderBy(desc(chatMessages.createdAt)).limit(1);
  if (!parent) {
    if (chatId && message.reply_to_message?.from?.is_bot) {
      await sendTelegramMessage(chatId, "⚠️ Bu xabar sayt chatiga bog'lanmagan. Mehmonning «Naqsh chat — yangi xabar» bildirishnomasiga Reply qiling.", "HTML", message.message_id);
    }
    return false;
  }

  // Replying to an earlier admin answer continues that same thread.
  const replyToId = parent.sender === "admin" ? parent.replyToId : parent.id;
  const reply = await postReply(null, parent.conversationId, message.text, `telegram-${message.message_id}`, "telegram", replyToId);
  await db.update(chatMessages).set({ telegramMessageId: String(message.message_id) })
    .where(eq(chatMessages.id, reply.id));
  if (chatId) await setTelegramReaction(chatId, message.message_id);
  return true;
}

export async function conversationExists(id: string) {
  const [row] = await db.select({ id: chatConversations.id }).from(chatConversations).where(eq(chatConversations.id, id)).limit(1);
  return Boolean(row);
}
