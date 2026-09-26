// L13: a dynamic page must 404 on an unknown id instead of rendering a 200 soft-404.
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: () => {
    const error = new Error("NEXT_NOT_FOUND") as Error & { digest: string };
    error.digest = "NEXT_NOT_FOUND";
    throw error;
  },
}));

import LessonPlayerPage from "@/app/kabinet/kurs/[id]/dars/[lessonId]/page";
import CertificateVerificationPage, { generateMetadata } from "@/app/shahodatnoma/[code]/page";

// vitest transpiles .tsx with the classic JSX runtime, so page components that
// actually return markup need React in scope (the 404 paths never reach the JSX).
const { createElement, Fragment } = await import("react");
(globalThis as { React?: unknown }).React = { createElement, Fragment };

const COURSE_ID = "11111111-1111-4111-8111-111111111111";
const LESSON_ID = "22222222-2222-4222-8222-222222222222";

async function expectNotFound(run: () => Promise<unknown>) {
  await expect(run()).rejects.toMatchObject({ digest: "NEXT_NOT_FOUND" });
}

describe("L13 dynamic pages", () => {
  it("renders the lesson player for a valid course/lesson pair", async () => {
    const node = await LessonPlayerPage({ params: Promise.resolve({ id: COURSE_ID, lessonId: LESSON_ID }) });
    expect(node).toBeTruthy();
  });

  it.each([
    ["empty course id", { id: "", lessonId: LESSON_ID }],
    ["blank course id", { id: "   ", lessonId: LESSON_ID }],
    ["non-uuid course id", { id: "abc", lessonId: LESSON_ID }],
    ["empty lesson id", { id: COURSE_ID, lessonId: "" }],
    ["non-uuid lesson id", { id: COURSE_ID, lessonId: "not-a-uuid" }],
  ])("404s on %s", async (_label, params) => {
    await expectNotFound(() => LessonPlayerPage({ params: Promise.resolve(params) }));
  });

  it("renders a certificate for a valid code", async () => {
    const node = await CertificateVerificationPage({ params: Promise.resolve({ code: "NAQSH-2026-ABCDE" }) });
    expect(node).toBeTruthy();
  });

  it.each([
    ["empty", ""],
    ["a space", "bad%20code"],
    ["punctuation", "abc!def"],
    ["trailing dash", "NAQSH-2026-"],
    ["a path traversal", "..%2F..%2Fadmin"],
  ])("404s on a certificate code with %s", async (_label, code) => {
    await expectNotFound(() => CertificateVerificationPage({ params: Promise.resolve({ code }) }));
  });

  it("keeps the demo e2e code working and titles unknown codes as not found", async () => {
    const valid = await generateMetadata({ params: Promise.resolve({ code: "DEMO2026" }) });
    const missing = await generateMetadata({ params: Promise.resolve({ code: "not a code!" }) });
    expect(valid.title).toContain("DEMO2026");
    expect(missing.title).toBe("Sertifikat topilmadi | Naqsh");
  });
});
