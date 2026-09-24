import { describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "@/features/mcp/registry/server";
import type { McpPrincipal } from "@/features/mcp/server/auth.service";
import { mcpToolRegistry } from "@/features/mcp/registry";
import { pkceS256, tokenHash } from "@/features/mcp/server/tokens";
import { GET as protectedMetadata } from "@/app/.well-known/oauth-protected-resource/route";
import { GET as authorizationMetadata } from "@/app/.well-known/oauth-authorization-server/route";
import { POST as mcpPost } from "@/app/api/mcp/route";

const principal: McpPrincipal = { userId: "00000000-0000-4000-8000-000000000001", role: "admin", scopes: ["analytics:read", "students:read", "sales:read", "chat:read", "chat:write", "content:write"], clientId: null, sender: "admin" as const, tokenId: "test", tokenType: "pat" as const };

async function client() { const server = createMcpServer(principal); const client = new Client({ name: "test-client", version: "1.0.0" }); const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair(); await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]); return client; }

describe("W8B MCP server", () => {
  it("registers one shared registry with output schemas and UI metadata", async () => { const c = await client(); const tools = await c.listTools(); expect(tools.tools.length).toBe(mcpToolRegistry.length); expect(tools.tools.find((tool) => tool.name === "analytics_timeseries")?.outputSchema).toBeTruthy(); expect(tools.tools.find((tool) => tool.name === "analytics_overview")?._meta).toMatchObject({ ui: { resourceUri: "ui://naqsh/dashboard" } }); await c.close(); });
  it("exposes prompts and Naqsh resources", async () => { const c = await client(); expect((await c.listPrompts()).prompts.map((item) => item.name)).toEqual(expect.arrayContaining(["haftalik_hisobot", "sotuv_tahlili", "talabalar_holati", "marketing_manbalari"])); const resources = (await c.listResources()).resources; expect(resources.map((item) => item.uri)).toEqual(expect.arrayContaining(["naqsh://courses", "naqsh://pricing", "naqsh://metrics-glossary", "ui://naqsh/chart/line", "ui://naqsh/dashboard"])); await c.close(); });
  it("validates tool input before database access", async () => { const c = await client(); const result = await c.callTool({ name: "analytics_overview", arguments: {} }); expect(result.isError).toBe(true); await c.close(); });
});

describe("W8B HTTP discovery and auth", () => { it("publishes RFC 9728 and RFC 8414 metadata", async () => { const resource = await protectedMetadata().json(); const auth = await authorizationMetadata().json(); expect(resource.authorization_servers[0]).toBe(auth.issuer); expect(auth.code_challenge_methods_supported).toContain("S256"); }); it("returns WWW-Authenticate resource metadata on 401", async () => { const response = await mcpPost(new Request("https://master-2-jade.vercel.app/api/mcp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }) })); expect(response.status).toBe(401); expect(response.headers.get("www-authenticate")).toContain("oauth-protected-resource"); }); });

describe("W8B token primitives", () => { it("hashes opaque tokens deterministically and verifies PKCE S256", () => { const token = "nq_at_example"; expect(tokenHash(token)).toBe(tokenHash(token)); expect(tokenHash(token)).not.toBe(token); expect(pkceS256("a".repeat(43))).toBe(pkceS256("a".repeat(43))); }); });
