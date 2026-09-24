import { NextResponse } from "next/server";
import { getDbSession, requireAuth } from "@/lib/auth/require-auth";
import { errorResponse, okResponse } from "@/lib/http/errors";
import { updateMyProfileSchema } from "@/lib/validations/student";
import { drizzleProfileRepository } from "@/features/crm/server/profile.repository";
import { updateMyProfile } from "@/features/crm/server/profile.service";

function toPayload(record: {
  id: string; phone: string; email: string | null; fullName: string; avatarUrl: string | null;
  role: string; locale: string; createdAt: Date; lastLoginAt: Date | null;
  profile: {
    birthDate: Date | null; city: string | null; profession: string | null;
    goal: string | null; source: string | null; bio: string | null;
  } | null;
}) {
  return {
    user: {
      id: record.id,
      phone: record.phone,
      email: record.email,
      fullName: record.fullName,
      avatarUrl: record.avatarUrl,
      role: record.role,
      locale: record.locale,
      createdAt: record.createdAt,
      lastLoginAt: record.lastLoginAt,
      profile: record.profile
        ? {
          birthDate: record.profile.birthDate,
          city: record.profile.city,
          profession: record.profile.profession,
          goal: record.profile.goal,
          source: record.profile.source,
          bio: record.profile.bio,
        }
        : null,
    },
  };
}

export async function GET() {
  try {
    const authSession = await getDbSession();
    if (!authSession) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }
    const record = await drizzleProfileRepository.findMe(authSession.userId);
    if (!record) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }
    return NextResponse.json(toPayload(record));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const authResult = await requireAuth(request);
    if (!authResult.ok) return authResult.response;
    const body: unknown = await request.json();
    const input = updateMyProfileSchema.parse(body);
    const updated = await updateMyProfile(drizzleProfileRepository, authResult.session.userId, input);
    return okResponse({ success: true, ...toPayload(updated) });
  } catch (error) {
    return errorResponse(error);
  }
}
