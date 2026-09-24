import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { adminIdParamSchema, updateUserRoleSchema } from "@/lib/validations";
import { drizzleUsersRepository } from "@/features/crm/server/users.repository";
import { changeUserRole } from "@/features/crm/server/users.service";

const repo = drizzleUsersRepository;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const { id } = adminIdParamSchema.parse(await params);
    const body = updateUserRoleSchema.parse(await request.json());
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const user = await changeUserRole(repo, id, body, { ip });
    return okResponse({ success: true, user });
  } catch (error) {
    return errorResponse(error);
  }
}
