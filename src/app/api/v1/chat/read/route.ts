import { type NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/v1/respond";
import { markConversationRead } from "@/features/chat/server/chat.service";
import { getOrCreateVisitorToken, visitorTokenFromRequest } from "@/features/chat/server/visitor-token";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({ method: "post", path: "/api/v1/chat/read", tags: ["chat"], summary: "Tashrifchi xabarlarni o'qilgan deb belgilaydi", responses: { 200: { description: "OK" } } });

export async function POST(request: NextRequest) {
  try {
    const token = visitorTokenFromRequest(request) || (await getOrCreateVisitorToken()).token;
    await markConversationRead(token, "visitor");
    return ok({ read: true });
  } catch (error) {
    return fail(error);
  }
}
