import { describe, expect, it } from "vitest";
import {
  canonicalTelegramContact,
  isValidTelegramUsername,
  normalizeTelegramUsername,
} from "@/features/leads/domain/telegram-username";
import { freeLessonLeadSchema } from "@/lib/validations/crm";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function repoFile(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Telegram username normalization (g1b)", () => {
  it("accepts a handle with or without the @ sign and stores one canonical form", () => {
    expect(normalizeTelegramUsername("ali")).toBe("@ali");
    expect(normalizeTelegramUsername("@ali")).toBe("@ali");
    expect(normalizeTelegramUsername("  @Ali_1 ")).toBe("@Ali_1");
    expect(normalizeTelegramUsername("@@ali")).toBe("@ali");
  });

  it("rejects handles that cannot be a Telegram username", () => {
    for (const bad of ["", "  ", "ab", "@", "@a b", "ali.karim", "@al!i", 42, null, undefined]) {
      expect(normalizeTelegramUsername(bad)).toBe("");
      expect(isValidTelegramUsername(String(bad ?? ""))).toBe(false);
    }
  });

  it("validates the normalized value against the CRM schema", () => {
    const result = freeLessonLeadSchema.safeParse({
      name: "Ali",
      telegram: normalizeTelegramUsername("ali"),
      source: "free_lesson",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.telegram).toBe("@ali");
  });

  it("normalizes server-side in the lead route, not only in the browser", () => {
    const source = repoFile("src/app/api/quiz/route.ts");
    expect(source).toContain("canonicalTelegramContact");
  });
});

describe("lead copy honesty (g1b)", () => {
  it("no longer tells the visitor that the request was saved to a database", () => {
    const files = [
      "src/features/leads/ui/LeadCaptureForm.tsx",
      "src/app/bepul-dars/LeadSection.tsx",
    ];
    for (const file of files) {
      const source = repoFile(file);
      expect(source).not.toMatch(/bazaga saqlanganini/i);
      expect(source).not.toMatch(/jarayoni alohida boshqariladi/i);
    }
  });

  it("offers a warm, concrete next step instead", () => {
    expect(repoFile("src/app/bepul-dars/LeadSection.tsx")).toMatch(/Telegram/);
    expect(repoFile("src/features/leads/ui/LeadCaptureForm.tsx")).toMatch(/bog'lanamiz/);
  });
});
