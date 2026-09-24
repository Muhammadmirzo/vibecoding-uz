import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Update } from "telegraf/types";
import { getTelegramBot } from "@/lib/telegram/bot";
import { verifyWebhookSecret } from "@/lib/security/headers";
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  PRESETS,
} from "@/lib/security/rateLimit";

// Telegram Bot API updates vary by type; accept any object-shaped update and
// let Telegraf dispatch it. The point is to reject non-objects/arrays early.
const telegramUpdateSchema = z.record(z.string(), z.unknown());

function isWebhookAuthorized(req: NextRequest): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  // Fail closed: without a configured secret the webhook stays disabled.
  if (!expected) return false;
  const provided = req.headers.get("x-telegram-bot-api-secret-token");
  return verifyWebhookSecret(provided, expected);
}

export async function POST(req: NextRequest) {
  if (!isWebhookAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(req);
  const rl = await checkRateLimit(ip, PRESETS.WEBHOOK);
  if (!rl.success) return createRateLimitResponse(rl);

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

    const raw: unknown = await req.json().catch(() => null);
    const parsed = telegramUpdateSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Noto'g'ri yangilanish formati" }, { status: 400 });
    }
    await bot.handleUpdate(parsed.data as unknown as Update);

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
  // Minimal liveness response — never leak configuration status.
  return NextResponse.json({ ok: true });
}
