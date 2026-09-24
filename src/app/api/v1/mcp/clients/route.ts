import { NextResponse } from "next/server";
import { registerV1Route } from "@/lib/api/v1/registry";
import { requireAdmin } from "@/lib/auth/require-auth";
import { fail, ok } from "@/lib/api/v1/respond";
import { listConnectedClients } from "@/features/mcp/server/auth.service";

export const runtime = "nodejs";
registerV1Route({ method: "get", path: "/api/v1/mcp/clients", security: [{ cookieAuth: [] }], tags: ["mcp"], summary: "Ulangan OAuth mijozlari", responses: { 200: { description: "Mijozlar ro'yxati" } } });
export async function GET(request: Request): Promise<NextResponse> { const gate = await requireAdmin(request); if (!gate.ok) return fail(gate.response); return ok(await listConnectedClients()); }
