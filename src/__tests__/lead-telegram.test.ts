import { describe, expect, it } from "vitest";
import { freeLessonLeadSchema, quizLeadSchema } from "@/lib/validations/crm";

describe("lead contact validation and routing", () => {
  it("accepts a real +998 phone for quiz leads", () => {
    const result = quizLeadSchema.safeParse({ name: "Ali", phone: "+998901234567", source: "quiz" });
    expect(result.success).toBe(true);
  });

  it("rejects a Telegram username for quiz leads", () => {
    const result = quizLeadSchema.safeParse({ name: "Ali", phone: "@ali_user", source: "quiz" });
    expect(result.success).toBe(false);
  });

  it("routes a valid free lesson phone to the phone field", () => {
    const result = freeLessonLeadSchema.safeParse({ name: "Ali", phone: "+998901234567", source: "free_lesson" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("+998901234567");
  });

  it("routes a valid free lesson username to the telegram field", () => {
    const result = freeLessonLeadSchema.safeParse({ name: "Ali", telegram: "@ali_user", source: "free_lesson" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.telegram).toBe("@ali_user");
  });

  it("rejects an invalid phone", () => {
    expect(quizLeadSchema.safeParse({ name: "Ali", phone: "+123", source: "quiz" }).success).toBe(false);
  });

  it("rejects an invalid Telegram username", () => {
    expect(freeLessonLeadSchema.safeParse({ name: "Ali", telegram: "@ab", source: "free_lesson" }).success).toBe(false);
  });

  it("rejects a free lesson lead missing both contacts", () => {
    expect(freeLessonLeadSchema.safeParse({ name: "Ali", source: "free_lesson" }).success).toBe(false);
  });

  it("does not allow quiz routing to be overridden by a free lesson source", () => {
    expect(quizLeadSchema.safeParse({ name: "Ali", phone: "+998901234567", source: "free_lesson" }).success).toBe(false);
  });
});
