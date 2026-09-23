import { seedBlog } from "./blog";
import { seedCohorts } from "./cohorts";
import { seedCourses } from "./courses";
import { seedEnrollments } from "./enrollments";
import { seedExperts } from "./experts";
import { seedFaqs } from "./faq";
import { seedGlossary } from "./glossary";
import { seedJobs } from "./jobs";
import { seedTestimonials } from "./testimonials";
import type { SeedContext } from "./types";
import { seedUsers } from "./users";

export async function runSeeders(): Promise<void> {
  console.log("🌱 Database seeder ishga tushirildi...");
  const context: SeedContext = {
    adminUser: undefined,
    mentorUser: undefined,
    studentUsers: [],
    allAssignments: [],
    seededCohortId: "",
  };

  await seedUsers(context);
  await seedCourses(context);
  await seedCohorts(context);
  await seedEnrollments(context);
  await seedBlog();
  await seedGlossary();
  await seedTestimonials(context);
  await seedExperts(context);
  await seedFaqs();
  await seedJobs();
  console.log("🎉 Seeding completed successfully with full realistic Uzbek data!");
}
