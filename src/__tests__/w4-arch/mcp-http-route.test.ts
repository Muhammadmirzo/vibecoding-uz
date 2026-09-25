/**
 * Remote MCP endpoint (src/app/api/mcp/route.ts) — Streamable HTTP
 * transport. Auth is exercised end-to-end over real HTTP Request/Response
 * objects; only the DB-backed KPI query is mocked so the round-trip test
 * never touches a database.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MCP_AUTH_ENV_VAR } from "../../../mcp-server/auth";

const TOKEN = "http-test-token-xyz";
const MCP_URL = "http://localhost/api/mcp";
const JSON_RPC_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/event-stream",
};

vi.mock("../../../mcp-server/tools/db", () => ({
  queryKpiCounts: vi.fn(async () => ({
    totalLeads: 3,
    activeStudents: 2,
    pendingHomework: 1,
    paidPayments: 1,
    paidRevenueTiyin: 100000,
    totalCohorts: 1,
  })),
}));

const ORIGINAL = process.env[MCP_AUTH_ENV_VAR];

beforeEach(() => {
  process.env[MCP_AUTH_ENV_VAR] = TOKEN;
});

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env[MCP_AUTH_ENV_VAR];
  else process.env[MCP_AUTH_ENV_VAR] = ORIGINAL;
});

function rpcRequest(body: Record<string, unknown>, headers?: Record<string, string>): Request {
  return new Request(MCP_URL, {
    method: "POST",
    headers: { ...JSON_RPC_HEADERS, ...headers },
    body: JSON.stringify(body),
  });
}

async function readJsonRpc(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  // enableJsonResponse: true means a single JSON-RPC response body (not SSE).
  return JSON.parse(text) as Record<string, unknown>;
}

describe("POST /api/mcp — auth", () => {
  it("rejects a request with no Authorization header", async () => {
    const { POST } = await import("../../app/api/mcp/route");
    const res = await POST(rpcRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" }));
    expect(res.status).toBe(401);
    expect(res.headers.get("WWW-Authenticate")).toBe("Bearer");
  });

  it("rejects a request with the wrong token", async () => {
    const { POST } = await import("../../app/api/mcp/route");
    const res = await POST(
      rpcRequest(
        { jsonrpc: "2.0", id: 1, method: "tools/list" },
        { Authorization: "Bearer wrong-token" }
      )
    );
    expect(res.status).toBe(401);
  });

  it("fails closed with 503 when MCP_AUTH_TOKEN is not configured", async () => {
    delete process.env[MCP_AUTH_ENV_VAR];
    const { POST } = await import("../../app/api/mcp/route");
    const res = await POST(
      rpcRequest(
        { jsonrpc: "2.0", id: 1, method: "tools/list" },
        { Authorization: `Bearer ${TOKEN}` }
      )
    );
    expect(res.status).toBe(503);
  });
});

describe("POST /api/mcp — authorized calls", () => {
  it("tools/list returns the shared tool registry names", async () => {
    const { POST } = await import("../../app/api/mcp/route");
    const res = await POST(
      rpcRequest(
        { jsonrpc: "2.0", id: 1, method: "tools/list" },
        { Authorization: `Bearer ${TOKEN}` }
      )
    );
    expect(res.status).toBe(200);
    const body = await readJsonRpc(res);
    const result = body.result as { tools: { name: string }[] };
    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual(
      [
        "broadcast_notification",
        "generate_discount_promocode",
        "get_cohort_status",
        "get_platform_kpis",
        "get_student_activity",
        "grade_homework",
        "query_leads_pipeline",
      ].sort()
    );
  });

  it("tools/call round-trips a read tool (get_platform_kpis)", async () => {
    const { POST } = await import("../../app/api/mcp/route");
    const res = await POST(
      rpcRequest(
        {
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: { name: "get_platform_kpis", arguments: { period: "7d" } },
        },
        { Authorization: `Bearer ${TOKEN}` }
      )
    );
    expect(res.status).toBe(200);
    const body = await readJsonRpc(res);
    const result = body.result as { content: { type: string; text: string }[]; isError?: boolean };
    expect(result.isError).toBeFalsy();
    const payload = JSON.parse(result.content[0]?.text ?? "{}") as Record<string, unknown>;
    expect(payload.ok).toBe(true);
    expect(payload.period).toBe("7d");
    expect((payload.kpis as Record<string, unknown>).totalLeads).toBe(3);
  });
});
