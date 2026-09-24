import { describe, expect, it, vi } from "vitest";
import { earlyBirdInfo, remainingSeats } from "@/features/crm/domain/cohort-policy";
import { createCohort, deleteCohort, listCohorts, updateCohort } from "@/features/crm/server/cohorts.service";
import type { CohortRow, CohortsRepository, CohortListItem } from "@/features/crm/server/cohorts.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

function makeRow(overrides: Partial<CohortRow> = {}): CohortRow {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    courseId: "33333333-3333-4333-8333-333333333333",
    name: "Test Cohort",
    startsAt: new Date("2026-03-01T00:00:00Z"),
    endsAt: null,
    seats: 30,
    priceSum: "2990000.00",
    earlyPriceSum: null,
    earlyDeadline: null,
    telegramChatId: null,
    status: "active",
    ...overrides,
  };
}

function repoWith(items: CohortListItem[]): CohortsRepository {
  const fake: CohortsRepository = {
    listCohorts: async () => items,
    findCohortById: async () => null,
    createCohort: async (input) => makeRow({ name: input.name }),
    updateCohort: async (id, patch) => {
      if (id === "missing") return null;
      const row = makeRow({ id });
      if (patch.name !== undefined) row.name = patch.name;
      return row;
    },
    deleteCohort: async (id) => (id === "missing" ? null : makeRow({ id })),
  };
  return fake;
}

describe("cohort early-bird policy", () => {
  it("is active before the deadline with days-left rounded up", () => {
    const now = new Date("2026-01-01T00:00:00Z");
    const info = earlyBirdInfo(new Date("2026-01-03T12:00:00Z"), now);
    expect(info).toEqual({ isEarlyBirdActive: true, earlyBirdDaysLeft: 3 });
  });

  it("is inactive without a deadline or after it passes", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    expect(earlyBirdInfo(null, now).isEarlyBirdActive).toBe(false);
    expect(earlyBirdInfo(new Date("2026-01-01T00:00:00Z"), now).isEarlyBirdActive).toBe(false);
  });

  it("clamps remaining seats at zero", () => {
    expect(remainingSeats(30, 12)).toBe(18);
    expect(remainingSeats(30, 40)).toBe(0);
  });
});

describe("cohorts service", () => {
  it("formats list rows with enrollment math and fallbacks", async () => {
    const repo = repoWith([
      {
        cohort: makeRow({ earlyDeadline: new Date("2026-06-01T00:00:00Z") }),
        courseTitle: "Vibe Coding",
        courseSlug: "vibe-coding",
        enrolledCount: 5,
      },
      {
        cohort: makeRow({ id: "no-course", earlyDeadline: null }),
        courseTitle: null,
        courseSlug: null,
        enrolledCount: 0,
      },
    ]);
    const rows = await listCohorts(repo, new Date("2026-01-01T00:00:00Z"));
    expect(rows[0]).toMatchObject({ enrolledSeats: 5, remainingSeats: 25, isEarlyBirdActive: true });
    expect(rows[1]).toMatchObject({ courseTitle: "Noma'lum kurs", courseSlug: "", isEarlyBirdActive: false });
  });

  it("throws NOT_FOUND for missing cohorts on update/delete", async () => {
    const repo = repoWith([]);
    await expect(updateCohort(repo, "missing", { name: "x" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(deleteCohort(repo, "missing")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("creates a cohort via the repository", async () => {
    const repo = repoWith([]);
    const row = await createCohort(repo, {
      courseId: "33333333-3333-4333-8333-333333333333",
      name: "New Cohort",
      startsAt: "2026-04-01",
      seats: 30,
      priceSum: "2990000.00",
      status: "active",
    });
    expect(row.name).toBe("New Cohort");
  });
});
