import { db } from "../index";
import { testimonials } from "../schema";
import { TESTIMONIALS_DATA } from "./data/content";
import type { SeedContext } from "./types";

export async function seedTestimonials(context: SeedContext): Promise<void> {
  console.log("7/10 Testimonials seeding...");
  for (const testimonial of TESTIMONIALS_DATA) {
    await db.insert(testimonials).values({
      userId: context.studentUsers[0]?.id || context.adminUser?.id,
      courseId: context.targetExpressId,
      type: "text",
      body: testimonial.body,
      rating: testimonial.rating,
      status: testimonial.status,
    }).onConflictDoNothing();
  }
}
