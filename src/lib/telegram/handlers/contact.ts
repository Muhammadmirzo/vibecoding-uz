import { Markup, Telegraf } from "telegraf";
import { linkTelegramAccount } from "../linkAccount";
import { handleOperatorHandoff } from "../handoff";

const mainKeyboard = Markup.keyboard([
  ["📚 Kurslar va Narxlar", "🎯 Bepul Diagnostika"],
  ["💡 G'oya Kalkulyatori", "🎁 Bepul Dars"],
  ["📱 Hisobni Ulash (Telefon)", "🆘 Mentor / Operator"],
]).resize();

export function registerAccountHandlers(bot: Telegraf) {
  bot.hears("📱 Hisobni Ulash (Telefon)", async (ctx) => ctx.reply(
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

    const phone = contact.phone_number;
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
