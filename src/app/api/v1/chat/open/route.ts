import { type NextRequest } from "next/server";
import { trackServerEvent } from "@/features/analytics/server/track";
import { chatOpenSchema } from "@/features/chat/contracts";
import { ok, fail } from "@/lib/api/v1/respond";

export async function POST(request: NextRequest) {
  const parsed = chatOpenSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return fail(parsed.error);
  void trackServerEvent({ type: "chat_open", path: parsed.data.sourcePath });
  return ok({ tracked: true });
}
