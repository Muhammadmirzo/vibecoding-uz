import { NextResponse } from "next/server";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";
import { revokeOAuthToken } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await checkRateLimit(`oauth-revoke:${getClientIp(request)}`, { limit: 30, windowSeconds: 60, prefix: "oauth-revoke" });
  if (!limited.success) return createRateLimitResponse(limited);
  const form = await request.formData().catch(() => null);
  const token = form?.get("token");
  if (typeof token !== "string" || !token || token.length > 512) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  try { await revokeOAuthToken(token); } catch {
    return NextResponse.json({ error: "temporarily_unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  // RFC 7009: 200 with an empty body, also for unknown tokens.
  return new NextResponse(null, { status: 200, headers: { "Cache-Control": "no-store" } });
}
