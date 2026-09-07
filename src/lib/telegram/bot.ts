import { Telegraf, Markup } from "telegraf";
import { eq, or } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  tgAuthLinkSchema,
  operatorHandoffSchema,
  homeworkAlertSchema,
  meetReminderSchema,
  HomeworkAlertInput,
  MeetReminderInput,
  TgAuthLinkInput,
  OperatorHandoffInput,
} from "@/lib/validations";

let botInstance: Telegraf | null = null;

/**
 * Normalizes phone numbers to format +998XXXXXXXXX
 */
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned.startsWith("+")) {
    if (cleaned.startsWith("998")) {
      cleaned = "+" + cleaned;
    } else if (cleaned.length === 9) {
      cleaned = "+998" + cleaned;
    }
  }
  return cleaned;
}

/**
 * Links a Telegram User ID to a Vibecoding user account by phone or user ID.
 */
export async function linkTelegramAccount(input: TgAuthLinkInput) {
  const validated = tgAuthLinkSchema.parse(input);
  const { tgUserId, tgUsername, phone, linkToken } = validated;

  if (phone) {
    const formattedPhone = normalizePhone(phone);
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.phone, formattedPhone))
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      await db
        .update(users)
        .set({
          tgUserId,
          tgUsername: tgUsername || user.tgUsername,
        })
        .where(eq(users.id, user.id));

      return { success: true, user: { id: user.id, fullName: user.fullName, phone: user.phone } };
    }
  }

  if (linkToken) {
    // If token matches user ID or payload token
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, linkToken))
      .limit(1);

    if (existingUser.length > 0) {
      const user = existingUser[0];
      await db
        .update(users)
        .set({
          tgUserId,
          tgUsername: tgUsername || user.tgUsername,
        })
        .where(eq(users.id, user.id));

      return { success: true, user: { id: user.id, fullName: user.fullName, phone: user.phone } };
    }
  }

  return { success: false, error: "Foydalanuvchi topilmadi" };
}

/**
 * Handles operator handoff requests from students or leads.
 */
export async function handleOperatorHandoff(input: OperatorHandoffInput) {
  const validated = operatorHandoffSchema.parse(input);
  const { tgUserId, tgUsername, userFullName, reason } = validated;

  // Find linked user if exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.tgUserId, tgUserId))
    .limit(1);

  const name = userFullName || existingUser[0]?.fullName || `@${tgUsername}` || tgUserId;
  const phone = existingUser[0]?.phone || "Nomalum";

  const message = [
    "🆘 <b>OPERATOR GA BOG'LANISH SO'ROVI</b>",
    `<b>Foydalanuvchi:</b> ${name}`,
    `<b>Telefon:</b> ${phone}`,
    `<b>Telegram ID:</b> <code>${tgUserId}</code>`,
    tgUsername ? `<b>Username:</b> @${tgUsername}` : "",
    reason ? `<b>Sabab:</b> ${reason}` : "",
    `<b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Send notification to admin/manager channel if configured
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId) {
    await sendTelegramMessage(adminChatId, message, "HTML");
  }

  return {
    success: true,
    message: "Operator bilan bog'lanish so'rovingiz qabul qilindi. Tez orada menejer siz bilan bog'lanadi.",
  };
}

/**
 * Sends homework submission status updates or alerts.
 */
export async function sendHomeworkSubmissionAlert(input: HomeworkAlertInput) {
  const validated = homeworkAlertSchema.parse(input);
  const { userId, assignmentTitle, status, score, feedbackMd } = validated;

  // Find user to get tgUserId
  const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userList.length === 0 || !userList[0].tgUserId) {
    return { success: false, reason: "User telegram ID not linked" };
  }

  const user = userList[0];

  let message = "";
  if (status === "submitted") {
    message = `📩 <b>Topshiriq yuborildi!</b>\n\n"<b>${assignmentTitle}</b>" bo'yicha javobingiz qabul qilindi. Mentor tez orada tekshiradi.`;
  } else if (status === "approved") {
    message = `🎉 <b>TOPSHIRIQ QABUL QILINDI!</b>\n\n📚 <b>Mavzu:</b> ${assignmentTitle}\n⭐️ <b>Baho:</b> ${score ?? "-"}/10\n\n`;
    if (feedbackMd) {
      message += `💬 <b>Mentor fikri:</b>\n${feedbackMd}\n\n`;
    }
    message += `🚀 Keyingi darsingiz ochildi! Muvaffaqiyatlar tilaymiz.`;
  } else if (status === "rejected") {
    message = `⚠️ <b>TOPSHIRIQ QAYTA ISHLASH UCHUN QAYTARILDI</b>\n\n📚 <b>Mavzu:</b> ${assignmentTitle}\n⭐️ <b>Baho:</b> ${score ?? "-"}/10\n\n`;
    if (feedbackMd) {
      message += `💬 <b>Mentor fikri:</b>\n${feedbackMd}\n\n`;
    }
    message += `Iltimos, izohlarni ko'rib chiqib, qayta topshiring.`;
  }

  return await sendTelegramMessage(user.tgUserId!, message, "HTML");
}

