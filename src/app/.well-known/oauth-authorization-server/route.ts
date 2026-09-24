import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/siteConfig";
import { ALL_MCP_SCOPES } from "@/features/mcp/contracts";

export const runtime = "nodejs";

export function GET(): NextResponse {
  const issuer = siteConfig.siteUrl;
  return NextResponse.json({
    issuer,
    authorization_endpoint: `${issuer}/oauth/authorize`,
    token_endpoint: `${issuer}/oauth/token`,
    registration_endpoint: `${issuer}/oauth/register`,
    revocation_endpoint: `${issuer}/oauth/revoke`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ALL_MCP_SCOPES,
  }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
