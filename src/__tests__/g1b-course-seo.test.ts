import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cohortDateToIso, parseCohortDate } from "@/features/courses/domain/cohort-date";
import { courseJsonLd } from "@/lib/seo";
import { siteConfig } from "@/lib/siteConfig";
import { COURSES, COURSE_SLUGS, getCoursePricing } from "@/features/courses/content";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("course schema.org startDate (g1b)", () => {
  it("converts the human cohort date to an ISO 8601 calendar date", () => {
    expect(cohortDateToIso(siteConfig.nextCohortDate)).toMatch(ISO_DATE);
    expect(cohortDateToIso("15-Oktyabr, 2026")).toBe("2026-10-15");
    expect(cohortDateToIso("3-sentyabr, 2027")).toBe("2027-09-03");
  });

  it("returns null instead of a broken date for unparseable copy", () => {
    for (const bad of ["", "keyingi guruh", "2026-10-15", "32-Oktyabr, 2026"]) {
      expect(cohortDateToIso(bad)).toBeNull();
    }
  });

  it("keeps the countdown parser and the schema parser in agreement", () => {
    const parsed = parseCohortDate(siteConfig.nextCohortDate);
    expect(parsed?.getFullYear()).toBe(Number(siteConfig.nextCohortDate.match(/(\d{4})/)?.[1]));
  });

  it("emits an ISO startDate in the Course JSON-LD, never the Uzbek string", () => {
    const jsonLd = courseJsonLd({
      name: COURSES["vibe-coding-express"].title,
      description: "test",
      price: getCoursePricing("vibe-coding-express").price,
      path: "/kurs/vibe-coding-express",
      startDate: siteConfig.nextCohortDate,
    });
    const instance = jsonLd.hasCourseInstance as { startDate?: string };
    expect(instance.startDate).toMatch(ISO_DATE);
    expect(instance.startDate).not.toContain("Oktyabr");
  });

  it("omits startDate rather than emitting an invalid one", () => {
    const jsonLd = courseJsonLd({ name: "x", description: "y", price: "1 so'm", path: "/kurs/x", startDate: "nonsense" });
    expect((jsonLd.hasCourseInstance as Record<string, unknown>).startDate).toBeUndefined();
  });
});

describe("course OG image (g1b)", () => {
  const ogPath = join(process.cwd(), "src/app/kurs/[slug]/opengraph-image.tsx");

  it("exists and reuses the root OG pattern (ImageResponse, 1200x630, edge)", () => {
    expect(existsSync(ogPath)).toBe(true);
    const source = readFileSync(ogPath, "utf8");
    expect(source).toContain("ImageResponse");
    expect(source).toContain('width: 1200, height: 630');
    expect(source).toContain('runtime = "edge"');
  });

  it("prints the real price from siteConfig instead of a literal", () => {
    const source = readFileSync(ogPath, "utf8");
    expect(source).toContain("getCoursePricing");
    for (const course of Object.values(siteConfig.courses)) {
      expect(source).not.toContain(course.price);
    }
  });

  it("covers every course slug", () => {
    expect(COURSE_SLUGS.length).toBeGreaterThan(0);
    for (const slug of COURSE_SLUGS) expect(COURSES[slug]).toBeDefined();
  });
});
