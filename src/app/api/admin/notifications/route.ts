import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { createBroadcastSchema } from "@/lib/validations";
import { drizzleNotificationsRepository } from "@/features/crm/server/notifications.repository";
import { createBroadcast, listBroadcasts } from "@/features/crm/server/notifications.service";

const repo = drizzleNotificationsRepository;

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const broadcasts = await listBroadcasts(repo);
    return okResponse({ success: true, broadcasts });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const body = createBroadcastSchema.parse(await request.json());
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const { broadcast } = await createBroadcast(repo, body, { ip });
    return NextResponse.json({ success: true, broadcast }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
