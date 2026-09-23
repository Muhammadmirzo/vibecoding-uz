import { db } from "../index";
import { experts } from "../schema";
import type { SeedContext } from "./types";

export async function seedExperts(context: SeedContext): Promise<void> {
  console.log("8/10 Verified Expert Profiles seeding...");
  if (!context.mentorUser) return;
  await db.insert(experts).values({
    userId: context.mentorUser.id,
    slug: "alisher-zokirov-ai-mentor",
    tagline: "Senior AI & Vibe Coding Architect | 5+ yillik amaliy tajriba",
    skills: ["Claude Code", "Cursor IDE", "Next.js", "Drizzle ORM", "Prompt Engineering"],
    gradesJson: { experienceYears: 5, completedProjects: 34, rating: 4.95 },
    availableForWork: true,
    status: "verified",
  }).onConflictDoNothing();
}
