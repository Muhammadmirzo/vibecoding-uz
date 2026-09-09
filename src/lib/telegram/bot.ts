import { Telegraf, Markup } from "telegraf";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, courses, leads } from "@/db/schema";
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

export async function handleOperatorHandoff(input: OperatorHandoffInput) {
  const validated = operatorHandoffSchema.parse(input);
  const { tgUserId, tgUsername, userFullName, reason } = validated;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.tgUserId, tgUserId))
    .limit(1);

  const name = userFullName || existingUser[0]?.fullName || `@${tgUsername}` || tgUserId;
  const phone = existingUser[0]?.phone || "Noma'lum";

  const message = [
    "🆘 <b>YANGI OPERATOR SO'ROVI (LEAD)</b>",
    `👤 <b>Foydalanuvchi:</b> ${name}`,
    `📞 <b>Telefon:</b> ${phone}`,
    `🆔 <b>Telegram ID:</b> <code>${tgUserId}</code>`,
    tgUsername ? `🌐 <b>Username:</b> @${tgUsername}` : "",
    reason ? `📝 <b>Sabab:</b> ${reason}` : "",
    `🕒 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId) {
    await sendTelegramMessage(adminChatId, message, "HTML");
  }

  return {
    success: true,
    message: "Operator bilan bog'lanish so'rovingiz qabul qilindi. Tez orada professional AI mentorimiz siz bilan bog'lanadi.",
  };
}

export async function sendHomeworkSubmissionAlert(input: HomeworkAlertInput) {
  const validated = homeworkAlertSchema.parse(input);
  const { userId, assignmentTitle, status, score, feedbackMd } = validated;

  const userList = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (userList.length === 0 || !userList[0].tgUserId) {
    return { success: false, reason: "User telegram ID not linked" };
  }

  const user = userList[0];

  let message = "";
  if (status === "submitted") {
    message = `📩 <b>Topshiriq qabul qilindi!</b>\n\n"<b>${assignmentTitle}</b>" bo'yicha javobingiz qabul qilindi. Mentor tez orada tekshiradi.`;
  } else if (status === "approved") {
    message = `🎉 <b>TABRIKLAYMIZ! TOPSHIRIQ QABUL QILINDI!</b>\n\n📚 <b>Mavzu:</b> ${assignmentTitle}\n⭐️ <b>Baho:</b> ${score ?? "-"}/10\n\n`;
    if (feedbackMd) {
      message += `💬 <b>Mentor fikri:</b>\n${feedbackMd}\n\n`;
    }
    message += `🚀 Keyingi amaliy darsingiz ochildi! Kabinetga kiring: https://master-2-jade.vercel.app/kabinet`;
  } else if (status === "rejected") {
    message = `⚠️ <b>TOPSHIRIQ QAYTA ISHLASHGA QAYTARILDI</b>\n\n📚 <b>Mavzu:</b> ${assignmentTitle}\n⭐️ <b>Baho:</b> ${score ?? "-"}/10\n\n`;
    if (feedbackMd) {
      message += `💬 <b>Mentor fikri:</b>\n${feedbackMd}\n\n`;
    }
    message += `Iltimos, izohlarni ko'rib chiqib, qayta topshiring.`;
  }

  return await sendTelegramMessage(user.tgUserId!, message, "HTML");
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
  ]
    .filter(Boolean)
    .join("\n");

  return await sendTelegramMessage(chatId, message, "HTML");
}

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

    const data = await res.json();
    return { success: data.ok, data };
  } catch (err) {
    console.error("Telegram xabari yuborilmadi:", err);
    return { success: false, error: String(err) };
  }
}

/**
 * Ideal Telegram Bot Handlers for Vibecoding Platform.
 * Supports /start, lead generation, course catalog, interactive demo, and operator handoff.
 */
