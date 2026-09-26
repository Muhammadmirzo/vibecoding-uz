import { describe, expect, it } from "vitest";
import { COURSES } from "@/features/courses/content";
import { DASTUR_BLOCKS, DASTUR_COURSE_SLUG, groupIntoWeaveBlocks } from "./curriculum";
import { UZ_GHEIRA_U02BB } from "./uzText";

describe("groupIntoWeaveBlocks", () => {
  it("pairs the 8 published weeks into 4 blocks with honest labels", () => {
    expect(DASTUR_BLOCKS.map((block) => block.label)).toEqual([
      "1–2 hafta",
      "3–4 hafta",
      "5–6 hafta",
      "7–8 hafta",
    ]);
    expect(DASTUR_BLOCKS.every((block) => block.topics.length === 2)).toBe(true);
  });

  it("keeps every week exactly once, in order (no invented curriculum)", () => {
    const weeks = DASTUR_BLOCKS.flatMap((block) => block.topics.map((topic) => topic.weekNumber));
    expect(weeks).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"]);
    expect(DASTUR_BLOCKS.flatMap((block) => block.projects)).toHaveLength(8);
  });

  it("uses the real course roadmap as its only source of copy", () => {
    const roadmap = COURSES[DASTUR_COURSE_SLUG].roadmap;
    expect(DASTUR_BLOCKS[0]?.topics[0]?.title).toBe(roadmap[0]?.title);
    expect(DASTUR_BLOCKS[3]?.topics[1]?.title).toBe(roadmap[7]?.title);
  });

  it("renders display copy with U+02BB instead of the ASCII apostrophe", () => {
    const allTitles = DASTUR_BLOCKS.flatMap((block) => block.topics.map((topic) => topic.title)).join(" ");
    expect(allTitles).toContain(UZ_GHEIRA_U02BB);
    expect(allTitles).not.toContain("'");
  });

  it("never emits an empty or partial block", () => {
    expect(groupIntoWeaveBlocks(COURSES[DASTUR_COURSE_SLUG].roadmap, 0)).toEqual([]);
    expect(groupIntoWeaveBlocks(COURSES[DASTUR_COURSE_SLUG].roadmap, 8)).toHaveLength(1);
  });
});
