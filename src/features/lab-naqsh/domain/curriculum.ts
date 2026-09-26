/**
 * The "Dastur" (curriculum) strand data for home loom section 3
 * (Wave E, slice E3), per §1 row 3 of
 * docs/redesign/awwwards/02-art-direction.md: the visitor must learn
 * "what you'll build week by week", drawn as an over-under weave.
 *
 * Honesty rule (L14): the copy is NOT written here. It is grouped from the
 * real published Vibe Coding Express roadmap in
 * src/features/courses/content.ts, which is the same single source of truth
 * the course page and checkout render — so the home page can never drift into
 * promising weeks the course doesn't teach. Two consecutive weeks become one
 * weave block, matching the 1-2 / 3-4 / 5-6 / 7-8 rhythm of the design.
 *
 * Pure: no I/O, no React, no DB. Unit-tested in curriculum.test.ts.
 */
import { COURSES, type RoadmapWeek } from "@/features/courses/content";
import { uzDisplay } from "./uzText";

/** The 8-week course whose roadmap this section shows. */
export const DASTUR_COURSE_SLUG = "vibe-coding-express";

export interface WeaveTopic {
  /** "1-hafta" -> "1" */
  weekNumber: string;
  /** Display-safe (U+02BB) week title. */
  title: string;
  /** What the student can do after that week. */
  outcome: string;
  /** The artefact the week produces. */
  project: string;
}

export interface WeaveBlock {
  /** Stable key for React lists: "1-2". */
  id: string;
  /** "1–2 hafta" (en dash, U+2013). */
  label: string;
  /** Week titles inside the block, in order. */
  topics: readonly WeaveTopic[];
  /** Projects of the block, in week order. */
  projects: readonly string[];
}

const EXPRESS_ROADMAP: readonly RoadmapWeek[] = COURSES[DASTUR_COURSE_SLUG].roadmap;

function weekNumber(week: string): string {
  const match = /\d+/.exec(week);
  return match ? match[0] : week;
}

function toTopic(week: RoadmapWeek): WeaveTopic {
  return {
    weekNumber: weekNumber(week.week),
    title: uzDisplay(week.title),
    outcome: uzDisplay(week.outcome),
    project: uzDisplay(week.project),
  };
}

/**
 * Groups the 8-week roadmap into consecutive pairs. Returns [] for a
 * non-positive `size` so a bad caller can never render a partial block.
 */
export function groupIntoWeaveBlocks(
  roadmap: readonly RoadmapWeek[] = EXPRESS_ROADMAP,
  size = 2,
): WeaveBlock[] {
  if (size < 1) return [];

  const blocks: WeaveBlock[] = [];
  for (let index = 0; index < roadmap.length; index += size) {
    const chunk = roadmap.slice(index, index + size);
    if (chunk.length === 0) continue;
    const numbers = chunk.map(toTopic).map((topic) => topic.weekNumber);
    blocks.push({
      id: numbers.join("-"),
      label: `${numbers.join("–")} hafta`,
      topics: chunk.map(toTopic),
      projects: chunk.map((week) => uzDisplay(week.project)),
    });
  }
  return blocks;
}

/** The home section's blocks: 4 pairs of the 8-week course. */
export const DASTUR_BLOCKS: readonly WeaveBlock[] = groupIntoWeaveBlocks();
