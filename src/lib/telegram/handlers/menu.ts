import { Markup } from "telegraf";

/**
 * Single source of truth for the bot's reply keyboard.
 * Every label here must have a `bot.hears(...)` handler in `commands.ts` /
 * `contact.ts` — a label without a handler is a dead button (see the
 * `#kalkulyator` incident: the menu offered a calculator the site never had).
 */
export const MAIN_MENU = {
  courses: "📚 Kurslar va Narxlar",
  diagnostic: "🎯 Bepul Diagnostika",
  freeLesson: "🎁 Bepul Dars",
  sharePhone: "📱 Hisobni Ulash (Telefon)",
  operator: "🆘 Mentor / Operator",
  backToMenu: "🔙 Asosiy Menyu",
} as const;

export const mainKeyboard = Markup.keyboard([
  [MAIN_MENU.courses, MAIN_MENU.diagnostic],
  [MAIN_MENU.freeLesson, MAIN_MENU.sharePhone],
  [MAIN_MENU.operator],
]).resize();
