import { describe, expect, it, vi } from "vitest";
import { adminIdParamSchema } from "@/lib/validations/admin";
import { leadsAdminQuerySchema } from "@/lib/validations/crm";
import { createLead, deleteLead, listLeads, updateLead } from "@/features/crm/server/leads.service";
import type { LeadListItem, LeadRow, LeadsRepository } from "@/features/crm/server/leads.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

function makeRow(overrides: Partial<LeadRow> = {}): LeadRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Test User",
    phone: "+998901234567",
    telegram: null,
    source: "manual",
    quizAnswers: null,
    recommendedCourseId: null,
    utm: null,
    status: "new",
    assignedManagerId: null,
    nextContactAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeItem(overrides: Partial<LeadListItem> = {}): LeadListItem {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Test User",
    phone: "+998901234567",
    source: "manual",
    quizAnswers: null,
    recommendedCourseId: null,
    recommendedCourseTitle: null,
    utm: null,
    status: "new",
    assignedManagerId: null,
    assignedManagerName: null,
    nextContactAt: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function repoWith(items: LeadListItem[]): LeadsRepository {
  const fake: LeadsRepository = {
    listLeads: async () => items,
    findLeadById: async (id) => (id === makeRow().id ? makeRow() : null),
    createLead: async (input) => makeRow({ name: input.name, phone: input.phone }),
    updateLead: async (id, patch) => {
      if (id === "missing") return null;
      const row = makeRow({ id });
      if (patch.status !== undefined) row.status = patch.status;
      if (patch.phone !== undefined) row.phone = patch.phone;
      return row;
    },
    deleteLead: async (id) => (id === "missing" ? null : makeRow({ id })),
  };
  return fake;
}

describe("leads service", () => {
  it("filters by status and search query", async () => {
    const repo = repoWith([
      makeItem({ id: "a", name: "Alice", phone: "+998901111111", status: "new" }),
      makeItem({ id: "b", name: "Bob", phone: "+998902222222", status: "paid" }),
    ]);
    const byStatus = await listLeads(repo, { status: "paid", q: undefined, page: 1, limit: 100 });
    expect(byStatus.leads.map((l) => l.id)).toEqual(["b"]);
    expect(byStatus.total).toBe(1);
    const bySearch = await listLeads(repo, { status: "all", q: "alice", page: 1, limit: 100 });
    expect(bySearch.leads.map((l) => l.id)).toEqual(["a"]);
  });

  it("paginates results with page/limit", async () => {
    const items = Array.from({ length: 5 }, (_, i) => makeItem({ id: `id-${i}`, name: `Name ${i}` }));
    const repo = repoWith(items);
    const page2 = await listLeads(repo, { status: "all", q: undefined, page: 2, limit: 2 });
    expect(page2.items.map((l) => l.id)).toEqual(["id-2", "id-3"]);
    expect(page2.total).toBe(5);
    expect(page2.page).toBe(2);
  });

  it("throws NOT_FOUND when updating or deleting a missing lead", async () => {
    const repo = repoWith([]);
    await expect(updateLead(repo, "missing", { status: "paid" })).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(deleteLead(repo, "missing")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("creates a lead via the repository", async () => {
    const repo = repoWith([]);
    const row = await createLead(repo, { name: "New", phone: "+998903333333", source: "manual", status: "new" });
    expect(row.name).toBe("New");
  });
});

describe("leads route validation", () => {
  it("rejects non-UUID id params", () => {
    expect(adminIdParamSchema.safeParse({ id: "not-a-uuid" }).success).toBe(false);
    expect(adminIdParamSchema.safeParse({ id: "11111111-1111-4111-8111-111111111111" }).success).toBe(true);
  });

  it("coerces pagination query params with sane defaults", () => {
    const parsed = leadsAdminQuerySchema.parse({ status: "new", page: "2", limit: "10" });
    expect(parsed).toMatchObject({ status: "new", page: 2, limit: 10 });
    const defaults = leadsAdminQuerySchema.parse({});
    expect(defaults).toMatchObject({ status: "all", page: 1, limit: 100 });
  });
});
