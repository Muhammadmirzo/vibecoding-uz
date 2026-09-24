import { Markup, Telegraf } from "telegraf";
import { BRAND } from "@/config/brand";
import { approveAlreadyLinkedTelegramLogin, rememberTelegramLoginContact } from "@/features/auth/server/telegram-login.service";
import { ServiceError } from "@/lib/http/errors";
import { linkTelegramAccount } from "../linkAccount";

const mainKeyboard = Markup.keyboard([
  ["📚 Kurslar va Narxlar", "🎯 Bepul Diagnostika"],
  ["💡 G'oya Kalkulyatori", "🎁 Bepul Dars"],
  ["📱 Hisobni Ulash (Telefon)", "🆘 Mentor / Operator"],
]).resize();

export function registerStartHandler(bot: Telegraf) {
  bot.command("start", async (ctx) => {
    const payload = ctx.payload;
    const tgUserId = ctx.from.id.toString();

    if (payload && /^login_[A-Za-z0-9_-]{1,58}$/.test(payload)) {
      const token = payload.slice("login_".length);
      rememberTelegramLoginContact(tgUserId, token);
      try {
        const user = await approveAlreadyLinkedTelegramLogin(token, tgUserId);
        return ctx.reply(`✅ Tayyor! ${BRAND.name} saytida hisobingizga kirdingiz.\n\nSaytga qaytib, davom etishingiz mumkin.`, { parse_mode: "HTML", ...Markup.inlineKeyboard([[Markup.button.url("Saytga qaytish", BRAND.url)]]) });
      } catch (error) {
        if (error instanceof ServiceError && error.code === "NOT_FOUND") {
          return ctx.reply(`${BRAND.name} saytida kirish uchun avval o'zingizning telefon raqamingizni ulashing.`, { parse_mode: "HTML", ...Markup.keyboard([[Markup.button.contactRequest("📱 Raqamni ulashish")]]).resize() });
        }
        return ctx.reply("Bu kirish havolasi eskirgan yoki allaqachon ishlatilgan. Iltimos, saytdagi Telegram tugmasini qayta bosing.", { parse_mode: "HTML" });
      }
    }

    if (payload) {
      const result = await linkTelegramAccount({
        tgUserId,
        tgUsername: ctx.from.username,
        linkToken: payload,
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

    return ctx.reply(welcomeText, { parse_mode: "HTML", ...mainKeyboard });
  });
}
