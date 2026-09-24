import { NextRequest } from "next/server";
import { getOrCreateVisitorToken, visitorTokenFromRequest } from "@/features/chat/server/visitor-token";
import { getVisitorConversation } from "@/features/chat/server/chat.service";
import { getChatSettings } from "@/features/chat/server/settings.service";
import { ok, fail } from "@/lib/api/v1/respond";

export async function GET(request: NextRequest) { try { const token = visitorTokenFromRequest(request) || (await getOrCreateVisitorToken()).token; return ok({ conversation: await getVisitorConversation(token), settings: await getChatSettings() }); } catch (error) { return fail(error); } }