export function initTelegramBot(): Telegraf | null {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return null;
  }

  if (botInstance) return botInstance;

  const bot = new Telegraf(token);

  // /start handler with rich menu
  bot.command("start", async (ctx) => {
    const payload = ctx.payload;
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
          `🎉 Xush kelibsiz, <b>${result.user.fullName}</b>!\n\nHisobingiz Vibecoding platformasiga muvaffaqiyatli ulandi.\nBarcha dars yangiliklari va uyga vazifa baholari shu bot orqali boradi.`,
          {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([
              [Markup.button.url("🚀 Shaxsiy Kabinetga Kirish", "https://master-2-jade.vercel.app/kabinet")],
            ]),
          }
        );
      }
    }

    const welcomeText = [
      "🚀 <b>Vibecoding — AI bilan real mahsulotlar yaratish akademiyasi</b>\n",
      "Bu bot orqali siz:",
      "• 8 haftada g'oyadan jonli dasturgacha chiqarish metodini o'rganasiz",
      "• Dasturchilarsiz startap qurish bo'yicha bepul darslarni ko'rasiz",
      "• O'zingizga mos kursni 2 daqiqada diagnostika qilasiz",
      "• Shaxsiy kabinetingiz va uyga vazifalaringizni nazorat qilasiz\n",
      "Quyidagi bo'limlardan birini tanlang:",
    ].join("\n");

    return ctx.reply(
      welcomeText,
      {
        parse_mode: "HTML",
        ...Markup.keyboard([
          ["📚 Kurslar va Narxlar", "🎯 Bepul Diagnostika"],
          ["💡 G'oya Kalkulyatori", "🎁 Bepul Dars"],
          ["📱 Hisobni Ulash (Telefon)", "🆘 Mentor / Operator"],
        ]).resize(),
      }
    );
  });

  // Kurslar bo'limi
  bot.hears("📚 Kurslar va Narxlar", async (ctx) => {
    const text = [
      "🎓 <b>BIZNING AMALIY KURSLARIMIZ:</b>\n",
      "<b>1. Vibe Coding Express (8 hafta)</b>",
      "• Dasturchilarsiz, g'oyadan jonli veb-sayt, bot va MVP gacha.",
      "• Narxi: <b>2 990 000 so'm</b> (Muddatli to'lov: 3 oyga 996 000 so'mdan)",
      "• 14 kunlik 100% pulni qaytarish kafolati mavjud.\n",
      "<b>2. AI Asoslari & Prompt Injiniring (4 hafta)</b>",
      "• Biznes va ishlarni 90% ga avtomatlashtirish, Claude & Cursor sirlari.",
      "• Narxi: <b>990 000 so'm</b>\n",
      "Batafsil ma'lumot va joy band qilish uchun quyidagi havolani bosing:",
    ].join("\n");

    return ctx.reply(text, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🌐 Saytda Ko'rish va Ro'yxatdan O'tish", "https://master-2-jade.vercel.app")],
      ]),
    });
  });

  // Bepul Diagnostika
  bot.hears("🎯 Bepul Diagnostika", async (ctx) => {
    return ctx.reply(
      "🎯 <b>Qaysi kurs sizga eng ko'p foyda keltiradi?</b>\n\n2 daqiqalik 9 ta savoldan iborat bepul test orqali o'z darajangiz va maqsadingizga mos individual yo'nalishni aniqlang:",
      {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.url("🚀 Diagnostikadan O'tish", "https://master-2-jade.vercel.app/diagnostika")],
        ]),
      }
    );
  });

  // G'oya Kalkulyatori
  bot.hears("💡 G'oya Kalkulyatori", async (ctx) => {
    const text = [
      "💡 <b>VIBE CODING BILAN QANCHA PUL VA VAQT TEJALADI?</b>\n",
      "📊 <b>Oddiy dasturchilar yo'li:</b>",
      "• Xarajat: <b>1 500$ — 4 000$</b>",
      "• Muddat: <b>2 — 4 oy</b>",
      "• Doimiy to'lov va qaramlik.\n",
      "⚡️ <b>Vibecoding usuli (O'zingiz qurasiz):</b>",
      "• Xarajat: <b>0$</b> (Faqat kurs narxi evaziga)",
      "• Muddat: <b>4 — 7 kun</b>",
      "• To'liq erkinlik va o'z qo'lingizdagi boshqaruv!\n",
      "Saytda o'z g'oyangiz bo'yicha aniq tejash rejasini hisoblang:",
    ].join("\n");

    return ctx.reply(text, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🧮 Saytda Hisoblab Ko'rish", "https://master-2-jade.vercel.app#kalkulyator")],
      ]),
    });
  });

  // Bepul Dars
  bot.hears("🎁 Bepul Dars", async (ctx) => {
    return ctx.reply(
      "🎁 <b>BEPUL AMALIY DARS:</b>\n\n\"AI yordamida dasturchilarsiz birinchi veb-saytni 15 daqiqada qurish\"\n\nHoziroq tomosha qiling va metodni amalda ko'ring:",
      {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.url("▶️ Bepul Darsni Ochish", "https://master-2-jade.vercel.app/bepul-dars")],
        ]),
      }
    );
  });

  // Telefon ulash tugmasi
  bot.hears("📱 Hisobni Ulash (Telefon)", async (ctx) => {
    return ctx.reply(
      "Platformadagi akkauntingizni ushbu botga bog'lash uchun quyidagi tugma orqali telefon raqamingizni yuboring:",
      Markup.keyboard([
        [Markup.button.contactRequest("📱 Raqamimni tasdiqlash")],
        ["🔙 Asosiy Menyu"],
      ]).resize()
    );
  });

  // Asosiy menyuga qaytish
  bot.hears("🔙 Asosiy Menyu", async (ctx) => {
    return ctx.reply(
      "Asosiy menyu:",
      Markup.keyboard([
        ["📚 Kurslar va Narxlar", "🎯 Bepul Diagnostika"],
        ["💡 G'oya Kalkulyatori", "🎁 Bepul Dars"],
        ["📱 Hisobni Ulash (Telefon)", "🆘 Mentor / Operator"],
      ]).resize()
    );
  });

  // Contact handler
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
        `✅ Rahmat, <b>${result.user.fullName}</b>!\n\nHisobingiz muvaffaqiyatli ulandi. Endi darslar va vazifalar xabarnomalari to'g'ridan-to'g'ri shu yerga keladi.`,
        {
          parse_mode: "HTML",
          ...Markup.keyboard([
            ["📚 Kurslar va Narxlar", "🎯 Bepul Diagnostika"],
            ["💡 G'oya Kalkulyatori", "🎁 Bepul Dars"],
            ["📱 Hisobni Ulash (Telefon)", "🆘 Mentor / Operator"],
          ]).resize(),
        }
      );
    }

    return ctx.reply(
      `⚠️ Telefon raqam (<b>${phone}</b>) bo'yicha platformada foydalanuvchi topilmadi.\nIltimos, avval saytda ro'yxatdan o'ting: https://master-2-jade.vercel.app`,
      { parse_mode: "HTML" }
    );
  });

  // Operator / Mentor
  bot.hears(["🆘 Mentor / Operator", "🆘 Operator bilan bog'lanish"], async (ctx) => {
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

export function getTelegramBot(): Telegraf | null {
  if (!botInstance) {
    return initTelegramBot();
  }
  return botInstance;
}
