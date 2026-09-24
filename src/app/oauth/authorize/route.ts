import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { authorizeQuerySchema, consentSchema } from "@/features/mcp/contracts";
import { getOAuthClient, issueAuthorizationCode } from "@/features/mcp/server/oauth.service";
import { siteConfig } from "@/lib/siteConfig";
import { consentPage } from "@/features/mcp/ui/consent-page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET(request: Request): Promise<NextResponse> {
  const gate = await requireAdmin(request);
  const url = new URL(request.url);
  if (!gate.ok) return NextResponse.redirect(new URL(`/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`, url.origin));
  const query = Object.fromEntries(url.searchParams.entries());
  const parsed = authorizeQuerySchema.safeParse(query);
  if (!parsed.success) return new NextResponse("OAuth so'rovi yaroqsiz", { status: 400 });
  const client = await getOAuthClient(parsed.data.client_id);
  if (parsed.data.resource !== `${siteConfig.siteUrl}/api/mcp`) return new NextResponse("Resource mos emas", { status: 400 });
  if (!client.redirectUris.includes(parsed.data.redirect_uri)) return new NextResponse("Redirect URI ruxsat etilmagan", { status: 400 });
  return new NextResponse(consentPage({ clientName: client.name, scopes: parsed.data.scope, values: parsed.data }), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function POST(request: Request): Promise<NextResponse> {
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.response;
  const parsed = consentSchema.safeParse(Object.fromEntries((await request.formData()).entries()));
  if (!parsed.success) return new NextResponse("Rozilik so'rovi yaroqsiz", { status: 400 });
  if (parsed.data.resource !== `${siteConfig.siteUrl}/api/mcp`) return new NextResponse("Resource mos emas", { status: 400 });
  const result = await issueAuthorizationCode({ clientId: parsed.data.client_id, redirectUri: parsed.data.redirect_uri, resource: parsed.data.resource, requestedScopes: parsed.data.scope, state: parsed.data.state, challenge: parsed.data.code_challenge, userId: gate.session.userId });
  const target = new URL(result.redirectUri); target.searchParams.set("code", result.code); target.searchParams.set("state", result.state);
  return NextResponse.redirect(target);
}
