import { z } from "zod";
import { type NextRequest } from "next/server";
import { trackServerEvent } from "@/features/analytics/server/track";
import { chatOpenSchema } from "@/features/chat/contracts";
import { fail, ok } from "@/lib/api/v1/respond";
import { v1Public } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "post",
  path: "/api/v1/chat/open",
  tags: ["chat"],
  summary: "Chat oynasi ochildi (analitika)",
  request: { body: { content: { "application/json": { schema: chatOpenSchema } } } },
  responses: { 200: { description: "OK", content: { "application/json": { schema: z.object({ tracked: z.literal(true) }) } } } },
});

export async function POST(request: NextRequest) {
  return v1Public(request, async () => {
    const parsed = chatOpenSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return fail(parsed.error);
    void trackServerEvent({ type: "chat_open", path: parsed.data.sourcePath, props: { widget: "launcher" } });
    return ok({ tracked: true });
  });
}
