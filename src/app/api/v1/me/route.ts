import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { mePatchSchema, meResponseSchema } from "@/features/mobile/contracts-resources";
import { drizzleProfileRepository } from "@/features/crm/server/profile.repository";
import { updateMyProfile } from "@/features/crm/server/profile.service";
import { ServiceError } from "@/lib/http/errors";

registerV1Route({
  method: "get",
  path: "/api/v1/me",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["me"],
  summary: "Joriy foydalanuvchi profili",
  responses: {
    200: { description: "Profil", content: { "application/json": { schema: meResponseSchema } } },
  },
});

registerV1Route({
  method: "patch",
  path: "/api/v1/me",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["me"],
  summary: "Profilni tahrirlash",
  request: { body: { content: { "application/json": { schema: mePatchSchema } } } },
  responses: {
    200: { description: "Yangilangan profil", content: { "application/json": { schema: meResponseSchema } } },
  },
});

function toUser(record: NonNullable<Awaited<ReturnType<typeof drizzleProfileRepository.findMe>>>) {
  return {
    id: record.id, phone: record.phone, email: record.email, fullName: record.fullName,
    avatarUrl: record.avatarUrl, role: record.role, locale: record.locale,
    createdAt: record.createdAt, lastLoginAt: record.lastLoginAt, profile: record.profile,
  };
}

export async function GET(request: Request) {
  return v1(request, async ({ session }) => {
    const record = await drizzleProfileRepository.findMe(session.userId);
    if (!record) throw new ServiceError("NOT_FOUND", "Foydalanuvchi topilmadi", 404);
    return ok({ user: toUser(record) });
  });
}

export async function PATCH(request: Request) {
  return v1(request, async ({ session }) => {
    const input = mePatchSchema.parse(await request.json());
    const updated = await updateMyProfile(drizzleProfileRepository, session.userId, {
      fullName: input.fullName,
      email: input.email ?? undefined,
      avatarUrl: input.avatarUrl ?? undefined,
      city: input.city, profession: input.profession, goal: input.goal, bio: input.bio,
      birthDate: input.birthDate ?? undefined,
    });
    return ok({ user: toUser(updated) });
  });
}
