import { type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { ok, fail } from "@/lib/api/v1/respond";
import { getClientIp } from "@/lib/security/rateLimit";
import { adminConversationsQuerySchema, conversationPatchSchema } from "@/features/chat/contracts";
import { getThread, listConversations, updateConversation } from "@/features/chat/server/chat.service";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return fail(auth.response);
  const parsed = adminConversationsQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return fail(parsed.error);
  try {
    if (parsed.data.id) return ok(await getThread(parsed.data.id));
    return ok({ conversations: await listConversations(auth.session.userId, parsed.data.status, parsed.data.q) });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return fail(auth.response);
  const parsed = conversationPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error);
  try {
    return ok({ conversation: await updateConversation(auth.session.userId, parsed.data, getClientIp(request)) });
  } catch (error) {
    return fail(error);
  }
}
