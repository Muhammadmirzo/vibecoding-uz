import { type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { ok, fail } from "@/lib/api/v1/respond";
import { getClientIp } from "@/lib/security/rateLimit";
import { adminReplySchema } from "@/features/chat/contracts";
import { postReply } from "@/features/chat/server/chat.service";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({ method: "post", path: "/api/v1/admin/chat/messages", security: [{ bearerAuth: [], cookieAuth: [] }], tags: ["admin-chat"], summary: "Admin javobi", request: { body: { content: { "application/json": { schema: adminReplySchema } } } }, responses: { 200: { description: "OK" } } });

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return fail(auth.response);
  const parsed = adminReplySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(parsed.error);
  try {
    const message = await postReply(
      auth.session.userId,
      parsed.data.conversationId,
      parsed.data.body,
      parsed.data.clientId,
      getClientIp(request),
    );
    return ok({ message });
  } catch (error) {
    return fail(error);
  }
}
