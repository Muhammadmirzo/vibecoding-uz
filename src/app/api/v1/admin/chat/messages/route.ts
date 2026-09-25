import { z } from "zod";
import { type NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/v1/respond";
import { v1Admin } from "@/lib/api/v1/with-v1";
import { getClientIp } from "@/lib/security/rateLimit";
import { adminReplySchema, chatMessageSchema } from "@/features/chat/contracts";
import { postReply } from "@/features/chat/server/chat.service";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "post",
  path: "/api/v1/admin/chat/messages",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["admin-chat"],
  summary: "Admin javobi",
  request: { body: { content: { "application/json": { schema: adminReplySchema } } } },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: z.object({ message: chatMessageSchema }) } } },
    403: { description: "Faqat admin" },
  },
});

export async function POST(request: NextRequest) {
  return v1Admin(request, async ({ session }) => {
    const parsed = adminReplySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error);
    const message = await postReply(
      session.userId,
      parsed.data.conversationId,
      parsed.data.body,
      parsed.data.clientId,
      getClientIp(request),
    );
    return ok({ message });
  });
}
