import { z } from "zod";
import { type NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/v1/respond";
import { v1Admin } from "@/lib/api/v1/with-v1";
import { getClientIp } from "@/lib/security/rateLimit";
import { chatMessageSchema, draftApprovalSchema } from "@/features/chat/contracts";
import { approveDraft } from "@/features/chat/server/chat.service";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "post",
  path: "/api/v1/admin/chat/drafts",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["admin-chat"],
  summary: "AI qoralamasini tasdiqlash yoki rad etish",
  request: { body: { content: { "application/json": { schema: draftApprovalSchema } } } },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: z.object({ message: chatMessageSchema }) } } },
    403: { description: "Faqat admin" },
  },
});

export async function POST(request: NextRequest) {
  return v1Admin(request, async ({ session }) => {
    const parsed = draftApprovalSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error);
    return ok({ message: await approveDraft(session.userId, parsed.data.conversationId, parsed.data.draftId, getClientIp(request)) });
  });
}
