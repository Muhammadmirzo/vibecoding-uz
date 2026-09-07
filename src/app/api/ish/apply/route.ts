import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, auditLogs } from "@/db/schema";
import { applyJobSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = applyJobSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Insert lead into CRM pipeline
    const [newLead] = await db
      .insert(leads)
      .values({
        name: data.fullName,
        phone: data.phone,
        source: "form",
        status: "new",
        quizAnswers: {
          applicationType: "job_application",
          jobId: data.jobId || null,
          jobSlug: data.jobSlug || null,
          jobTitle: data.jobTitle,
          telegramUsername: data.telegramUsername || null,
          resumeUrl: data.resumeUrl || null,
          portfolioUrl: data.portfolioUrl || null,
          experience: data.experience || null,
          coverLetter: data.coverLetter || null,
          appliedAt: new Date().toISOString(),
        },
      })
      .returning();

    // Log audit
    await db.insert(auditLogs).values({
      action: "job.apply",
      entityType: "lead",
      entityId: newLead.id,
      details: {
        candidate: data.fullName,
        phone: data.phone,
        jobTitle: data.jobTitle,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Arizangiz muvaffaqiyatli qabul qilindi! Tez orada siz bilan bog'lanamiz.",
        leadId: newLead.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/ish/apply error:", error);
    return NextResponse.json(
      { error: "Ariza yuborishda xatolik yuz berdi. Iltimos qayta urinib ko'ring." },
      { status: 500 }
    );
  }
}
