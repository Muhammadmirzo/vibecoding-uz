import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthSession } from "@/lib/auth/session";
import { updateMeSchema } from "@/lib/validations";

export async function GET() {
  try {
    const authSession = await getAuthSession();
    if (!authSession) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan" },
        { status: 401 }
      );
    }

    const [userRecord] = await db
      .select({
        user: users,
        profile: userProfiles,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, authSession.userId))
      .limit(1);

    if (!userRecord || !userRecord.user) {
      return NextResponse.json(
        { error: "Foydalanuvchi topilmadi" },
        { status: 404 }
      );
    }

    const { user, profile } = userRecord;

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        locale: user.locale,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        profile: profile
          ? {
              birthDate: profile.birthDate,
              city: profile.city,
              profession: profile.profession,
              goal: profile.goal,
              source: profile.source,
              bio: profile.bio,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("GET /api/me error:", error);
    return NextResponse.json(
      { error: "Ma'lumotlarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authSession = await getAuthSession();
    if (!authSession) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = updateMeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { fullName, email, avatarUrl, city, profession, goal, bio, birthDate } = parseResult.data;

    // Update main user fields if provided
    const userUpdates: { fullName?: string; email?: string | null; avatarUrl?: string | null } = {};
    if (fullName !== undefined) userUpdates.fullName = fullName;
    if (email !== undefined) userUpdates.email = email;
    if (avatarUrl !== undefined) userUpdates.avatarUrl = avatarUrl;

    if (Object.keys(userUpdates).length > 0) {
      await db
        .update(users)
        .set(userUpdates)
        .where(eq(users.id, authSession.userId));
    }

    // Update profile fields if provided
    if (
      city !== undefined ||
      profession !== undefined ||
      goal !== undefined ||
      bio !== undefined ||
      birthDate !== undefined
    ) {
      const profileUpdates: {
        userId: string;
        birthDate?: Date | null;
        city?: string | null;
        profession?: string | null;
        goal?: string | null;
        bio?: string | null;
      } = {
        userId: authSession.userId,
      };

      if (city !== undefined) profileUpdates.city = city;
      if (profession !== undefined) profileUpdates.profession = profession;
      if (goal !== undefined) profileUpdates.goal = goal;
      if (bio !== undefined) profileUpdates.bio = bio;
      if (birthDate !== undefined) profileUpdates.birthDate = birthDate ? new Date(birthDate) : null;

      await db
        .insert(userProfiles)
        .values(profileUpdates)
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: profileUpdates,
        });
    }

    // Fetch updated record
    const [updatedRecord] = await db
      .select({
        user: users,
        profile: userProfiles,
      })
      .from(users)
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, authSession.userId))
      .limit(1);

    const { user, profile } = updatedRecord;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        locale: user.locale,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        profile: profile
          ? {
              birthDate: profile.birthDate,
              city: profile.city,
              profession: profile.profession,
              goal: profile.goal,
              source: profile.source,
              bio: profile.bio,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("PATCH /api/me error:", error);
    return NextResponse.json(
      { error: "Profilni yangilashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
