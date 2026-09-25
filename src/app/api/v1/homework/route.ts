import { z } from "zod";
import { created, fail, ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { homeworkItemSchema, homeworkSubmitSchema } from "@/features/mobile/contracts-resources";
import { listMyHomework, submitHomework } from "@/features/mobile/server/mobile.repository";
import { checkRateLimit, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";

registerV1Route({
  method: "get",
  path: "/api/v1/homework",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["homework"],
  summary: "Mening vazifa topshiriqlarim",
  responses: {
    200: { description: "Topshiriqlar", content: { "application/json": { schema: z.object({ items: z.array(homeworkItemSchema) }) } } },
  },
});

registerV1Route({
  method: "post",
  path: "/api/v1/homework",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["homework"],
  summary: "Vazifa topshirish",
  request: { body: { content: { "application/json": { schema: homeworkSubmitSchema } } } },
  responses: {
    201: { description: "Qabul qilindi", content: { "application/json": { schema: homeworkItemSchema.partial() } } },
  },
});

function toItem(r: Awaited<ReturnType<typeof listMyHomework>>[number]) {
  return {
    id: r.id, assignmentId: r.assignmentId, assignmentTitle: r.assignmentTitle,
    lessonTitle: r.lessonTitle, status: r.status, score: r.score,
    feedbackMd: r.feedbackMd, submittedAt: r.submittedAt.toISOString(), attemptNo: r.attemptNo,
  };
}

export async function GET(request: Request) {
  return v1(request, async ({ session }) => {
    const limit = Math.min(100, Math.max(1, Number(new URL(request.url).searchParams.get("limit") ?? 20) || 20));
    const rows = await listMyHomework(session.userId, limit);
    // Faqat o'z topshiriqlari — so'rovda hech qachon чужой userId qabul qilinmaydi.
    return ok({ items: rows.map(toItem) });
  });
}

export async function POST(request: Request) {
  return v1(request, async ({ session }) => {
    const limited = await checkRateLimit(`homework:${session.userId}`, { ...PRESETS.LOGIN, limit: 20, prefix: "homework-submit" });
    if (!limited.success) return fail(createRateLimitResponse(limited));
    const input = homeworkSubmitSchema.parse(await request.json());
    const createdRow = await submitHomework(session.userId, {
      assignmentId: input.assignmentId, fileUrls: input.fileUrls,
      githubUrl: input.githubUrl, note: input.note,
    });
    const rows = await listMyHomework(session.userId, 100);
    const mine = rows.find((r) => r.id === createdRow.id);
    return created(mine ? toItem(mine) : { id: createdRow.id });
  });
}
