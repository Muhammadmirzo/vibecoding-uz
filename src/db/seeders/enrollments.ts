import { db } from "../index";
import { enrollments, homeworkReviews, homeworkSubmissions, payments } from "../schema";
import type { SeedContext } from "./types";

const STATUSES: Array<"submitted" | "reviewing" | "approved" | "rejected"> = [
  "submitted", "reviewing", "approved", "rejected",
];

export async function seedEnrollments(context: SeedContext): Promise<void> {
  console.log("4/10 Enrollments, Lesson Progress, Submissions & Reviews seeding...");
  if (!context.seededCohortId || context.studentUsers.length === 0) return;

  for (let index = 0; index < context.studentUsers.length; index++) {
    const student = context.studentUsers[index];
    const [enrollment] = await db
      .insert(enrollments)
      .values({ userId: student.id, cohortId: context.seededCohortId, status: "active", source: index % 2 === 0 ? "quiz" : "form" })
      .onConflictDoNothing()
      .returning();

    if (enrollment) {
      await db.insert(payments).values({
        userId: student.id,
        enrollmentId: enrollment.id,
        provider: index % 2 === 0 ? "payme" : "click",
        providerTxnId: `TXN_${Date.now()}_${index}`,
        amountSum: "2490000.00",
        status: "paid",
        paidAt: new Date(),
      }).onConflictDoNothing();
    }

    if (context.allAssignments.length === 0) continue;
    const assignment = context.allAssignments[index % context.allAssignments.length];
    const status = STATUSES[index % STATUSES.length];
    const [submission] = await db
      .insert(homeworkSubmissions)
      .values({
        assignmentId: assignment.id,
        userId: student.id,
        attemptNo: 1,
        payload: {
          githubUrl: `https://github.com/${student.tgUsername || "student"}/vibe-project-${index + 1}`,
          fileUrls: ["https://academy.mirzo.uz/uploads/demo-submission.png"],
          note: "Assalomu alaykum mentor. 1-vazifamni bajardim, iltimos tekshirib bering.",
        },
        status,
        submittedAt: new Date(Date.now() - (index + 1) * 3600 * 1000),
      })
      .onConflictDoNothing()
      .returning();

    if (submission && (status === "approved" || status === "rejected") && context.mentorUser) {
      await db.insert(homeworkReviews).values({
        submissionId: submission.id,
        mentorId: context.mentorUser.id,
        criteriaResults: [
          { criterion: "Loyiha arxitekturasi", score: status === "approved" ? 9 : 4, maxScore: 10 },
          { criterion: "AI prompt tozaligi", score: status === "approved" ? 10 : 5, maxScore: 10 },
        ],
        score: status === "approved" ? "9.50" : "4.50",
        feedbackMd: status === "approved"
          ? "Barakalla! Juda ajoyib bajarilgan. Code pattern va promptlar to'liq talabga javob beradi."
          : "Vazifada kamchiliklar bor. AGENTS.md fayli noto'g'ri sozlangan, qayta ko'rib chiqing.",
        reviewedAt: new Date(),
      }).onConflictDoNothing();
    }
  }
}
