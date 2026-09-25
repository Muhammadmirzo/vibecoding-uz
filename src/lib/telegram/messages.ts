import { eq } from "drizzle-orm";
import { BRAND } from "@/config/brand";
import { fetchWithTimeout } from "@/lib/http/fetch";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  homeworkAlertSchema,
  meetReminderSchema,
  HomeworkAlertInput,
  MeetReminderInput,
} from "@/lib/validations";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML",
  replyToMessageId?: number,
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN kiritilmagan. Bildirishnoma o'tkazib yuborildi.");
    return { success: false, error: "Bot token missing" };
  }

  try {
    const res = await fetchWithTimeout("Telegram", `https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
        ...(replyToMessageId ? { reply_parameters: { message_id: replyToMessageId, allow_sending_without_reply: true } } : {}),
      }),
    }, 8_000);

    const data: unknown = await res.json();
    return {
      success: typeof data === "object" && data !== null && "ok" in data && data.ok === true,
      data,
    };
  } catch (err) {
    console.error("Telegram xabari yuborilmadi:", err);
    return { success: false, error: String(err) };
  }
}

/** Best-effort emoji reaction on a message (delivery receipt for admins); never throws. */
export async function setTelegramReaction(chatId: string | number, messageId: number, emoji = "👍") {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { success: false };
  try {
    const res = await fetchWithTimeout("Telegram", `https://api.telegram.org/bot${token}/setMessageReaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId, reaction: [{ type: "emoji", emoji }] }),
    }, 5_000);
    return { success: res.ok };
  } catch {
    return { success: false };
  }
}

export async function sendHomeworkSubmissionAlert(input: HomeworkAlertInput) {
  const validated = homeworkAlertSchema.parse(input);
  const { userId, assignmentTitle, status, score, feedbackMd } = validated;
  const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (userList.length === 0 || !userList[0].tgUserId) {
    return { success: false, reason: "User telegram ID not linked" };
  }

  let message = "";
  if (status === "submitted") {
    message = `📩 <b>Topshiriq qabul qilindi!</b>\n\n"<b>${escapeHtml(assignmentTitle)}</b>" bo'yicha javobingiz qabul qilindi. Mentor tez orada tekshiradi.`;
  } else if (status === "approved") {
    message = `🎉 <b>TABRIKLAYMIZ! TOPSHIRIQ QABUL QILINDI!</b>\n\n📚 <b>Mavzu:</b> ${escapeHtml(assignmentTitle)}\n⭐️ <b>Baho:</b> ${score ?? "-"}/10\n\n`;
    if (feedbackMd) message += `💬 <b>Mentor fikri:</b>\n${escapeHtml(feedbackMd)}\n\n`;
    message += `🚀 Keyingi amaliy darsingiz ochildi! Kabinetga kiring: ${BRAND.url}/kabinet`;
  } else if (status === "rejected") {
    message = `⚠️ <b>TOPSHIRIQ QAYTA ISHLASHGA QAYTARILDI</b>\n\n📚 <b>Mavzu:</b> ${escapeHtml(assignmentTitle)}\n⭐️ <b>Baho:</b> ${score ?? "-"}/10\n\n`;
    if (feedbackMd) message += `💬 <b>Mentor fikri:</b>\n${escapeHtml(feedbackMd)}\n\n`;
    message += "Iltimos, izohlarni ko'rib chiqib, qayta topshiring.";
  }

  return sendTelegramMessage(userList[0].tgUserId, message, "HTML");
}

export async function sendMeetReminder(input: MeetReminderInput) {
  const validated = meetReminderSchema.parse(input);
  const { chatId, title, startsAt, meetingUrl } = validated;
  const dateStr = typeof startsAt === "string" ? startsAt : startsAt.toLocaleString("uz-UZ");
  const message = [
    "⏰ <b>JONLI MEET / VEBINAR ESLATMASI</b>",
    "",
    `📌 <b>Mavzu:</b> ${escapeHtml(title)}`,
    `📅 <b>Boshlanish vaqti:</b> ${escapeHtml(dateStr)}`,
    meetingUrl ? `🔗 <b>Ulanish havolasi:</b> ${escapeHtml(meetingUrl)}` : "",
    "",
    "Darsga o'z vaqtida qo'shiling!",
  ].filter(Boolean).join("\n");

  return sendTelegramMessage(chatId, message, "HTML");
}
