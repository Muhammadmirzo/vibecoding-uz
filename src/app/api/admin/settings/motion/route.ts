import { requireAdmin } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";
import { motionSettingsSchema } from "@/features/motion/domain/settings";
import { getMotionSettings, updateMotionSettings } from "@/features/motion/server/motion-settings.service";

const MOTION_RATE_LIMIT = { limit: 30, windowSeconds: 60, prefix: "admin_motion" };

export async function GET(request: Request) {
  const limit = await checkRateLimit(getClientIp(request), MOTION_RATE_LIMIT);
  if (!limit.success) return createRateLimitResponse(limit);
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return okResponse({ success: true, settings: await getMotionSettings() });
}

export async function PUT(request: Request) {
  try {
    const limit = await checkRateLimit(getClientIp(request), PRESETS.CHECKOUT);
    if (!limit.success) return createRateLimitResponse(limit);
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const body = motionSettingsSchema.parse(await request.json());
    const settings = await updateMotionSettings(body, { userId: auth.session.userId, ip: getClientIp(request) });
    return okResponse({ success: true, settings });
  } catch (error) {
    return errorResponse(error);
  }
}
