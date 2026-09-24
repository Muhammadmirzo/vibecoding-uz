import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { homeworkAdminQuerySchema } from "@/lib/validations";
import { drizzleHomeworkRepository } from "@/features/crm/server/homework.repository";
import { listSubmissions } from "@/features/crm/server/homework.service";

const repo = drizzleHomeworkRepository;

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const query = homeworkAdminQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const result = await listSubmissions(repo, query);
    return okResponse({
      success: true,
      submissions: result.submissions,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
