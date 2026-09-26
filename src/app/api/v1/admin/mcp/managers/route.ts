import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { fail, ok } from "@/lib/api/v1/respond";
import { registerV1Route } from "@/lib/api/v1/registry";
import { listManagers } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";
registerV1Route({ method: "get", path: "/api/v1/admin/mcp/managers", security: [{ cookieAuth: [] }], tags: ["admin"], summary: "MCP ruxsatiga ega menejerlar ro'yxati", responses: { 200: { description: "Menejerlar ro'yxati" } } });

export async function GET(request: Request): Promise<NextResponse> {
  const gate = await requireAdmin(request);
  if (!gate.ok) return fail(gate.response);
  if (gate.session.role === "manager") return fail(new Response(JSON.stringify({ error: "forbidden", message: "Faqat adminlar uchun ruxsat etilgan" }), { status: 403 }));
  try {
    return ok(await listManagers());
  } catch (error) {
    return fail(error);
  }
}
