import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { createStaffSchema, usersAdminQuerySchema } from "@/lib/validations";
import { drizzleUsersRepository } from "@/features/crm/server/users.repository";
import { createStaff, listUsers } from "@/features/crm/server/users.service";

const repo = drizzleUsersRepository;

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const query = usersAdminQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const result = await listUsers(repo, query);
    return okResponse({ success: true, users: result.users, total: result.total, page: result.page, limit: result.limit });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const body = createStaffSchema.parse(await request.json());
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { user } = await createStaff(repo, body, { ip });
    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
