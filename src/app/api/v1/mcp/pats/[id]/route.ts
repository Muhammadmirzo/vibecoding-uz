import { NextResponse } from "next/server";
import { z } from "zod";
import { registerV1Route } from "@/lib/api/v1/registry";
import { requireAdmin } from "@/lib/auth/require-auth";
import { fail, ok } from "@/lib/api/v1/respond";
import { revokeCredential } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";
registerV1Route({ method: "delete", path: "/api/v1/mcp/pats/{id}", security: [{ cookieAuth: [] }], tags: ["mcp"], summary: "MCP personal tokenni bekor qilish", responses: { 200: { description: "Token bekor qilindi" } } });
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const gate = await requireAdmin(request);
  if (!gate.ok) return fail(gate.response);
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) return fail(new Response(JSON.stringify({ error: "validation_error", message: "Token ID yaroqsiz" }), { status: 400 }));
  try { await revokeCredential(gate.session.userId, id); } catch (error) { return fail(error); }
  return ok({ revoked: true });
}
