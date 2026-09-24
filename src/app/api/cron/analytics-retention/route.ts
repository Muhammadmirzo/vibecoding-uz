import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/security/cron";
import { errorResponse } from "@/lib/http/errors";
import { analyticsRetentionRepository } from "@/features/analytics/server/retention.repository";

export async function GET(request: Request) {
  try {
    if (!isCronAuthorized(request)) return NextResponse.json({ error: "Ruxsat berilmagan" }, { status: 401 });
    const cutoff = new Date(Date.now() - 400 * 86_400_000);
    const deleted = await analyticsRetentionRepository.deleteBefore(cutoff);
    return NextResponse.json({ success: true, deletedBefore: cutoff.toISOString(), deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
