import { describe, expect, it } from "vitest";
import { getLessonDetail } from "@/features/lms/server/lesson.service";
import type {
  LessonRepository,
  LessonWithContext,
  SectionLessonItem,
} from "@/features/lms/server/lesson.repository";
import type { CheckLessonAccessInput, DripAccessResult } from "@/lib/validations";

function makeContext(): LessonWithContext {
  return {
    lesson: {
      id: "66666666-6666-4666-8666-666666666666",
      sectionId: "sec-1",
      title: "Intro",
      slug: "intro",
      videoUrl: null,
      videoHlsUrl: null,
      durationSec: 600,
      contentMd: null,
      sortOrder: 0,
      isFreePreview: false,
      dripRule: "none",
      dripValue: null,
      promptsJson: null,
      materialsJson: null,
    },
    section: {
      id: "sec-1",
      courseId: "course-1",
      title: "1-modul",
      description: null,
      sortOrder: 0,
    },
    course: {
      id: "course-1",
      slug: "vibe-coding-express",
      title: "Vibe Coding Express",
      subtitle: null,
      description: null,
      coverUrl: null,
      level: "Boshlang'ich",
      durationWeeks: 8,
      priceSum: "2990000.00",
      oldPriceSum: null,
      installmentMonths: 3,
      status: "published",
      seoTitle: null,
      seoDescription: null,
      sortOrder: 0,
      createdAt: new Date("2026-01-01T00:00:00Z"),
    },
  };
}

const siblings: SectionLessonItem[] = [
  { id: "66666666-6666-4666-8666-666666666666", title: "Intro", sortOrder: 0, durationSec: 600 },
  { id: "77777777-7777-4777-8777-777777777777", title: "Setup", sortOrder: 1, durationSec: 900 },
];

function makeRepo(row: LessonWithContext | null): LessonRepository {
  return {
    findLessonWithContext: async () => row,
    listSectionLessons: async () => siblings,
  };
}

function allow(unlocked: boolean, reason: DripAccessResult["reason"] = "unlocked", message = "Dars ochiq."): {
  check: (input: CheckLessonAccessInput) => Promise<DripAccessResult>;
} {
  return {
    check: async () => ({ unlocked, reason, message }),
  };
}

const input: CheckLessonAccessInput = {
  userId: "88888888-8888-4888-8888-888888888888",
  lessonId: "66666666-6666-4666-8666-666666666666",
};

describe("getLessonDetail", () => {
  it("returns course/section/lesson/siblings for unlocked lessons", async () => {
    const outcome = await getLessonDetail(makeRepo(makeContext()), allow(true), input);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.detail.course).toMatchObject({ slug: "vibe-coding-express" });
    expect(outcome.detail.section).toMatchObject({ id: "sec-1" });
    expect(outcome.detail.lesson.promptsJson).toEqual([]);
    expect(outcome.detail.lesson.materialsJson).toEqual([]);
    expect(outcome.detail.lessons).toHaveLength(2);
  });

  it("throws NOT_FOUND for missing lessons", async () => {
    await expect(getLessonDetail(makeRepo(null), allow(true), input)).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });

  it("returns the gate reason as data for locked lessons", async () => {
    const outcome = await getLessonDetail(
      makeRepo(makeContext()),
      allow(false, "not_enrolled", "Ushbu darsni ko'rish uchun kursga a'zo bo'ling."),
      input,
    );
    expect(outcome).toEqual({
      ok: false,
      reason: "not_enrolled",
      message: "Ushbu darsni ko'rish uchun kursga a'zo bo'ling.",
    });
  });
});
