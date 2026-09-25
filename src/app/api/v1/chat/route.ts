import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/v1/respond";
import { v1Public } from "@/lib/api/v1/with-v1";
import { getVisitorConversation } from "@/features/chat/server/chat.service";
import { getChatSettings, publicChatSettings } from "@/features/chat/server/settings.service";
import { readVisitorToken, visitorTokenFromRequest } from "@/features/chat/server/visitor-token";
import { chatConversationSchema, publicChatSettingsSchema } from "@/features/chat/contracts";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "get",
  path: "/api/v1/chat",
  tags: ["chat"],
  summary: "Tashrifchining joriy suhbati (visitor cookie)",
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: z.object({ conversation: chatConversationSchema.nullable(), settings: publicChatSettingsSchema }) } },
    },
  },
});

export async function GET(request: NextRequest) {
  return v1Public(request, async () => {
    const settings = await getChatSettings();
    const token = visitorTokenFromRequest(request) || (await readVisitorToken());
    const conversation = token ? await getVisitorConversation(token) : null;
    return ok({ conversation, settings: publicChatSettings(settings) });
  });
}
