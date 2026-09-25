/**
 * Remote MCP endpoint — Streamable HTTP transport (stateless mode) over the
 * same tool registry the stdio server (mcp-server/index.ts) uses. Auth is a
 * Bearer token checked against MCP_AUTH_TOKEN (fail-closed: no env → 503,
 * missing/wrong token → 401 with WWW-Authenticate). The stdio server's
 * per-call `authToken` argument keeps working unchanged — this route only
 * adds a second, HTTP-native way in.
 */
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { getExpectedToken, verifyAuthToken } from "../../../../mcp-server/auth";
import { createMcpServer } from "../../../../mcp-server/server";
import { checkRateLimit, createRateLimitResponse, getClientIp } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MCP_RATE_LIMIT = { limit: 60, windowSeconds: 60, prefix: "mcp-http" };

function jsonResponse(status: number, body: Record<string, unknown>, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

function extractBearerToken(request: Request): string | undefined {
  const header = request.headers.get("authorization");
  if (!header) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match?.[1]?.trim() || undefined;
}

async function handleMcpRequest(request: Request): Promise<Response> {
  const limited = await checkRateLimit(getClientIp(request), MCP_RATE_LIMIT);
  if (!limited.success) return createRateLimitResponse(limited);

  // Fail closed: an unconfigured server is a 503, not a 401 — it tells the
  // owner the deploy is missing MCP_AUTH_TOKEN rather than implying a bad key.
  if (getExpectedToken() === undefined) {
    return jsonResponse(503, { error: "mcp_not_configured" });
  }

  const bearerToken = extractBearerToken(request);
  if (!verifyAuthToken(bearerToken)) {
    return jsonResponse(401, { error: "unauthorized" }, { "WWW-Authenticate": "Bearer" });
  }

  // The Bearer header already proved the caller holds MCP_AUTH_TOKEN, so
  // inject it for every tool call — each tool's own authToken gate still
  // runs, it's just satisfied automatically instead of repeated per call.
  const server = createMcpServer({ injectAuthToken: bearerToken });
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless: no session state kept across requests
    enableJsonResponse: true,
  });

  try {
    await server.connect(transport);
    return await transport.handleRequest(request);
  } finally {
    await transport.close();
    await server.close();
  }
}

export async function POST(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

export async function GET(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleMcpRequest(request);
}
