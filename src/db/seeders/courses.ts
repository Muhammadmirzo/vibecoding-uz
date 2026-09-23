import { eq } from "drizzle-orm";
import { db } from "../index";
import { courses, courseSections, homeworkAssignments, lessons } from "../schema";
import { COURSES_DATA, EXPRESS_SECTIONS_DATA } from "./data/courses";
import type { SeedContext } from "./types";

export async function seedCourses(context: SeedContext): Promise<void> {
  console.log("2/10 Courses, Sections, Lessons & Homeworks seeding...");
  const [courseExpress] = await db.insert(courses).values(COURSES_DATA[0]).onConflictDoNothing().returning();
  const [courseBasics] = await db.insert(courses).values(COURSES_DATA[1]).onConflictDoNothing().returning();

  context.targetExpressId = courseExpress?.id
    ?? (await db.select().from(courses).where(eq(courses.slug, "vibe-coding-express")))[0]?.id;
  context.targetBasicsId = courseBasics?.id
    ?? (await db.select().from(courses).where(eq(courses.slug, "ai-asoslari")))[0]?.id;

  if (!context.targetExpressId) return;
  for (const sectionData of EXPRESS_SECTIONS_DATA) {
    const [section] = await db
      .insert(courseSections)
      .values({ courseId: context.targetExpressId, title: sectionData.title, description: sectionData.description, sortOrder: sectionData.sortOrder })
      .onConflictDoNothing()
      .returning();
    if (!section) continue;

    let lessonOrder = 1;
    for (const lessonData of sectionData.lessons) {
      const [lesson] = await db
        .insert(lessons)
        .values({
          sectionId: section.id,
          slug: lessonData.slug,
          title: lessonData.title,
          videoUrl: lessonData.videoUrl,
          durationSec: lessonData.durationSec,
          contentMd: lessonData.contentMd,
          promptsJson: lessonData.promptsJson,
          materialsJson: lessonData.materialsJson,
          isFreePreview: lessonData.isFreePreview,
          sortOrder: lessonOrder++,
        })
        .onConflictDoNothing()
        .returning();
      if (!lesson) continue;

      const [assignment] = await db
        .insert(homeworkAssignments)
        .values({
          lessonId: lesson.id,
          title: `${lessonData.title} bo'yicha amaliy vazifa`,
          descriptionMd: `Ushbu vazifada ${lessonData.title} mavzusida o'tilgan bilimlardan foydalanib o'z loyihangizda amaliy natija ko'rsatishingiz lozim.`,
          acceptanceCriteria: [
            { criterion: "Loyiha arxitekturasi va kod tozaligi", weight: 4 },
            { criterion: "AI prompt va javoblarning sifatliligi", weight: 3 },
            { criterion: "Integratsiya va funksionallik to'liqligi", weight: 3 },
          ],
        })
        .onConflictDoNothing()
        .returning();
      if (assignment) context.allAssignments.push(assignment);
    }
  }
}
