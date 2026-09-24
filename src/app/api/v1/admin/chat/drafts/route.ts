import { type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { ok, fail } from "@/lib/api/v1/respond";
import { getClientIp } from "@/lib/security/rateLimit";
import { draftApprovalSchema } from "@/features/chat/contracts";
import { approveDraft } from "@/features/chat/server/chat.service";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return fail(auth.response);
  const parsed = draftApprovalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error);
  try {
    return ok({ message: await approveDraft(auth.session.userId, parsed.data.conversationId, parsed.data.draftId, getClientIp(request)) });
  } catch (error) {
    return fail(error);
  }
}
