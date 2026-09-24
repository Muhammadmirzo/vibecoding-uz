import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { listConversations, getThread } from "@/features/chat/server/chat.service";
import { ok, fail } from "@/lib/api/v1/respond";

export async function GET(request: NextRequest) { const auth = await requireAdmin(); if (!auth.ok) return fail(auth.response); try { const id = request.nextUrl.searchParams.get("id"); if (id) return ok(await getThread(id)); return ok({ conversations: await listConversations(request.nextUrl.searchParams.get("status") || "open", request.nextUrl.searchParams.get("q") || "") }); } catch (error) { return fail(error); } }
