import { z } from "zod";
import { type NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/v1/respond";
import { v1Admin } from "@/lib/api/v1/with-v1";
import { getClientIp } from "@/lib/security/rateLimit";
import { markReadSchema } from "@/features/chat/contracts";
import { markConversationRead } from "@/features/chat/server/chat.service";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "post",
  path: "/api/v1/admin/chat/read",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["admin-chat"],
  summary: "Admin suhbatni o'qilgan deb belgilaydi",
  request: { body: { content: { "application/json": { schema: markReadSchema } } } },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: z.object({ read: z.literal(true) }) } } },
    403: { description: "Faqat admin" },
  },
});

export async function POST(request: NextRequest) {
  return v1Admin(request, async ({ session }) => {
    const parsed = markReadSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error);
    await markConversationRead(parsed.data.conversationId, "admin", session.userId, getClientIp(request));
    return ok({ read: true });
  });
}
