import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/v1/respond";
import { getVisitorConversation } from "@/features/chat/server/chat.service";
import { getChatSettings } from "@/features/chat/server/settings.service";
import { getOrCreateVisitorToken, visitorTokenFromRequest } from "@/features/chat/server/visitor-token";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({ method: "get", path: "/api/v1/chat", tags: ["chat"], summary: "Tashrifchining joriy suhbati (visitor cookie)", responses: { 200: { description: "OK" } } });

export async function GET(request: NextRequest) {
  try {
    const settings = await getChatSettings();
    const token = visitorTokenFromRequest(request) || (await getOrCreateVisitorToken()).token;
    const conversation = await getVisitorConversation(token);
    return ok({ conversation, settings });
  } catch (error) {
    return fail(error);
  }
}
