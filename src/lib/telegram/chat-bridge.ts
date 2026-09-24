import { eq } from "drizzle-orm";
import { db } from "@/db";
import { chatConversations, chatMessages } from "@/db/schema";
import { postReply } from "@/features/chat/server/chat.service";

function adminAllowed(id: string): boolean { return (process.env.TELEGRAM_ADMIN_USER_IDS || "").split(",").map((v) => v.trim()).filter(Boolean).includes(id); }
export async function handleTelegramChatReply(update: { from?: { id?: number }; message?: { message_id?: number; reply_to_message?: { message_id?: number }; text?: string } }): Promise<boolean> {
  const message = update.message; const userId = update.from?.id; const parentId = message?.reply_to_message?.message_id;
  if (!message || !userId || !parentId || !message.text || !adminAllowed(String(userId))) return false;
  const [parent] = await db.select({ conversationId: chatMessages.conversationId }).from(chatMessages).where(eq(chatMessages.telegramMessageId, String(parentId))).limit(1);
  if (!parent) return false;
  await postReply(String(userId), parent.conversationId, message.text, `telegram-${message.message_id}`);
  await db.update(chatMessages).set({ telegramMessageId: String(message.message_id) }).where(eq(chatMessages.conversationId, parent.conversationId));
  return true;
}
