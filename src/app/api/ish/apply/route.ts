import { NextResponse } from "next/server";
import { applyJobSchema } from "@/lib/validations";
import { applyForJob, drizzleJobApplicationsRepository, JobApplyError } from "@/features/jobs/server/apply.service";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { errorResponse } from "@/lib/http/errors";
import { isClosed } from "@/lib/features/closed";

export async function POST(request: Request) {
  // W10: ish o'rinlari vaqtincha yopiq — legacy shaklda 404 (marshrut legacy).
  if (isClosed("jobs")) {
    return NextResponse.json({ error: "Bu bo'lim vaqtincha yopiq" }, { status: 404 });
  }
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
      ip,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Arizangiz qabul qilindi va texnik jihatdan saqlandi. HR jamoasi alohida xabar berish jarayonini boshqaradi.",
        leadId,
        status: "received",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof JobApplyError) {
      const status = error.code === "DUPLICATE" ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    return errorResponse(error);
  }
}