/**
 * Sends upcoming live webinar / meeting reminders.
 */
export async function sendMeetReminder(input: MeetReminderInput) {
  const validated = meetReminderSchema.parse(input);
  const { chatId, title, startsAt, meetingUrl } = validated;

  const dateStr = typeof startsAt === "string" ? startsAt : startsAt.toLocaleString("uz-UZ");

  const message = [
    "⏰ <b>LIVE MEET / VEBINAR ESLATMASI</b>",
    "",
    `📌 <b>Mavzu:</b> ${title}`,
    `📅 <b>Boshlanish vaqti:</b> ${dateStr}`,
    meetingUrl ? `🔗 <b>Ulanish havolasi:</b> ${meetingUrl}` : "",
    "",
    "Darsga o'z vaqtida qo'shiling!",
  ]
    .filter(Boolean)
    .join("\n");

  return await sendTelegramMessage(chatId, message, "HTML");
}

/**
 * Generic function to send Telegram message using bot token.
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  parseMode: "HTML" | "Markdown" = "HTML"
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN missing. Skipping Telegram notification.");
    return { success: false, error: "Bot token missing" };
  }

  try {
    const bot = getTelegramBot();
    if (!bot) {
      // Fallback via HTTP fetch if bot instance is not initialized
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

      const data = await res.json();
      return { success: data.ok, data };
    }

    await bot.telegram.sendMessage(chatId, text, { parse_mode: parseMode });
    return { success: true };
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * Initializes and configures the Telegraf bot instance.
 */
export function initTelegramBot(): Telegraf | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN environment variable is not defined.");
    return null;
  }

  if (botInstance) return botInstance;

  const bot = new Telegraf(token);

  // Command /start handler with payload or phone link
  bot.command("start", async (ctx) => {
    const payload = ctx.payload; // /start <token>
    const tgUserId = ctx.from.id.toString();
    const tgUsername = ctx.from.username;

    if (payload) {
      const result = await linkTelegramAccount({
        tgUserId,
        tgUsername,
        linkToken: payload,
        phone: payload.startsWith("+") ? payload : undefined,
      });

      if (result.success && result.user) {
        return ctx.reply(
          `🎉 Xush kelibsiz, ${result.user.fullName}!\n\nHisobingiz platformaga muvaffaqiyatli ulandi.`
        );
      }
    }

    // Check if user is already linked
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.tgUserId, tgUserId))
      .limit(1);

    if (existing.length > 0) {
      return ctx.reply(
        `Assalomu alaykum, ${existing[0].fullName}!\n\nVibecoding platformasining rasmiy botiga xush kelibsiz. Hisobingiz ulangan.`,
        Markup.keyboard([
          [Markup.button.text("🆘 Operator bilan bog'lanish")],
        ]).resize()
      );
    }

    return ctx.reply(
      "Assalomu alaykum! Vibecoding platformasiga xush kelibsiz.\n\nHisobingizni ulash uchun pastdagi tugma orqali telefon raqamingizni yuboring:",
      Markup.keyboard([
        [Markup.button.contactRequest("📱 Telefon raqamni yuborish")],
        [Markup.button.text("🆘 Operator bilan bog'lanish")],
      ]).resize()
    );
  });

  // Contact sharing handler
  bot.on("contact", async (ctx) => {
    const contact = ctx.message.contact;
    if (!contact) return;

    const tgUserId = ctx.from.id.toString();
    const tgUsername = ctx.from.username;
    const phone = contact.phone_number;

    const result = await linkTelegramAccount({
      tgUserId,
      tgUsername,
      phone,
    });

    if (result.success && result.user) {
      return ctx.reply(
        `✅ Rahmat! ${result.user.fullName}, hisobingiz muvaffaqiyatli ulandi.`,
        Markup.removeKeyboard()
      );
    }

    return ctx.reply(
      `⚠️ Telefon raqam (${phone}) bo'yicha foydalanuvchi topilmadi. Avval platformada ro'yxatdan o'ting.`
    );
  });

  // Command /operator handoff
  bot.command("operator", async (ctx) => {
    const tgUserId = ctx.from.id.toString();
    const tgUsername = ctx.from.username;
    const userFullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ");

    const res = await handleOperatorHandoff({
      tgUserId,
      tgUsername,
      userFullName,
    });

    return ctx.reply(res.message);
  });

  // Text message handler matching operator button
  bot.hears("🆘 Operator bilan bog'lanish", async (ctx) => {
    const tgUserId = ctx.from.id.toString();
    const tgUsername = ctx.from.username;
    const userFullName = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ");

    const res = await handleOperatorHandoff({
      tgUserId,
      tgUsername,
      userFullName,
    });

    return ctx.reply(res.message);
  });

  botInstance = bot;
  return bot;
}

/**
 * Returns active Telegram bot instance.
 */
export function getTelegramBot(): Telegraf | null {
  if (!botInstance) {
    return initTelegramBot();
  }
  return botInstance;
}
