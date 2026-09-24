import { ServiceError } from "@/lib/http/errors";
import type { CreateLeadInput, LeadsAdminQuery, UpdateLeadInput } from "@/lib/validations/crm";
import { paginate, type PageResult } from "../domain/pagination";
import type { LeadListItem, LeadRow, LeadsRepository } from "./leads.repository";

export async function listLeads(
  repo: LeadsRepository,
  query: LeadsAdminQuery,
): Promise<PageResult<LeadListItem> & { leads: LeadListItem[] }> {
  const all = await repo.listLeads();
  let filtered = all;
  if (query.status && query.status !== "all") {
    filtered = filtered.filter((lead) => lead.status === query.status);
  }
  const q = query.q?.trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (lead) => lead.name.toLowerCase().includes(q) || (lead.phone ?? "").toLowerCase().includes(q),
    );
  }
  const page = paginate(filtered, query.page, query.limit);
  return { ...page, leads: page.items };
}

export async function createLead(repo: LeadsRepository, input: CreateLeadInput): Promise<LeadRow> {
  return repo.createLead(input);
}

export async function updateLead(repo: LeadsRepository, id: string, patch: UpdateLeadInput): Promise<LeadRow> {
  const updated = await repo.updateLead(id, patch);
  if (!updated) throw new ServiceError("NOT_FOUND", "Lead topilmadi", 404);
  return updated;
}

export async function deleteLead(repo: LeadsRepository, id: string): Promise<LeadRow> {
  const deleted = await repo.deleteLead(id);
  if (!deleted) throw new ServiceError("NOT_FOUND", "Lead topilmadi", 404);
  return deleted;
}
