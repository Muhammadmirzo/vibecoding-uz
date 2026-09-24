import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { siteSettingsSchema } from "@/lib/validations";
import { drizzleAdminRepository } from "@/features/crm/server/admin.repository";
import { getSettings, updateSettings } from "@/features/crm/server/admin.service";
import { getClientIp } from "@/lib/security/rateLimit";

const repo = drizzleAdminRepository;

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;
    const settings = await getSettings(repo);
    return okResponse({ success: true, settings });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const body = siteSettingsSchema.parse(await request.json());
    const ip = getClientIp(request);
    await updateSettings(repo, body, { ip });
    return okResponse({ success: true, settings: await getSettings(repo) });
  } catch (error) {
    return errorResponse(error);
  }
}
