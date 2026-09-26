import { describe, expect, it, vi } from "vitest";
import { hasActiveEnrollment } from "@/features/lms/domain/kabinet-dashboard";
import {
  loadKabinetInitialData,
  type KabinetDashboardDeps,
} from "@/features/lms/server/kabinet-dashboard";

const SESSION = { userId: "d312280c-d096-4a25-8638-b5b1a0f1c111", sessionId: "7c2b1a90-1111-4222-8333-444455556666" };

function deps(overrides: Partial<KabinetDashboardDeps> = {}): KabinetDashboardDeps {
  return {
    findSessionUser: vi.fn(async () => ({ fullName: "Ali Karimov" })),
    listPayments: vi.fn(async () => [{ enrollmentId: "enr-1", status: "paid" }]),
    ...overrides,
  };
}

describe("loadKabinetInitialData", () => {
  it("returns prefetched user and payments for a valid session", async () => {
    const result = await loadKabinetInitialData(SESSION, deps());

    expect(result).toEqual({
      user: { fullName: "Ali Karimov" },
      payments: [{ enrollmentId: "enr-1", status: "paid" }],
    });
  });

  it("scopes both reads to the token's user and session", async () => {
    const d = deps();
    await loadKabinetInitialData(SESSION, d);

    expect(d.findSessionUser).toHaveBeenCalledWith(SESSION.sessionId, SESSION.userId);
    expect(d.listPayments).toHaveBeenCalledWith(SESSION.userId);
  });

  it("returns null (client fallback, no throw) when the session is missing or revoked", async () => {
    const d = deps({ findSessionUser: vi.fn(async () => null) });

    await expect(loadKabinetInitialData(SESSION, d)).resolves.toBeNull();
  });

  it("never prefetches without a complete session hint", async () => {
    const d = deps();

    await expect(loadKabinetInitialData(null, d)).resolves.toBeNull();
    await expect(loadKabinetInitialData({ userId: SESSION.userId, sessionId: "" }, d)).resolves.toBeNull();
    expect(d.findSessionUser).not.toHaveBeenCalled();
    expect(d.listPayments).not.toHaveBeenCalled();
  });

  it("returns null when the database is unavailable instead of throwing", async () => {
    const d = deps({
      listPayments: vi.fn(async () => {
        throw new Error("ECONNREFUSED");
      }),
    });

    await expect(loadKabinetInitialData(SESSION, d)).resolves.toBeNull();
  });

  it("returns null when the session lookup itself fails", async () => {
    const d = deps({
      findSessionUser: vi.fn(async () => {
        throw new Error("db down");
      }),
    });

    await expect(loadKabinetInitialData(SESSION, d)).resolves.toBeNull();
  });
});

describe("hasActiveEnrollment", () => {
  it("is true only for a paid row that carries an enrollment", () => {
    expect(hasActiveEnrollment([{ enrollmentId: "enr-1", status: "paid" }])).toBe(true);
  });

  it("is false for pending, paid-without-enrollment or empty lists", () => {
    expect(hasActiveEnrollment([{ enrollmentId: "enr-1", status: "pending" }])).toBe(false);
    expect(hasActiveEnrollment([{ enrollmentId: null, status: "paid" }])).toBe(false);
    expect(hasActiveEnrollment([])).toBe(false);
  });
});
