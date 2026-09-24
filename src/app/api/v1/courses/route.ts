import { z } from "zod";
import { cached, v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { courseCardSchema } from "@/features/mobile/contracts-resources";
import { drizzleMobileRepository } from "@/features/mobile/server/mobile.repository";

registerV1Route({
  method: "get",
  path: "/api/v1/courses",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["courses"],
  summary: "E'lon qilingan kurslar",
  responses: {
    200: { description: "Kurslar", content: { "application/json": { schema: z.object({ items: z.array(courseCardSchema) }) } } },
  },
});

function toCard(c: Awaited<ReturnType<typeof drizzleMobileRepository.listPublishedCourses>>[number]) {
  return {
    id: c.id, slug: c.slug, title: c.title, subtitle: c.subtitle, coverUrl: c.coverUrl,
    level: c.level, durationWeeks: c.durationWeeks,
    priceSum: String(c.priceSum), oldPriceSum: c.oldPriceSum ? String(c.oldPriceSum) : null,
    enrolled: c.enrolled,
  };
}

export async function GET(request: Request) {
  return v1(request, async ({ session }) => {
    const rows = await drizzleMobileRepository.listPublishedCourses(session.userId);
    return cached({ items: rows.map(toCard) }, undefined, 120);
  });
}
