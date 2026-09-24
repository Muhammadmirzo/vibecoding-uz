import { NextResponse } from "next/server";
import { registerV1Route } from "@/lib/api/v1/registry";
import { requireAdmin } from "@/lib/auth/require-auth";
import { fail, ok } from "@/lib/api/v1/respond";
import { revokeCredential } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";
registerV1Route({ method: "delete", path: "/api/v1/mcp/pats/{id}", security: [{ cookieAuth: [] }], tags: ["mcp"], summary: "MCP personal tokenni bekor qilish", responses: { 200: { description: "Token bekor qilindi" } } });
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }): Promise<NextResponse> { const gate = await requireAdmin(request); if (!gate.ok) return fail(gate.response); const { id } = await context.params; await revokeCredential(gate.session.userId, id); return ok({ revoked: true }); }
