import { Markup, Telegraf } from "telegraf";
import { BRAND } from "@/config/brand";
import { handleTelegramLoginCallback } from "@/features/auth/server/telegram-login.service";
import { telegramLoginCallbackSchema } from "@/lib/validations/auth";

export function registerTelegramLoginCallback(bot: Telegraf): void {
  bot.on("callback_query", async (ctx, next) => {
    const callback = ctx.callbackQuery;
    const rawData = typeof callback === "object" && callback !== null && "data" in callback && typeof callback.data === "string"
      ? callback.data
      : undefined;
    const match = /^tgl:([yn]):([0-9a-f-]{36})$/.exec(rawData ?? "");
    // Not a login confirmation — leave it for other callback handlers.
    if (!rawData?.startsWith("tgl:")) return next();
    const parsed = match ? telegramLoginCallbackSchema.safeParse({
      action: match[1],
      requestId: match[2],
      tgUserId: ctx.from.id.toString(),
    }) : null;

    if (!parsed?.success) {
      await ctx.answerCbQuery("Bu so'rovni tasdiqlash mumkin emas.");
      return;
    }

    let outcome: Awaited<ReturnType<typeof handleTelegramLoginCallback>>;
    try {
      outcome = await handleTelegramLoginCallback(parsed.data);
    } catch {
      await ctx.answerCbQuery("Texnik xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
      return;
    }
    if (outcome === "approved") {
      await ctx.answerCbQuery("Tasdiqlandi.");
      await ctx.editMessageText("✅ Tasdiqlandi. Saytga qayting.", {
        reply_markup: Markup.inlineKeyboard([[Markup.button.url("Saytga qaytish", BRAND.url)]]).reply_markup,
      });
      return;
    }
    if (outcome === "rejected") {
      await ctx.answerCbQuery("So'rov rad etildi.");
      await ctx.editMessageText("Rad etildi. Hisobingiz xavfsiz.");
      return;
    }
    await ctx.answerCbQuery("Bu so'rov eskirgan, allaqachon ishlatilgan yoki boshqa Telegram akkauntidan.");
  });
}
