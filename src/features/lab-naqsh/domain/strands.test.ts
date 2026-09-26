import { describe, expect, it } from "vitest";
import {
  STORY_SECTIONS,
  STRAND_KEYS,
  clamp01,
  sectionScrollRange,
  strandDashOffset,
  strandForSection,
} from "./strands";

describe("clamp01", () => {
  it("passes through values inside [0,1]", () => {
    expect(clamp01(0.42)).toBe(0.42);
  });
  it("clamps below 0 and above 1", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
  });
  it("treats NaN as 0", () => {
    expect(clamp01(Number.NaN)).toBe(0);
  });
});

describe("strandDashOffset", () => {
  it("is fully hidden at progress 0", () => {
    expect(strandDashOffset(0)).toBe(1);
  });
  it("is fully drawn at progress 1", () => {
    expect(strandDashOffset(1)).toBe(0);
  });
  it("is linear in between", () => {
    expect(strandDashOffset(0.25)).toBeCloseTo(0.75);
  });
});

describe("sectionScrollRange", () => {
  it("divides the scroll into equal, contiguous ranges", () => {
    const total = STORY_SECTIONS.length;
    const ranges = STORY_SECTIONS.map((_, i) => sectionScrollRange(i, total));
    expect(ranges[0].start).toBe(0);
    expect(ranges[ranges.length - 1].end).toBe(1);
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i].start).toBeCloseTo(ranges[i - 1].end);
    }
  });
  it("clamps an out-of-range index instead of throwing", () => {
    expect(() => sectionScrollRange(99, 6)).not.toThrow();
    expect(sectionScrollRange(99, 6).end).toBe(1);
  });
  it("returns the full range for a non-positive total", () => {
    expect(sectionScrollRange(0, 0)).toEqual({ start: 0, end: 1 });
  });
});

describe("strandForSection", () => {
  it("maps every declared section id to a known strand", () => {
    for (const section of STORY_SECTIONS) {
      expect(STRAND_KEYS).toContain(strandForSection(section.id));
    }
  });
  it("falls back to square for an unknown id", () => {
    expect(strandForSection("nomavjud")).toBe("square");
  });
  it("has exactly the 6 story sections from the art-direction spec", () => {
    expect(STORY_SECTIONS.map((s) => s.id)).toEqual([
      "muammo",
      "usul",
      "dastur",
      "natijalar",
      "narx",
      "boshlash",
    ]);
  });
});
