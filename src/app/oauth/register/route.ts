import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/api/v1/respond";
import { registerClientSchema } from "@/features/mcp/contracts";
import { registerOAuthClient } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = registerClientSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(new Response(JSON.stringify({ error: "validation_error", message: "Mijoz ro'yxatga olish ma'lumotlari yaroqsiz" }), { status: 400 }));
  const client = await registerOAuthClient({ clientName: parsed.data.client_name, redirectUris: parsed.data.redirect_uris, scope: parsed.data.scope });
  return ok(client, undefined, { status: 201 });
}
