import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { adminIdParamSchema, updateCohortSchema } from "@/lib/validations";
import { drizzleCohortsRepository } from "@/features/crm/server/cohorts.repository";
import { deleteCohort, updateCohort } from "@/features/crm/server/cohorts.service";

const repo = drizzleCohortsRepository;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { id } = adminIdParamSchema.parse(await params);
    const body = updateCohortSchema.parse(await request.json());
    const cohort = await updateCohort(repo, id, body);
    return okResponse({ success: true, cohort });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { id } = adminIdParamSchema.parse(await params);
    await deleteCohort(repo, id);
    return okResponse({ success: true, message: "Guruh o'chirildi" });
  } catch (error) {
    return errorResponse(error);
  }
}
