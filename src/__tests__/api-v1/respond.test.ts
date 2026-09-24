import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { z } from "zod";
import { created, fail, ok, toV1Error } from "@/lib/api/v1/respond";
import { ServiceError } from "@/lib/http/errors";

describe("api v1 respond helpers", () => {
  it("wraps success data with optional meta", async () => {
    expect(await ok({ a: 1 }).json()).toEqual({ data: { a: 1 } });
    const listed = ok([1, 2], { nextCursor: "c2", total: 2 });
    expect(await listed.json()).toEqual({ data: [1, 2], meta: { nextCursor: "c2", total: 2 } });
    const made = created({ id: "x" });
    expect(made.status).toBe(201);
    expect(await made.json()).toEqual({ data: { id: "x" } });
  });

  it("maps ServiceError to code + message with its status", async () => {
    const res = await fail(new ServiceError("NOT_FOUND", "Topilmadi", 404));
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: { code: "NOT_FOUND", message: "Topilmadi" } });
  });

  it("maps Zod errors to validation_error with details", async () => {
    const parsed = z.object({ a: z.string() }).safeParse({});
    const res = await fail(parsed.success ? null : parsed.error);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.error.code).toBe("validation_error");
    expect(body.error.details).toBeDefined();
  });

  it("maps legacy auth gate responses (message in `error`)", async () => {
    const gate = NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    const body = await (await fail(gate)).json();
    expect(body).toEqual({ error: { code: "unauthorized", message: "Avtorizatsiyadan o'tilmagan" } });
  });

  it("keeps Retry-After on rate-limit responses", async () => {
    const limited = NextResponse.json({ error: "Juda ko'p so'rov" }, { status: 429, headers: { "Retry-After": "30" } });
    const res = await toV1Error(limited);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    expect((await res.json()).error.code).toBe("rate_limited");
  });

  it("never leaks a non-Error throw", async () => {
    const res = await fail("boom");
    expect(res.status).toBe(500);
    expect((await res.json()).error.code).toBe("internal_error");
  });
});
