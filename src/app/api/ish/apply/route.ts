import { NextResponse } from "next/server";
import { applyJobSchema } from "@/lib/validations";
import { applyForJob, drizzleJobApplicationsRepository, JobApplyError } from "@/features/jobs/server/apply.service";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit(`apply:${ip}`, PRESETS.PUBLIC_WRITE);
    if (!rl.success) return createRateLimitResponse(rl);

    const parsed = applyJobSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ma'lumotlar noto'g'ri kiritildi", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { leadId } = await applyForJob(
      drizzleJobApplicationsRepository,
      {
        jobId: parsed.data.jobId,
        jobSlug: parsed.data.jobSlug,
        jobTitle: parsed.data.jobTitle,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        telegramUsername: parsed.data.telegramUsername || null,
        resumeUrl: parsed.data.resumeUrl || null,
        portfolioUrl: parsed.data.portfolioUrl || null,
        experience: parsed.data.experience,
        coverLetter: parsed.data.coverLetter,
      },
      request.headers.get("x-forwarded-for") || "127.0.0.1",
    );

    return NextResponse.json(
      {
        success: true,
        message: "Arizangiz muvaffaqiyatli qabul qilindi! Tez orada siz bilan bog'lanamiz.",
        leadId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof JobApplyError) {
      const status = error.code === "DUPLICATE" ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("POST /api/ish/apply error:", error);
    return NextResponse.json({ error: "Ariza yuborishda xatolik yuz berdi. Iltimos qayta urinib ko'ring." }, { status: 500 });
  }
}
