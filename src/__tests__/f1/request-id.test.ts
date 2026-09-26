import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { resolveRequestId } from "@/lib/request-id";
import { requestIdOf } from "@/lib/api/v1/with-v1";
import { createLogger, errorFields } from "@/lib/log";

describe("F1: x-request-id", () => {
  it("middleware generates an id on every response, public and protected", async () => {
    for (const url of ["http://localhost/", "http://localhost/api/kabinet/x", "http://localhost/admin/users"]) {
      const res = await middleware(new NextRequest(url));
      expect(res.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
    }
  });

  it("keeps a sane incoming id and forwards it to the route handler", async () => {
    const res = await middleware(new NextRequest("http://localhost/api/v1/courses", { headers: { "x-request-id": "edge-abc-12345" } }));
    expect(res.headers.get("x-request-id")).toBe("edge-abc-12345");
    expect(res.headers.get("x-middleware-request-x-request-id")).toBe("edge-abc-12345");
  });

  it("replaces unsafe incoming ids (header injection / oversized)", () => {
    expect(resolveRequestId("bad id\r\nx: y")).not.toContain(" ");
    expect(resolveRequestId("a".repeat(500))).toHaveLength(36);
    expect(resolveRequestId(null)).toHaveLength(36);
  });

  it("v1 requestIdOf returns the same id the middleware set", () => {
    const req = new Request("https://app.test/api/v1/x", { headers: { "x-request-id": "edge-abc-12345" } });
    expect(requestIdOf(req)).toBe("edge-abc-12345");
  });

  it("logger writes one JSON line with base fields and never the error message", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    createLogger({ requestId: "r1" }).child({ route: "/x" }).warn("thing_failed", errorFields(new TypeError("secret detail")));
    const line = JSON.parse(String(spy.mock.calls[0]?.[0]));
    expect(line).toMatchObject({ level: "warn", event: "thing_failed", requestId: "r1", route: "/x", errorName: "TypeError" });
    expect(JSON.stringify(line)).not.toContain("secret detail");
    spy.mockRestore();
  });
});
