import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-auth";
import { postReply } from "@/features/chat/server/chat.service";
import { ok, fail } from "@/lib/api/v1/respond";
const schema = z.object({ conversationId: z.string().uuid(), body: z.string().trim().min(1).max(2000), clientId: z.string().uuid().optional() });
export async function POST(request: NextRequest) { const auth = await requireAdmin(request); if (!auth.ok) return fail(auth.response); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return fail(Response.json({ error: "validation_error", message: "Javob matni noto'g'ri" }, { status: 400 })); try { return ok({ message: await postReply(auth.session.userId, parsed.data.conversationId, parsed.data.body, parsed.data.clientId) }); } catch (error) { return fail(error); } }
