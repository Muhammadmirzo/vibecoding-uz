import { type NextRequest } from "next/server";
import { fail, ok } from "@/lib/api/v1/respond";
import { markConversationRead } from "@/features/chat/server/chat.service";
import { getOrCreateVisitorToken, visitorTokenFromRequest } from "@/features/chat/server/visitor-token";

export async function POST(request: NextRequest) {
  try {
    const token = visitorTokenFromRequest(request) || (await getOrCreateVisitorToken()).token;
    await markConversationRead(token, "visitor");
    return ok({ read: true });
  } catch (error) {
    return fail(error);
  }
}
