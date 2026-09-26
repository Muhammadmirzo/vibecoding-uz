import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { requireServerToken, verifyAuthToken } from "./auth";
import { createMcpServer } from "@/features/mcp/registry/server";
import type { McpPrincipal } from "@/features/mcp/server/auth.service";

/**
 * W8B stdio compatibility server. The transport is intentionally tiny; all
 * capabilities come from the same registry used by the remote HTTP server.
 * MCP_AUTH_TOKEN remains the process-level gate for local administrators.
 */
async function main(): Promise<void> {
  const envToken = requireServerToken();
  const expected = process.env.MCP_AUTH_TOKEN;
  if (!expected || !verifyAuthToken(expected)) throw new Error("MCP_AUTH_TOKEN tekshiruvi muvaffaqiyatsiz");
  const principal: McpPrincipal = { userId: process.env.MCP_ADMIN_USER_ID ?? "00000000-0000-4000-8000-000000000000", role: "admin", scopes: ["analytics:read", "students:read", "sales:read", "chat:read", "chat:write", "content:write", "leads:write"], clientId: null, sender: "admin", tokenId: `stdio-${envToken.slice(0, 8)}`, tokenType: "pat" };
  const server = createMcpServer(principal);
  await server.connect(new StdioServerTransport());
  console.error("Naqsh MCP Server running on stdio...");
}

main().catch((error: unknown) => { console.error("MCP Server Error:", error instanceof Error ? error.message : String(error)); process.exit(1); });
