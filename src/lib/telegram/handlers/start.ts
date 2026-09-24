import { Markup, Telegraf } from "telegraf";
import { QUIZ_QUESTIONS } from "@/features/quiz/quizData";
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

    if (payload) {
      // Only short-lived signed single-use link tokens are accepted here
      // (see lib/telegram/linkToken.ts). Anything else falls through to the
      // generic welcome message instead of linking an account.
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
