import { NextRequest, NextResponse } from "next/server";
import { adminStudentActivityQuerySchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse } from "@/lib/http/errors";
import { drizzleActivityRepository } from "@/features/crm/server/activity.repository";
import { getStudentActivity } from "@/features/crm/server/activity.service";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { searchParams } = new URL(request.url);
    const query = adminStudentActivityQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
      cohortId: searchParams.get("cohortId") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    return NextResponse.json(await getStudentActivity(drizzleActivityRepository, query));
  } catch (error) {
    return errorResponse(error);
  }
}
