import { Markup, Telegraf } from "telegraf";
import { BRAND } from "@/config/brand";
import { beginTelegramLogin } from "@/features/auth/server/telegram-login.service";
import { formatTelegramDevice, formatTelegramRequestTime } from "../user-agent";
import { ServiceError } from "@/lib/http/errors";
import { linkTelegramAccount } from "../linkAccount";
import { mainKeyboard } from "./menu";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export function loginConfirmationText(request: { createdAt: Date; userAgent?: string | null }): string {
  return `🔐 ${BRAND.name} saytiga kirish so'rovi\n🕒 ${formatTelegramRequestTime(request.createdAt)}\n💻 ${formatTelegramDevice(request.userAgent)}\n\nAgar hozir saytda o'zingiz «Telegram orqali davom etish» tugmasini bosgan bo'lsangiz — tasdiqlang. Aks holda bu so'rovni rad eting va havolani hech kimga yubormang.`;
}

export function loginConfirmationKeyboard(requestId: string) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✅ Ha, bu men", `tgl:y:${requestId}`), Markup.button.callback("❌ Men emas", `tgl:n:${requestId}`)],
  ]).reply_markup;
}

const siteKeyboard = {
  reply_markup: {
    ...Markup.removeKeyboard().reply_markup,
    ...Markup.inlineKeyboard([[Markup.button.url("Saytga qaytish", BRAND.url)]]).reply_markup,
  },
};

export function registerStartHandler(bot: Telegraf) {
  bot.command("start", async (ctx) => {
    const payload = ctx.payload;
    const tgUserId = ctx.from.id.toString();

    if (payload && /^login_[A-Za-z0-9_-]{22,58}$/.test(payload)) {
      const token = payload.slice("login_".length);
      try {
        const result = await beginTelegramLogin(token, tgUserId);
        if (result.outcome === "confirmation") {
          return ctx.reply(loginConfirmationText(result), { reply_markup: loginConfirmationKeyboard(result.requestId) });
        }
        return ctx.reply(
          `${BRAND.name} saytida kirish uchun avval o'zingizning telefon raqamingizni ulashing.`,
          Markup.keyboard([[Markup.button.contactRequest("📱 Raqamni ulashish")]]).resize(),
        );
      } catch (error) {
        if (error instanceof ServiceError && ["INVALID_TOKEN", "VALIDATION"].includes(error.code)) {
          return ctx.reply("Bu kirish havolasi eskirgan yoki allaqachon ishlatilgan. Iltimos, saytdagi Telegram tugmasini qayta bosing.");
        }
        return ctx.reply("Texnik xatolik yuz berdi. Birozdan keyin saytdagi Telegram tugmasi orqali qayta urinib ko'ring.");
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
          `🎉 Xush kelibsiz, <b>${escapeHtml(result.user.fullName)}</b>!\n\nHisobingiz ${BRAND.name} platformasiga muvaffaqiyatli ulandi.\nBarcha dars yangiliklari va uyga vazifa baholari shu bot orqali boradi.`,
          {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([[Markup.button.url("Shaxsiy kabinet", `${BRAND.url}/kabinet`)]]),
          },
        );
      }
    }

    const welcomeText = [
      `🚀 <b>${BRAND.name} — ${BRAND.descriptor}</b>\n`,
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
