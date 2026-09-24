import { Markup, Telegraf } from "telegraf";
import { BRAND } from "@/config/brand";
import { approveTelegramLogin } from "@/features/auth/server/telegram-login.service";
import { ServiceError } from "@/lib/http/errors";
import { handleOperatorHandoff } from "../handoff";
import { linkTelegramAccount } from "../linkAccount";
import { loginConfirmationKeyboard, loginConfirmationText } from "./start";

const mainKeyboard = Markup.keyboard([
  ["📚 Kurslar va Narxlar", "🎯 Bepul Diagnostika"],
  ["💡 G'oya Kalkulyatori", "🎁 Bepul Dars"],
  ["📱 Hisobni Ulash (Telefon)", "🆘 Mentor / Operator"],
]).resize();

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character] ?? character);
}

export function isContactOwnedBySender(
  contactUserId: number | string | null | undefined,
  senderId: number | string,
): boolean {
  if (contactUserId === null || contactUserId === undefined) return false;
  return String(contactUserId) === String(senderId);
}

export function registerAccountHandlers(bot: Telegraf) {
  bot.hears("📱 Hisobni Ulash (Telefon)", async (ctx) => ctx.reply(
    "Platformadagi akkauntingizni ushbu botga bog'lash uchun quyidagi tugma orqali telefon raqamingizni yuboring:",
    Markup.keyboard([
      [Markup.button.contactRequest("📱 Raqamimni tasdiqlash")],
      ["🔙 Asosiy Menyu"],
    ]).resize(),
  ));

  bot.hears("🔙 Asosiy Menyu", async (ctx) => ctx.reply("Asosiy menyu:", mainKeyboard));

  bot.on("contact", async (ctx) => {
    const contact = ctx.message.contact;
    if (!contact) return;

    if (!isContactOwnedBySender(contact.user_id, ctx.from.id)) {
      return ctx.reply("⚠️ Faqat o'zingizning telefon raqamingizni yuboring (tugma orqali). Boshqa kontaktni ulab bo'lmaydi.");
    }

    const phone = contact.phone_number;
    try {
      const result = await approveTelegramLogin({
        tgUserId: ctx.from.id.toString(),
        tgUsername: ctx.from.username,
        fullName: [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" "),
        phone,
      });
      return ctx.reply(loginConfirmationText(result), { reply_markup: loginConfirmationKeyboard(result.requestId) });
    } catch (error) {
      if (error instanceof ServiceError && error.code === "CONFLICT") {
        return ctx.reply("Bu Telegram akkaunti boshqa telefon raqamiga bog'langan. Avval saytdagi telefon orqali kirib, Telegram akkauntini almashtiring.");
      }
      if (!(error instanceof ServiceError) || error.code !== "INVALID_TOKEN") {
        return ctx.reply("Texnik xatolik yuz berdi. Birozdan keyin qayta urinib ko'ring.");
      }
    }

    const result = await linkTelegramAccount({
      tgUserId: ctx.from.id.toString(),
      tgUsername: ctx.from.username,
      phone,
    });
    if (result.success && result.user) {
      return ctx.reply(
        `✅ Rahmat, <b>${escapeHtml(result.user.fullName)}</b>!\n\nHisobingiz muvaffaqiyatli ulandi. Endi darslar va vazifalar xabarnomalari shu yerga keladi.`,
        { parse_mode: "HTML", ...mainKeyboard },
      );
    }

    return ctx.reply(
      `⚠️ Telefon raqam (<b>${escapeHtml(phone)}</b>) bo'yicha platformada foydalanuvchi topilmadi.\nIltimos, avval saytda ro'yxatdan o'ting: ${BRAND.url}`,
      { parse_mode: "HTML" },
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
