import { beforeEach, describe, expect, it, vi } from "vitest";

const execute = vi.hoisted(() => vi.fn());
vi.mock("@/db", () => ({ db: { execute } }));

import { GET } from "@/app/api/health/route";

const request = () => new Request("https://app.test/api/health", { headers: { "x-request-id": "req-health-0001" } });

describe("F1: GET /api/health", () => {
  beforeEach(() => { execute.mockReset(); vi.restoreAllMocks(); });

  it("200 {status:ok} with no-store when select 1 succeeds", async () => {
    execute.mockResolvedValue([{ "?column?": 1 }]);
    const res = await GET(request());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
    expect(res.headers.get("cache-control")).toContain("no-store");
  });

  it("503 {status:degraded} on DB failure, without leaking internals, and logs a JSON line with the request id", async () => {
    execute.mockRejectedValue(Object.assign(new Error("password authentication failed for user postgres at db.secret.host"), { code: "28P01" }));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await GET(request());
    expect(res.status).toBe(503);
    const body = await res.text();
    expect(JSON.parse(body)).toEqual({ status: "degraded" });
    expect(body).not.toMatch(/password|postgres|host|28P01/);
    const line = JSON.parse(String(spy.mock.calls[0]?.[0]));
    expect(line).toMatchObject({ level: "error", event: "health_db_failed", requestId: "req-health-0001", errorCode: "28P01" });
    expect(JSON.stringify(line)).not.toContain("password");
  });

  it("503 when the DB hangs longer than the timeout", async () => {
    vi.useFakeTimers();
    execute.mockReturnValue(new Promise(() => {}));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const pending = GET(request());
    await vi.advanceTimersByTimeAsync(5500);
    const res = await pending;
    vi.useRealTimers();
    expect(res.status).toBe(503);
  });
});
