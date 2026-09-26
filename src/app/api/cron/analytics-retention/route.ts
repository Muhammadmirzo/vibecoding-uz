import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/security/cron";
import { errorResponse } from "@/lib/http/errors";
import { analyticsRetentionRepository } from "@/features/analytics/server/retention.repository";
import { pruneTelegramUpdates } from "@/lib/telegram/updateDedupe";

export async function GET(request: Request) {
  try {
    if (!isCronAuthorized(request)) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
    const cutoff = new Date(Date.now() - 400 * 86_400_000);
    const deleted = await analyticsRetentionRepository.deleteBefore(cutoff);
    // Webhook dedupe ids (0014) are only needed while Telegram may still retry.
    const telegramUpdatesDeleted = await pruneTelegramUpdates().catch(() => 0);
    return NextResponse.json({ success: true, deletedBefore: cutoff.toISOString(), deleted, telegramUpdatesDeleted });
  } catch (error) {
    return errorResponse(error);
  }
}
