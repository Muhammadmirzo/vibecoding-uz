import { z } from "zod";
import { type NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/v1/respond";
import { v1Admin } from "@/lib/api/v1/with-v1";
import { getClientIp } from "@/lib/security/rateLimit";
import { adminConversationsQuerySchema, adminThreadSchema, chatConversationSchema, conversationPatchSchema } from "@/features/chat/contracts";
import { getThread, listConversations, updateConversation } from "@/features/chat/server/chat.service";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "get",
  path: "/api/v1/admin/chat/conversations",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["admin-chat"],
  summary: "Suhbatlar ro'yxati (filtr, holat) yoki bitta suhbat tafsiloti (?id=)",
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: z.union([adminThreadSchema, z.object({ conversations: z.array(chatConversationSchema) })]) } },
    },
    403: { description: "Faqat admin" },
  },
});
registerV1Route({
  method: "patch",
  path: "/api/v1/admin/chat/conversations",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["admin-chat"],
  summary: "Suhbat holati / tayinlash / AI rejimi",
  request: { body: { content: { "application/json": { schema: conversationPatchSchema } } } },
  responses: {
    200: { description: "OK", content: { "application/json": { schema: z.object({ conversation: chatConversationSchema }) } } },
    403: { description: "Faqat admin" },
  },
});

export async function GET(request: NextRequest) {
  return v1Admin(request, async ({ session }) => {
    const parsed = adminConversationsQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) return fail(parsed.error);
    if (parsed.data.id) return ok(await getThread(parsed.data.id));
    return ok({ conversations: await listConversations(session.userId, parsed.data.status, parsed.data.q) });
  });
}

export async function PATCH(request: NextRequest) {
  return v1Admin(request, async ({ session }) => {
    const parsed = conversationPatchSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return fail(parsed.error);
    return ok({ conversation: await updateConversation(session.userId, parsed.data, getClientIp(request)) });
  });
}
