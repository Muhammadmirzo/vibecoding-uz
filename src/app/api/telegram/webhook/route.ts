import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleTelegramWebhook } from "@/lib/telegram/webhookHandler";
import { drizzleTelegramUpdateStore } from "@/lib/telegram/updateDedupe";

export async function POST(req: NextRequest) {
  return handleTelegramWebhook(req, drizzleTelegramUpdateStore);
}

export async function GET() {
  // Minimal liveness response — never leak configuration status.
  return NextResponse.json({ ok: true });
}
