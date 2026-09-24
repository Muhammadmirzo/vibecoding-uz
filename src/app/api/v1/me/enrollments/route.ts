import { z } from "zod";
import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { enrollmentSchema } from "@/features/mobile/contracts-resources";
import { drizzleMobileRepository } from "@/features/mobile/server/mobile.repository";

registerV1Route({
  method: "get",
  path: "/api/v1/me/enrollments",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["me"],
  summary: "Mening kurs yozuvlarim",
  responses: {
    200: { description: "Yozuvlar", content: { "application/json": { schema: z.object({ items: z.array(enrollmentSchema) }) } } },
  },
});

export async function GET(request: Request) {
  return v1(request, async ({ session }) => {
    const rows = await drizzleMobileRepository.listMyEnrollments(session.userId);
    return ok({
      items: rows.map(({ enrollment, course, cohort }) => ({
        id: enrollment.id, status: enrollment.status,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        course: { id: course.id, slug: course.slug, title: course.title, coverUrl: course.coverUrl },
        cohort: { id: cohort.id, name: cohort.name, startsAt: cohort.startsAt?.toISOString() ?? null },
      })),
    });
  });
}
