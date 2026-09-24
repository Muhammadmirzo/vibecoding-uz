import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/siteConfig";
import { ALL_MCP_SCOPES } from "@/features/mcp/contracts";

export const runtime = "nodejs";

export function GET(): NextResponse {
  const issuer = siteConfig.siteUrl;
  return NextResponse.json({
    resource: `${issuer}/api/mcp`,
    authorization_servers: [issuer],
    scopes_supported: ALL_MCP_SCOPES,
    bearer_methods_supported: ["header"],
    resource_name: "Naqsh MCP",
  }, { headers: { "Cache-Control": "public, max-age=3600" } });
}
