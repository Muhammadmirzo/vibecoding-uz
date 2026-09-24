import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { adminIdParamSchema, updateLeadSchema } from "@/lib/validations";
import { drizzleLeadsRepository } from "@/features/crm/server/leads.repository";
import { deleteLead, updateLead } from "@/features/crm/server/leads.service";

const repo = drizzleLeadsRepository;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { id } = adminIdParamSchema.parse(await params);
    const body = updateLeadSchema.parse(await request.json());
    const lead = await updateLead(repo, id, body);
    return okResponse({ success: true, lead });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { id } = adminIdParamSchema.parse(await params);
    await deleteLead(repo, id);
    return okResponse({ success: true, message: "Lead muvaffaqiyatli o'chirildi" });
  } catch (error) {
    return errorResponse(error);
  }
}
