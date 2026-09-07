import { NextResponse } from "next/server";
import { db } from "@/db";
import { siteSettings, auditLogs } from "@/db/schema";
import { siteSettingsSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

const DEFAULT_SETTINGS = {
  siteTitle: "Vibecoding Uz",
  supportPhone: "+998 71 200 00 00",
  supportTelegram: "@vibecoding_support_bot",
  maintenanceMode: false,
  defaultCoursePrice: "2990000.00",
  installmentRate3Months: 0,
  installmentRate6Months: 10,
  guaranteeRefundDays: 14,
  guaranteeTextUz: "14 kun davomida o'quv dasturi ma'qul kelmasa, to'lov 100% holatda hech qanday savollarsiz qaytarib beriladi.",
  paymeMerchantId: "",
  paymeSecretKey: "",
  clickServiceId: "",
  clickSecretKey: "",
  telegramBotToken: "",
  smsApiKey: "",

  // Feature Flags & Plan Toggles
  enableGamification: true,
  enableCommunityForum: true,
  enableInteractiveQuizzes: true,
  enableB2BEnterprise: true,
  enableCardReferrals: true,
  enableLevelGating: true,
  enableGuaranteeTrust: true,
};

export async function GET() {
  try {
    const rows = await db.select().from(siteSettings);
    const settingsMap: Record<string, unknown> = { ...DEFAULT_SETTINGS };

    for (const row of rows) {
      settingsMap[row.key] = row.value;
    }

    return NextResponse.json({
      success: true,
      settings: settingsMap,
    });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Sozlamalarni yuklashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = siteSettingsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Sozlamalar ma'lumotlari noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    for (const [key, value] of Object.entries(data)) {
      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, key))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteSettings)
          .set({ value, updatedAt: new Date() })
          .where(eq(siteSettings.key, key));
      } else {
        await db.insert(siteSettings).values({
          key,
          value,
          updatedAt: new Date(),
        });
      }
    }

    // Record audit log
    await db.insert(auditLogs).values({
      action: "settings.update",
      entityType: "site_settings",
      details: { updatedKeys: Object.keys(data) },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      settings: data,
    });
  } catch (error) {
    console.error("POST /api/admin/settings error:", error);
    return NextResponse.json(
      { error: "Sozlamalarni saqlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
