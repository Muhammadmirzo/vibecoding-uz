import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  homeworkAlertSchema,
  meetReminderSchema,
  HomeworkAlertInput,
  MeetReminderInput,
} from "@/lib/validations";

export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML"
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN kiritilmagan. Bildirishnoma o'tkazib yuborildi.");
    return { success: false, error: "Bot token missing" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });

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

export async function sendHomeworkSubmissionAlert(input: HomeworkAlertInput) {
  const validated = homeworkAlertSchema.parse(input);
  const { userId, assignmentTitle, status, score, feedbackMd } = validated;
  const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (userList.length === 0 || !userList[0].tgUserId) {
    return { success: false, reason: "User telegram ID not linked" };
  }

  let message = "";
  if (status === "submitted") {
    message = `📩 <b>Topshiriq qabul qilindi!</b>\n\n"<b>${assignmentTitle}</b>" bo'yicha javobingiz qabul qilindi. Mentor tez orada tekshiradi.`;
  } else if (status === "approved") {
    message = `🎉 <b>TABRIKLAYMIZ! TOPSHIRIQ QABUL QILINDI!</b>\n\n📚 <b>Mavzu:</b> ${assignmentTitle}\n⭐️ <b>Baho:</b> ${score ?? "-"}/10\n\n`;
    if (feedbackMd) message += `💬 <b>Mentor fikri:</b>\n${feedbackMd}\n\n`;
    message += `🚀 Keyingi amaliy darsingiz ochildi! Kabinetga kiring: https://master-2-jade.vercel.app/kabinet`;
  } else if (status === "rejected") {
    message = `⚠️ <b>TOPSHIRIQ QAYTA ISHLASHGA QAYTARILDI</b>\n\n📚 <b>Mavzu:</b> ${assignmentTitle}\n⭐️ <b>Baho:</b> ${score ?? "-"}/10\n\n`;
    if (feedbackMd) message += `💬 <b>Mentor fikri:</b>\n${feedbackMd}\n\n`;
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
    `📌 <b>Mavzu:</b> ${title}`,
    `📅 <b>Boshlanish vaqti:</b> ${dateStr}`,
    meetingUrl ? `🔗 <b>Ulanish havolasi:</b> ${meetingUrl}` : "",
    "",
    "Darsga o'z vaqtida qo'shiling!",
  ].filter(Boolean).join("\n");

  return sendTelegramMessage(chatId, message, "HTML");
}
