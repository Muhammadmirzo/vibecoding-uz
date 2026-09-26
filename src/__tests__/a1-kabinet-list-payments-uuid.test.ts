// A1 defect 5: listPayments hit Postgres with whatever id the cookie carried. A
// non-UUID id raises 22P02 (invalid_text_representation) and burns a round trip;
// it must short-circuit with the same UUID guard findActiveSessionUser uses.
import { beforeEach, describe, expect, it, vi } from "vitest";

const select = vi.hoisted(() => vi.fn());
vi.mock("@/db", () => ({ db: { select } }));

const { drizzleKabinetRepository } = await import("@/features/lms/server/kabinet-dashboard.repository");

const UUID = "11111111-1111-4111-8111-111111111111";

beforeEach(() => { select.mockReset(); });

describe("A1: kabinet listPayments UUID guard", () => {
  it.each(["", "   ", "abc", "123", "null", "../../admin", "11111111-1111-4111-8111-11111111111Z", "x".repeat(400)])(
    "returns [] without touching the database for %j",
    async (userId) => {
      await expect(drizzleKabinetRepository.listPayments(userId)).resolves.toEqual([]);
      expect(select).not.toHaveBeenCalled();
    },
  );

  it("queries the database for a real uuid", async () => {
    const rows = Promise.resolve([{ enrollmentId: "e1", status: "paid" }]);
    const chain = { from: () => chain, where: () => chain, orderBy: () => chain, then: rows.then.bind(rows) };
    select.mockReturnValue(chain);
    await expect(drizzleKabinetRepository.listPayments(UUID)).resolves.toEqual([{ enrollmentId: "e1", status: "paid" }]);
    expect(select).toHaveBeenCalledTimes(1);
  });
});
