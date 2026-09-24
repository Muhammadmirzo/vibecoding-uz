import { NextResponse } from "next/server";
import { revokeOAuthToken } from "@/features/mcp/server/oauth.service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  const body = Object.fromEntries((await request.formData()).entries());
  if (typeof body.token !== "string" || !body.token) return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  await revokeOAuthToken(body.token);
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
