import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/siteConfig";
import { ServiceError } from "@/lib/http/errors";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";
import { tokenRequestSchema } from "@/features/mcp/contracts";
import { exchangeToken } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";
const NO_STORE = { "Cache-Control": "no-store", Pragma: "no-cache" };

export async function POST(request: Request): Promise<NextResponse> {
  const limited = await checkRateLimit(`oauth-token:${getClientIp(request)}`, { limit: 30, windowSeconds: 60, prefix: "oauth-token" });
  if (!limited.success) return createRateLimitResponse(limited);
  const form = await request.formData().catch(() => null);
  const parsed = tokenRequestSchema.safeParse(form ? Object.fromEntries(form.entries()) : null);
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", error_description: "Token so'rovi yaroqsiz" }, { status: 400, headers: NO_STORE });
  try {
    const token = await exchangeToken(parsed.data, `${siteConfig.siteUrl}/api/mcp`);
    return NextResponse.json(token, { headers: NO_STORE });
  } catch (error) {
    // Only our own ServiceError texts are user-safe; DB/driver errors are masked (L10/W10 rule).
    if (error instanceof ServiceError) {
      const code = ["invalid_client", "invalid_target"].includes(error.code) ? error.code : "invalid_grant";
      return NextResponse.json({ error: code, error_description: error.message }, { status: 400, headers: NO_STORE });
    }
    return NextResponse.json({ error: "temporarily_unavailable", error_description: "Xizmat vaqtincha mavjud emas" }, { status: 503, headers: NO_STORE });
  }
}
