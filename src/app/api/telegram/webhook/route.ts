import { NextRequest, NextResponse } from "next/server";
import { getTelegramBot } from "@/lib/telegram/bot";

export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "TELEGRAM_BOT_TOKEN kiritilmagan" },
      { status: 500 }
    );
  }

  try {
    const bot = getTelegramBot();
    if (!bot) {
      return NextResponse.json(
        { error: "Telegram botni initsializatsiya qilib bo'lmadi" },
        { status: 500 }
      );
    }

    const body = await req.json();
    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook yangilanishini qayta ishlashda xatolik" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const isConfigured = Boolean(token && token.length > 10);

  return NextResponse.json({
    service: "Vibecoding Telegram Bot Webhook",
    status: isConfigured ? "configured" : "token_missing",
    message: isConfigured
      ? "Telegram Bot API kaliti mavjud va faol."
      : "Iltimos, Vercel yoki .env faylida TELEGRAM_BOT_TOKEN ni o'rnating.",
  });
}
