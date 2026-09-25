import { z } from "zod";
import { created } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { pushRegisterSchema } from "@/features/mobile/contracts-resources";
import { disablePushDevice, registerPushDevice } from "@/features/mobile/server/mobile.repository";

registerV1Route({
  method: "post",
  path: "/api/v1/push-devices",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["devices"],
  summary: "Push qurilmani ro'yxatga olish (Expo/FCM/APNs)",
  request: { body: { content: { "application/json": { schema: pushRegisterSchema } } } },
  responses: { 201: { description: "Ro'yxatga olindi", content: { "application/json": { schema: z.object({ id: z.string().uuid() }) } } } },
});

export async function POST(request: Request) {
  return v1(request, async ({ session }) => {
    const input = pushRegisterSchema.parse(await request.json());
    const row = await registerPushDevice({
      userId: session.userId, platform: input.platform, pushToken: input.pushToken,
      appVersion: input.appVersion, locale: input.locale,
    });
    console.info("[mobile] push device registered", { userId: session.userId, deviceId: row.id, platform: input.platform });
    return created({ id: row.id });
  });
}
