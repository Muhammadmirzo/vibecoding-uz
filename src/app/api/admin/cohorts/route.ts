import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { createCohortSchema } from "@/lib/validations";
import { drizzleCohortsRepository } from "@/features/crm/server/cohorts.repository";
import { createCohort, listCohorts } from "@/features/crm/server/cohorts.service";

const repo = drizzleCohortsRepository;

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const cohorts = await listCohorts(repo);
    return okResponse({ success: true, cohorts });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const body = createCohortSchema.parse(await request.json());
    const cohort = await createCohort(repo, body);
    return NextResponse.json({ success: true, cohort }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
