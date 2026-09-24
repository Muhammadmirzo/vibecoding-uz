import { type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { ok, fail } from "@/lib/api/v1/respond";
import { getClientIp } from "@/lib/security/rateLimit";
import { markReadSchema } from "@/features/chat/contracts";
import { markConversationRead } from "@/features/chat/server/chat.service";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return fail(auth.response);
  const parsed = markReadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error);
  try {
    await markConversationRead(parsed.data.conversationId, "admin", auth.session.userId, getClientIp(request));
    return ok({ read: true });
  } catch (error) {
    return fail(error);
  }
}
