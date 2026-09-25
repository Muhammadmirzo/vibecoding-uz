import { z } from "zod";
import { type NextRequest } from "next/server";
import { ok } from "@/lib/api/v1/respond";
import { v1Public } from "@/lib/api/v1/with-v1";
import { markConversationRead } from "@/features/chat/server/chat.service";
import { getOrCreateVisitorToken, visitorTokenFromRequest } from "@/features/chat/server/visitor-token";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "post",
  path: "/api/v1/chat/read",
  tags: ["chat"],
  summary: "Tashrifchi xabarlarni o'qilgan deb belgilaydi",
  responses: { 200: { description: "OK", content: { "application/json": { schema: z.object({ read: z.literal(true) }) } } } },
});

export async function POST(request: NextRequest) {
  return v1Public(request, async () => {
    const token = visitorTokenFromRequest(request) || (await getOrCreateVisitorToken()).token;
    await markConversationRead(token, "visitor");
    return ok({ read: true });
  });
}
