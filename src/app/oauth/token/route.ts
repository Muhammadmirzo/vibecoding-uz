import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/siteConfig";
import { tokenRequestSchema } from "@/features/mcp/contracts";
import { exchangeToken } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = tokenRequestSchema.safeParse(Object.fromEntries((await request.formData()).entries()));
  if (!parsed.success) return NextResponse.json({ error: "invalid_request", error_description: "Token so'rovi yaroqsiz" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  try {
    const token = await exchangeToken(parsed.data, `${siteConfig.siteUrl}/api/mcp`);
    return NextResponse.json(token, { headers: { "Cache-Control": "no-store", Pragma: "no-cache" } });
  } catch (error) {
    return NextResponse.json({ error: "invalid_grant", error_description: error instanceof Error ? error.message : "Token berilmadi" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
}
