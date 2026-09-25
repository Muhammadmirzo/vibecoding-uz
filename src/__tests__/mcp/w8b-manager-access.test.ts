import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const requireAdmin = vi.hoisted(() => vi.fn());
vi.mock("@/lib/auth/require-auth", () => ({ requireAdmin }));

import { POST as createPat } from "@/app/api/v1/mcp/pats/route";
import { POST as oauthConsent } from "@/app/oauth/authorize/route";
import { PATCH as updateManager } from "@/app/api/v1/admin/mcp/managers/[id]/route";

vi.mock("@/features/mcp/server/oauth.service", () => ({
  createPat: vi.fn().mockResolvedValue({ id: "123", token: "abc" }),
  issueAuthorizationCode: vi.fn().mockResolvedValue({ code: "c123", state: "s", redirectUri: "http://localhost/cb" }),
  updateManagerMcpAccess: vi.fn().mockResolvedValue(undefined)
}));

import { createPat as createPatSvc, issueAuthorizationCode, updateManagerMcpAccess } from "@/features/mcp/server/oauth.service";

beforeEach(() => {
  requireAdmin.mockReset();
  vi.clearAllMocks();
});

describe("Manager MCP Access Routes", () => {
  it("rejects PAT creation for manager without mcpAccess", async () => {
    requireAdmin.mockResolvedValue({ ok: true, session: { role: "manager", mcpAccess: false, userId: "m1" } });
    const req = new Request("http://localhost/api/v1/mcp/pats", { method: "POST", body: JSON.stringify({ name: "t", scopes: ["analytics:read"], expiresInDays: 30 }), headers: { "Content-Type": "application/json" } });
    const res = await createPat(req);
    expect(res.status).toBe(403);
  });

  it("allows PAT creation for manager with mcpAccess and strips PII scope", async () => {
    requireAdmin.mockResolvedValue({ ok: true, session: { role: "manager", mcpAccess: true, userId: "m1" } });
    const req = new Request("http://localhost/api/v1/mcp/pats", { method: "POST", body: JSON.stringify({ name: "testpat", scopes: ["analytics:read", "students:read:pii"], expiresInDays: 30 }), headers: { "Content-Type": "application/json" } });
    const res = await createPat(req);
    expect(res.status).toBe(201);
    expect(createPatSvc).toHaveBeenCalledWith(expect.objectContaining({ scopes: ["analytics:read"] }), "m1");
  });

  it("rejects OAuth consent for manager without mcpAccess", async () => {
    requireAdmin.mockResolvedValue({ ok: true, session: { role: "manager", mcpAccess: false, userId: "m1" } });
    const formData = new URLSearchParams();
    formData.append("client_id", "client1");
    formData.append("redirect_uri", "http://localhost/cb");
    formData.append("resource", "https://master-2-jade.vercel.app/api/mcp");
    formData.append("scope", "analytics:read");
    formData.append("state", "state12345");
    formData.append("code_challenge", "a".repeat(43));
    formData.append("code_challenge_method", "S256");
    formData.append("response_type", "code");
    formData.append("decision", "allow");
    const req = new Request("http://localhost/oauth/authorize", { method: "POST", body: formData, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    const res = await oauthConsent(req);
    expect(res.status).toBe(403);
  });

  it("allows OAuth consent for manager with mcpAccess and strips PII scope", async () => {
    requireAdmin.mockResolvedValue({ ok: true, session: { role: "manager", mcpAccess: true, userId: "m1" } });
    const formData = new URLSearchParams();
    formData.append("client_id", "client1");
    formData.append("redirect_uri", "http://localhost/cb");
    formData.append("resource", "https://master-2-jade.vercel.app/api/mcp");
    formData.append("scope", "analytics:read students:read:pii");
    formData.append("state", "state12345");
    formData.append("code_challenge", "a".repeat(43));
    formData.append("code_challenge_method", "S256");
    formData.append("response_type", "code");
    formData.append("decision", "allow");
    const req = new Request("http://localhost/oauth/authorize", { method: "POST", body: formData, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
    const res = await oauthConsent(req);
    expect(res.status).toBe(200);
    expect(issueAuthorizationCode).toHaveBeenCalledWith(expect.objectContaining({ requestedScopes: "analytics:read" }));
  });

  it("prevents non-admins from patching manager MCP access", async () => {
    requireAdmin.mockResolvedValue({ ok: true, session: { role: "manager", mcpAccess: true, userId: "m1" } });
    const req = new Request("http://localhost/api/v1/admin/mcp/managers/id1", { method: "PATCH", body: JSON.stringify({ mcpAccess: true }) });
    const res = await updateManager(req, { params: Promise.resolve({ id: "id1" }) });
    expect(res.status).toBe(403);
  });
  
  it("allows admin to patch manager MCP access", async () => {
    requireAdmin.mockResolvedValue({ ok: true, session: { role: "admin", mcpAccess: true, userId: "a1" } });
    const req = new Request("http://localhost/api/v1/admin/mcp/managers/00000000-0000-0000-0000-000000000001", { method: "PATCH", body: JSON.stringify({ mcpAccess: true }) });
    const res = await updateManager(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });
    expect(res.status).toBe(200);
    expect(updateManagerMcpAccess).toHaveBeenCalledWith("a1", "00000000-0000-0000-0000-000000000001", true);
  });
});
