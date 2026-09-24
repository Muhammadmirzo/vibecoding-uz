import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { auditLogsQuerySchema } from "@/lib/validations";
import { drizzleAdminRepository } from "@/features/crm/server/admin.repository";
import { listAuditLogs } from "@/features/crm/server/admin.service";

const repo = drizzleAdminRepository;

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const query = auditLogsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const logs = await listAuditLogs(repo, query);
    return okResponse({ success: true, logs });
  } catch (error) {
    return errorResponse(error);
  }
}
