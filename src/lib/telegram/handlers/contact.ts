import { Markup, Telegraf } from "telegraf";
import { BRAND } from "@/config/brand";
import { approveTelegramLogin, takeTelegramLoginContact } from "@/features/auth/server/telegram-login.service";
import { linkTelegramAccount } from "../linkAccount";
import { handleOperatorHandoff } from "../handoff";

const mainKeyboard = Markup.keyboard([
  ["📚 Kurslar va Narxlar", "🎯 Bepul Diagnostika"],
  ["💡 G'oya Kalkulyatori", "🎁 Bepul Dars"],
  ["📱 Hisobni Ulash (Telefon)", "🆘 Mentor / Operator"],
]).resize();

/**
 * Ownership check: Telegram marks contacts shared via the "request contact"
 * button with the sender's own user id. A fabricated contact (someone
 * else's number) must never link an account.
 */
export function isContactOwnedBySender(
  contactUserId: number | string | null | undefined,
  senderId: number | string
): boolean {
  if (contactUserId === null || contactUserId === undefined) return false;
  return String(contactUserId) === String(senderId);
}

export function registerAccountHandlers(bot: Telegraf) {  bot.hears("📱 Hisobni Ulash (Telefon)", async (ctx) => ctx.reply(
    "Platformadagi akkauntingizni ushbu botga bog'lash uchun quyidagi tugma orqali telefon raqamingizni yuboring:",
    Markup.keyboard([
      [Markup.button.contactRequest("📱 Raqamimni tasdiqlash")],
      ["🔙 Asosiy Menyu"],
    ]).resize()
  ));

  bot.hears("🔙 Asosiy Menyu", async (ctx) => ctx.reply("Asosiy menyu:", mainKeyboard));

  bot.on("contact", async (ctx) => {
    const contact = ctx.message.contact;
    if (!contact) return;

    // Ownership check: Telegram marks contacts shared via the "request
    // contact" button with the sender's own user id. A fabricated contact
    // (forwarded/shared contact of someone else) must never link an account.
    if (!isContactOwnedBySender(contact.user_id, ctx.from.id)) {
      return ctx.reply(
        "⚠️ Faqat o'zingizning telefon raqamingizni yuboring (tugma orqali). Boshqa kontaktni ulab bo'lmaydi.",
        { parse_mode: "HTML" }
      );
    }

    const phone = contact.phone_number;
    const loginToken = takeTelegramLoginContact(ctx.from.id.toString());
    if (loginToken) {
      try {
        const result = await approveTelegramLogin({ token: loginToken, tgUserId: ctx.from.id.toString(), tgUsername: ctx.from.username, fullName: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" "), phone });
        return ctx.reply(`✅ Tayyor! ${result.user.fullName}, ${BRAND.name} saytida hisobingizga kirdingiz.`, { parse_mode: "HTML", ...Markup.inlineKeyboard([[Markup.button.url("Saytga qaytish", BRAND.url)]]) });
      } catch {
        return ctx.reply("Bu kirish havolasi eskirgan yoki allaqachon ishlatilgan. Iltimos, saytdagi Telegram tugmasini qayta bosing.");
      }
    }
    const result = await linkTelegramAccount({
      tgUserId: ctx.from.id.toString(),
      tgUsername: ctx.from.username,
      phone,
    });

    if (result.success && result.user) {
      return ctx.reply(
        `✅ Rahmat, <b>${result.user.fullName}</b>!\n\nHisobingiz muvaffaqiyatli ulandi. Endi darslar va vazifalar xabarnomalari to'g'ridan-to'g'ri shu yerga keladi.`,
        { parse_mode: "HTML", ...mainKeyboard }
      );
    }

    return ctx.reply(
      `⚠️ Telefon raqam (<b>${phone}</b>) bo'yicha platformada foydalanuvchi topilmadi.\nIltimos, avval saytda ro'yxatdan o'ting: https://master-2-jade.vercel.app`,
      { parse_mode: "HTML" }
    );
  });

  bot.hears(["🆘 Mentor / Operator", "🆘 Operator bilan bog'lanish"], async (ctx) => {
    const result = await handleOperatorHandoff({
      tgUserId: ctx.from.id.toString(),
      tgUsername: ctx.from.username,
      userFullName: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" "),
    });
    return ctx.reply(result.message);
  });
}
