import { describe, expect, it, vi } from "vitest";
import { errorResponse, ServiceError } from "@/lib/http/errors";

describe("W10 error-message leak check", () => {
  it("masks unknown 500 messages with the Uzbek recovery text and logs server-side", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const secretish = new Error("connect ENOENT /run/secrets/db-password for host db.internal:5432");
    const response = errorResponse(secretish);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("internal_error");
    expect(body.message).not.toContain("db.internal");
    expect(body.message).not.toContain("ENOENT");
    expect(body.message).toContain("qayta urinib");
    expect(errorSpy).toHaveBeenCalledWith("[api] internal_error:", secretish);
    errorSpy.mockRestore();
  });

  it("masks legacy 500-shaped errors that are not ServiceError", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const legacy = Object.assign(new Error("sql: relation \"users\" does not exist"), { status: 500 });
    const response = errorResponse(legacy);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.message).not.toContain("relation");
    expect(body.message).toContain("qayta urinib");
    errorSpy.mockRestore();
  });

  it("keeps explicit ServiceError 5xx messages (services craft user-safe texts)", async () => {
    const response = errorResponse(new ServiceError("PROVIDER_UNAVAILABLE", "To'lov xizmati band", 503));
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: "PROVIDER_UNAVAILABLE", message: "To'lov xizmati band" });
  });

  it("keeps 4xx messages untouched (no leak class there)", async () => {
    const response = errorResponse(new ServiceError("NOT_FOUND", "Topilmadi", 404));
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ message: "Topilmadi" });
    const plain = errorResponse(Object.assign(new Error("Noto'g'ri so'rov"), { status: 400, code: "BAD" }));
    expect(plain.status).toBe(400);
    await expect(plain.json()).resolves.toMatchObject({ message: "Noto'g'ri so'rov" });
  });
});
