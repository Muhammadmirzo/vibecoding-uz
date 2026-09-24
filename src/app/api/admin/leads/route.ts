import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { createLeadSchema, leadsAdminQuerySchema } from "@/lib/validations";
import { drizzleLeadsRepository } from "@/features/crm/server/leads.repository";
import { createLead, listLeads } from "@/features/crm/server/leads.service";

const repo = drizzleLeadsRepository;

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const query = leadsAdminQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const result = await listLeads(repo, query);
    return okResponse({ success: true, leads: result.leads, total: result.total, page: result.page, limit: result.limit });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const body = createLeadSchema.parse(await request.json());
    const lead = await createLead(repo, body);
    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
