import { NextResponse } from "next/server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { siteConfig } from "@/lib/siteConfig";
import { authenticateMcp, consumeMcpRateLimit } from "@/features/mcp/server/auth.service";
import { createMcpServer } from "@/features/mcp/registry/server";
import { mcpToolMap } from "@/features/mcp/registry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const resourceMetadata = `${siteConfig.siteUrl}/.well-known/oauth-protected-resource`;

function unauthorized(): NextResponse { return NextResponse.json({ error: "unauthorized", message: "MCP uchun bearer token talab qilinadi." }, { status: 401, headers: { "WWW-Authenticate": `Bearer resource_metadata="${resourceMetadata}"` } }); }
function forbidden(): NextResponse { return NextResponse.json({ error: "forbidden", message: "Bu amal uchun ruxsat yetarli emas." }, { status: 403, headers: { "WWW-Authenticate": `Bearer error="insufficient_scope", resource_metadata="${resourceMetadata}"` } }); }
function bodyToolName(body: unknown): string | null { if (!body || typeof body !== "object" || Array.isArray(body)) return null; const value = Object.fromEntries(Object.entries(body)); const params = value.params && typeof value.params === "object" ? Object.fromEntries(Object.entries(value.params)) : {}; return value.method === "tools/call" && typeof params.name === "string" ? params.name : null; }

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try { body = await request.clone().json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }
  const requestedTool = bodyToolName(body); const definition = requestedTool ? mcpToolMap.get(requestedTool) : undefined;
  let auth;
  try { auth = await authenticateMcp(request.headers.get("authorization"), definition?.scope, `${siteConfig.siteUrl}/api/mcp`); } catch { return NextResponse.json({ error: "service_unavailable", message: "MCP vaqtincha mavjud emas." }, { status: 503 }); }
  if (!auth.principal) return auth.status === 403 ? forbidden() : unauthorized();
  if (!await consumeMcpRateLimit(auth.principal)) return NextResponse.json({ error: "rate_limited", message: "Juda ko'p so'rov yuborildi." }, { status: 429, headers: { "Retry-After": "60" } });
  const server = createMcpServer(auth.principal);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true, maxRequestBodySize: 1_000_000 });
  await server.connect(transport);
  return transport.handleRequest(request, { parsedBody: body, authInfo: { token: "opaque", clientId: auth.principal.clientId ?? auth.principal.tokenId, scopes: auth.principal.scopes, expiresAt: Math.floor(Date.now() / 1000) + 3600 } });
}

export async function GET(): Promise<NextResponse> { return NextResponse.json({ error: "method_not_allowed", message: "Stateless MCP faqat POST bilan ishlaydi." }, { status: 405, headers: { Allow: "POST, OPTIONS" } }); }
export function OPTIONS(): Response { return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type, MCP-Protocol-Version, MCP-Session-Id", "Access-Control-Allow-Methods": "POST, OPTIONS" } }); }
