import { describe, expect, it } from "vitest";
import {
  normalizeQuizContact,
  submitFreeLessonLead,
  type QuizRepository,
} from "@/features/quiz/server/quiz.service";

function makeRepo(stored: unknown[]): QuizRepository {
  return {
    insertLead: async () => ({ id: "quiz-lead" }),
    insertFreeLessonLead: async (input) => {
      stored.push(input);
      return { id: "free-lead-1" };
    },
    findCourseIdBySlug: async () => null,
  };
}

describe("normalizeQuizContact", () => {
  it("passes @usernames through and normalizes digit formats", () => {
    expect(normalizeQuizContact("@Test_User1")).toBe("@Test_User1");
    expect(normalizeQuizContact("901234567")).toBe("+998901234567");
    expect(normalizeQuizContact("+99890 123-45-67")).toBe("+998901234567");
    expect(normalizeQuizContact("998901234567")).toBe("+998901234567");
  });

  it("handles non-strings and empties without throwing", () => {
    expect(normalizeQuizContact(undefined)).toBe("");
    expect(normalizeQuizContact(null)).toBe("");
    expect(normalizeQuizContact(123)).toBe("");
    expect(normalizeQuizContact("   ")).toBe("");
  });
});

describe("submitFreeLessonLead", () => {
  it("persists the validated payload with free_lesson defaults", async () => {
    const stored: unknown[] = [];
    const outcome = await submitFreeLessonLead(makeRepo(stored), {
      name: "Ali Vali",
      phone: "+998901234567",
      status: "new",
    });
    expect(outcome).toEqual({ leadId: "free-lead-1" });
    expect(stored).toEqual([
      {
        name: "Ali Vali",
        phone: "+998901234567",
        telegram: null,
        status: "new",
        recommendedCourseId: null,
        quizAnswers: null,
        utm: null,
      },
    ]);
  });

  it("supports telegram-only contact with extra payload", async () => {
    const stored: unknown[] = [];
    await submitFreeLessonLead(makeRepo(stored), {
      name: "Tg User",
      telegram: "@tg_user",
      status: "new",
      recommendedCourseId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      quizAnswers: { answers: { q1: "a" } },
      utm: { source: "instagram" },
    });
    expect(stored[0]).toMatchObject({
      phone: null,
      telegram: "@tg_user",
      quizAnswers: { answers: { q1: "a" } },
      utm: { source: "instagram" },
    });
  });
});
