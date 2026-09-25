import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { ServiceError } from "@/lib/http/errors";
import { authorizeQuerySchema, consentSchema } from "@/features/mcp/contracts";
import { getOAuthClient, issueAuthorizationCode } from "@/features/mcp/server/oauth.service";
import { siteConfig } from "@/lib/siteConfig";
import { consentPage, oauthRedirectUrl, redirectPage } from "@/features/mcp/ui/consent-page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML_HEADERS = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" };
const text = (message: string, status: number) => new NextResponse(message, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request): Promise<NextResponse> {
  const gate = await requireAdmin(request);
  const url = new URL(request.url);
  // /admin/login reads `redirect` (same-origin paths only) and sends the admin back here.
  if (!gate.ok) return NextResponse.redirect(new URL(`/admin/login?redirect=${encodeURIComponent(url.pathname + url.search)}`, url.origin));
  const parsed = authorizeQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));
  if (!parsed.success) return text("OAuth so'rovi yaroqsiz", 400);
  if (parsed.data.resource !== `${siteConfig.siteUrl}/api/mcp`) return text("Resource mos emas", 400);
  let client;
  try { client = await getOAuthClient(parsed.data.client_id); } catch (error) {
    return error instanceof ServiceError ? text("MCP mijoz topilmadi", 400) : text("Xizmat vaqtincha mavjud emas", 503);
  }
  // Exact-match allowlist. Never redirect to an unregistered URI, not even with an error.
  if (!client.redirectUris.includes(parsed.data.redirect_uri)) return text("Redirect URI ruxsat etilmagan", 400);
  const cancelUrl = oauthRedirectUrl(parsed.data.redirect_uri, { error: "access_denied", state: parsed.data.state });
  return new NextResponse(consentPage({ clientName: client.name, scopes: parsed.data.scope, values: parsed.data, cancelUrl }), { headers: HTML_HEADERS });
}

export async function POST(request: Request): Promise<NextResponse> {
  // requireAdmin enforces the same-origin (Origin/Referer) CSRF check for cookie POSTs.
  const gate = await requireAdmin(request);
  if (!gate.ok) return gate.response;
  const parsed = consentSchema.safeParse(Object.fromEntries((await request.formData()).entries()));
  if (!parsed.success) return text("Rozilik so'rovi yaroqsiz", 400);
  if (parsed.data.resource !== `${siteConfig.siteUrl}/api/mcp`) return text("Resource mos emas", 400);
  try {
    const result = await issueAuthorizationCode({ clientId: parsed.data.client_id, redirectUri: parsed.data.redirect_uri, resource: parsed.data.resource, requestedScopes: parsed.data.scope, state: parsed.data.state, challenge: parsed.data.code_challenge, userId: gate.session.userId });
    const target = oauthRedirectUrl(result.redirectUri, { code: result.code, state: result.state });
    return new NextResponse(redirectPage(target), { headers: HTML_HEADERS });
  } catch (error) {
    return error instanceof ServiceError ? text(error.message, 400) : text("Xizmat vaqtincha mavjud emas", 503);
  }
}
