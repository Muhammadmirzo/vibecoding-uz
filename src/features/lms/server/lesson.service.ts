import type { CheckLessonAccessInput, DripAccessResult } from "@/lib/validations";
import { ServiceError } from "@/lib/http/errors";
import type {
  LessonRepository,
  LessonWithContext,
  SectionLessonItem,
} from "./lesson.repository";

export interface LessonAccessChecker {
  check(input: CheckLessonAccessInput): Promise<DripAccessResult>;
}

export interface LessonDetail {
  course: { id: string; slug: string; title: string };
  section: { id: string; title: string };
  lesson: Omit<LessonWithContext["lesson"], "promptsJson" | "materialsJson"> & {
    promptsJson: unknown;
    materialsJson: unknown;
  };
  lessons: SectionLessonItem[];
}

export type LessonDetailOutcome =
  | { ok: true; detail: LessonDetail }
  | { ok: false; reason: string; message: string };

/**
 * Lesson detail use case (read-only, no transaction). A locked lesson is
 * returned as data — not thrown — so the route keeps the exact legacy
 * 403 contract (`{ error, reason }`).
 */
export async function getLessonDetail(
  repo: LessonRepository,
  access: LessonAccessChecker,
  input: CheckLessonAccessInput,
): Promise<LessonDetailOutcome> {
  const row = await repo.findLessonWithContext(input.lessonId);
  if (!row) {
    throw new ServiceError("NOT_FOUND", "Dars topilmadi", 404);
  }
  const gate = await access.check(input);
  if (!gate.unlocked) {
    return { ok: false, reason: gate.reason, message: gate.message };
  }
  const siblings = await repo.listSectionLessons(row.section.id);
  return {
    ok: true,
    detail: {
      course: { id: row.course.id, slug: row.course.slug, title: row.course.title },
      section: { id: row.section.id, title: row.section.title },
      lesson: {
        ...row.lesson,
        promptsJson: row.lesson.promptsJson ?? [],
        materialsJson: row.lesson.materialsJson ?? [],
      },
      lessons: siblings,
    },
  };
}
