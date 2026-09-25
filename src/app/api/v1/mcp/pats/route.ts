import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { fail, ok, created } from "@/lib/api/v1/respond";
import { registerV1Route } from "@/lib/api/v1/registry";
import { createPatSchema } from "@/features/mcp/contracts";
import { createPat, listPats } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";
registerV1Route({ method: "get", path: "/api/v1/mcp/pats", security: [{ cookieAuth: [] }], tags: ["mcp"], summary: "MCP personal tokenlari", responses: { 200: { description: "Tokenlar ro'yxati" } } });
registerV1Route({ method: "post", path: "/api/v1/mcp/pats", security: [{ cookieAuth: [] }], tags: ["mcp"], summary: "MCP personal token yaratish", request: { body: { content: { "application/json": { schema: createPatSchema } } } }, responses: { 201: { description: "Token yaratildi" } } });
export async function GET(request: Request): Promise<NextResponse> { const gate = await requireAdmin(request); if (!gate.ok) return fail(gate.response); try { return ok(await listPats(gate.session.userId)); } catch (error) { return fail(error); } }
export async function POST(request: Request): Promise<NextResponse> { const gate = await requireAdmin(request); if (!gate.ok) return fail(gate.response); const parsed = createPatSchema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return fail(new Response(JSON.stringify({ error: "validation_error", message: "PAT ma\'lumotlari yaroqsiz" }), { status: 400 })); try { return created(await createPat(parsed.data, gate.session.userId)); } catch (error) { return fail(error); } }
