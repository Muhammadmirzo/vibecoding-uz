import { describe, expect, it } from "vitest";
import { errorResponse, isMaintenanceReadOnly, MAINTENANCE_MESSAGE } from "@/lib/http/errors";

/** Shape of a postgres-js PostgresError for SQLSTATE 25006. */
const readOnlyError = () =>
  Object.assign(new Error("cannot execute INSERT in a read-only transaction"), { code: "25006", severity: "ERROR" });

describe("maintenance mode (database frozen read-only by move-db)", () => {
  it("recognises SQLSTATE 25006, its message, and a wrapped cause", () => {
    expect(isMaintenanceReadOnly(readOnlyError())).toBe(true);
    expect(isMaintenanceReadOnly({ message: "cannot execute UPDATE in a read-only transaction" })).toBe(true);
    expect(isMaintenanceReadOnly(new Error("Failed query", { cause: readOnlyError() }))).toBe(true);
    expect(isMaintenanceReadOnly(Object.assign(new Error("dup"), { code: "23505" }))).toBe(false);
    expect(isMaintenanceReadOnly(null)).toBe(false);
  });

  it("does not loop on self-referencing causes", () => {
    const e: Error & { cause?: unknown } = new Error("x");
    e.cause = e;
    expect(isMaintenanceReadOnly(e)).toBe(false);
  });

  it("answers writes with a retryable 503 + Retry-After and the Uzbek maintenance text", async () => {
    const res = errorResponse(readOnlyError());
    expect(res.status).toBe(503);
    expect(res.headers.get("Retry-After")).toBe("120");
    const body = await res.json();
    expect(body).toEqual({ error: "maintenance", message: MAINTENANCE_MESSAGE, retryable: true });
    expect(JSON.stringify(body)).not.toContain("INSERT");
  });

  it("leaves other errors unchanged", async () => {
    const res = errorResponse(Object.assign(new Error("gone"), { code: "NOT_FOUND" }));
    expect(res.status).toBe(404);
  });
});
