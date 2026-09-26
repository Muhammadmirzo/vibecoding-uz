import { Markup, Telegraf } from "telegraf";
import { QUIZ_QUESTIONS } from "@/features/quiz/quizData";
import { COURSES, getCoursePricing } from "@/features/courses/content";
import { siteConfig } from "@/lib/siteConfig";
import { MAIN_MENU } from "./menu";

/** Absolute site link built from the single config source (never hardcoded). */
function siteUrl(path = ""): string {
  return `${siteConfig.siteUrl.replace(/\/$/, "")}${path}`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

/**
 * Course line for the bot: title, duration, the real price and the real
 * installment plan — every number comes from `siteConfig.courses` through
 * `getCoursePricing`, so the bot can never drift from the site (L14).
 */
export function coursePriceLine(slug: string): string {
  const course = COURSES[slug];
  const pricing = getCoursePricing(slug);
  if (!course) return `• Narxi: <b>${escapeHtml(pricing.price)}</b>`;
  return [
    `• Narxi: <b>${escapeHtml(pricing.price)}</b>`,
    `• Bo'lib to'lash: ${escapeHtml(pricing.installment)}`,
    `• Davomiyligi: ${escapeHtml(course.duration)}`,
  ].join("\n");
}

export function registerMenuHandlers(bot: Telegraf) {
  bot.hears(MAIN_MENU.courses, async (ctx) => {
    const text = [
      "🎓 <b>AMALIY KURSLARIMIZ:</b>\n",
      `<b>1. ${escapeHtml(COURSES["vibe-coding-express"].title)}</b>`,
      "• Dasturchilarsiz, g'oyadan jonli veb-sayt, bot va MVP gacha.",
      coursePriceLine("vibe-coding-express"),
      `• ${siteConfig.guaranteeText}.\n`,
      `<b>2. ${escapeHtml(COURSES["ai-asoslari"].title)}</b>`,
      "• Biznes va ishlarni AI yordamida tezlashtirish, prompt va Claude sirlari.",
      coursePriceLine("ai-asoslari"),
      "\nBatafsil ma'lumot, dastur va joy band qilish uchun havolani bosing:",
    ].join("\n");

    return ctx.reply(text, {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🌐 Saytda Ko'rish va Ro'yxatdan O'tish", siteUrl())],
        [Markup.button.url("📚 Barcha kurslar", siteUrl("/kurs"))],
      ]),
    });
  });

  bot.hears(MAIN_MENU.diagnostic, async (ctx) => ctx.reply(
    `🎯 <b>Qaysi kurs sizga eng ko'p foyda keltiradi?</b>\n\n2 daqiqalik ${QUIZ_QUESTIONS.length} ta savoldan iborat bepul test orqali o'z darajangiz va maqsadingizga mos individual yo'nalishni aniqlang:`,
    {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("🚀 Diagnostikadan O'tish", siteUrl("/diagnostika"))],
      ]),
    }
  ));

  bot.hears(MAIN_MENU.freeLesson, async (ctx) => ctx.reply(
    "🎁 <b>BEPUL AMALIY DARS:</b>\n\n\"AI yordamida dasturchilarsiz birinchi veb-saytni 15 daqiqada qurish\"\n\nHoziroq tomosha qiling va metodni amalda ko'ring:",
    {
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("▶️ Bepul Darsni Ochish", siteUrl("/bepul-dars"))],
      ]),
    }
  ));
}
