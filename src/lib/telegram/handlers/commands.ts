import { Markup, Telegraf } from "telegraf";
import { QUIZ_QUESTIONS } from "@/features/quiz/quizData";
import { siteConfig } from "@/lib/siteConfig";

export function registerMenuHandlers(bot: Telegraf) {
  bot.hears("📚 Kurslar va Narxlar", async (ctx) => {
    const text = [
      "🎓 <b>BIZNING AMALIY KURSLARIMIZ:</b>\n",
      "<b>1. Vibe Coding Express (8 hafta)</b>",
      "• Dasturchilarsiz, g'oyadan jonli veb-sayt, bot va MVP gacha.",
      "• Narxi: <b>2 990 000 so'm</b> (Muddatli to'lov: 3 oyga 996 000 so'mdan)",
      `• ${siteConfig.guaranteeText}.\n`,
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

  bot.hears("🎯 Bepul Diagnostika", async (ctx) => ctx.reply(
    `🎯 <b>Qaysi kurs sizga eng ko'p foyda keltiradi?</b>\n\n2 daqiqalik ${QUIZ_QUESTIONS.length} ta savoldan iborat bepul test orqali o'z darajangiz va maqsadingizga mos individual yo'nalishni aniqlang:`,
    {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🚀 Diagnostikadan O'tish", "https://master-2-jade.vercel.app/diagnostika")],
      ]),
    }
  ));

  bot.hears("💡 G'oya Kalkulyatori", async (ctx) => {
    const text = [
      "💡 <b>VIBE CODING BILAN QANCHA PUL VA VAQT TEJALADI?</b>\n",
      "📊 <b>Oddiy dasturchilar yo'li:</b>",
      "• Xarajat: <b>1 500$ — 4 000$</b>",
      "• Muddat: <b>2 — 4 oy</b>",
      "• Doimiy to'lov va qaramlik.\n",
      "⚡️ <b>Naqsh usuli (O'zingiz qurasiz):</b>",
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

  bot.hears("🎁 Bepul Dars", async (ctx) => ctx.reply(
    "🎁 <b>BEPUL AMALIY DARS:</b>\n\n\"AI yordamida dasturchilarsiz birinchi veb-saytni 15 daqiqada qurish\"\n\nHoziroq tomosha qiling va metodni amalda ko'ring:",
    {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("▶️ Bepul Darsni Ochish", "https://master-2-jade.vercel.app/bepul-dars")],
      ]),
    }
  ));
}
