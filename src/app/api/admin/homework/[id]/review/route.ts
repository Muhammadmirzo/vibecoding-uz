import { requireMentor } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { adminIdParamSchema } from "@/lib/validations";
import { reviewHomeworkBodySchema } from "@/features/crm/domain/homework-policy";
import { drizzleHomeworkRepository } from "@/features/crm/server/homework.repository";
import { reviewSubmission } from "@/features/crm/server/homework.service";

const repo = drizzleHomeworkRepository;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Authoritative gate: mentor/admin session only. body.mentorId is ignored.
    const auth = await requireMentor(request);
    if (!auth.ok) return auth.response;
    const { id } = adminIdParamSchema.parse(await params);
    const body = reviewHomeworkBodySchema.parse(await request.json());
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { submission, review } = await reviewSubmission(repo, {
      submissionId: id,
      reviewerId: auth.session.userId,
      reviewerRole: auth.session.role,
      criteriaResults: body.criteriaResults,
      score: body.score,
      feedbackMd: body.feedbackMd,
      status: body.status,
      ip,
    });
    return okResponse({ success: true, submission, review });
  } catch (error) {
    return errorResponse(error);
  }
}
