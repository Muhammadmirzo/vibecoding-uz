import { NextResponse } from "next/server";
import { z } from "zod";
import { registerV1Route } from "@/lib/api/v1/registry";
import { requireAdmin } from "@/lib/auth/require-auth";
import { fail, ok } from "@/lib/api/v1/respond";
import { updateManagerMcpAccess } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";

const bodySchema = z.object({
  mcpAccess: z.boolean(),
});

registerV1Route({ method: "patch", path: "/api/v1/admin/mcp/managers/{id}", security: [{ cookieAuth: [] }], tags: ["admin"], summary: "Menejer uchun MCP ruxsatini o'zgartirish", request: { body: { content: { "application/json": { schema: bodySchema } } } }, responses: { 200: { description: "Ruxsat o'zgartirildi" } } });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const gate = await requireAdmin(request);
  if (!gate.ok) return fail(gate.response);
  if (gate.session.role === "manager") return fail(new Response(JSON.stringify({ error: "forbidden", message: "Faqat adminlar uchun ruxsat etilgan" }), { status: 403 }));
  
  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) return fail(new Response(JSON.stringify({ error: "validation_error", message: "ID yaroqsiz" }), { status: 400 }));
  
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(new Response(JSON.stringify({ error: "validation_error", message: "Ma'lumotlar yaroqsiz" }), { status: 400 }));
  
  try {
    await updateManagerMcpAccess(gate.session.userId, id, parsed.data.mcpAccess);
    return ok({ updated: true });
  } catch (error) {
    return fail(error);
  }
}
