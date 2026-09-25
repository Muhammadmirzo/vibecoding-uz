import { NextResponse } from "next/server";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";
import { registerClientSchema } from "@/features/mcp/contracts";
import { registerOAuthClient } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store" };

/** RFC 7591 dynamic client registration. Public (unauthenticated) by spec, so rate-limited per IP. */
export async function POST(request: Request): Promise<NextResponse> {
  const limited = await checkRateLimit(`oauth-register:${getClientIp(request)}`, { limit: 10, windowSeconds: 3600, prefix: "oauth-register" });
  if (!limited.success) return createRateLimitResponse(limited);
  const parsed = registerClientSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_client_metadata", error_description: "Mijoz ma'lumotlari yoki redirect URI yaroqsiz" }, { status: 400, headers: NO_STORE });
  try {
    const client = await registerOAuthClient({ clientName: parsed.data.client_name, redirectUris: parsed.data.redirect_uris, scope: parsed.data.scope });
    return NextResponse.json(client, { status: 201, headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: "temporarily_unavailable", error_description: "Xizmat vaqtincha mavjud emas" }, { status: 503, headers: NO_STORE });
  }
}
