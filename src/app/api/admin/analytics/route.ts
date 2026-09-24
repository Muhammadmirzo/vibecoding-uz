import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse } from "@/lib/http/errors";
import { adminAnalyticsQuerySchema } from "@/lib/validations/admin";
import { drizzleAnalyticsRepository } from "@/features/crm/server/analytics.repository";
import { getAnalyticsSummary } from "@/features/crm/server/analytics.service";

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { searchParams } = new URL(request.url);
    const query = adminAnalyticsQuerySchema.parse({ period: searchParams.get("period") ?? undefined });
    return NextResponse.json(await getAnalyticsSummary(drizzleAnalyticsRepository, query.period));
  } catch (error) {
    return errorResponse(error);
  }
}
