import { STRAND_KEYS, type StrandKey } from "./strands";

export interface HomeLoomSection {
  id: string;
  strand: StrandKey;
}

/**
 * Registry of home-page sections that have shipped and claimed a loom
 * strand, per §1 of docs/redesign/awwwards/02-art-direction.md. This is the
 * whole integration point later slices (E2..E6) need: wrap the new section's
 * markup (with a matching `data-lab-section="<id>"`) as a <HomeLoom> child
 * and add one entry here. HomeLoom derives which strands are still "muted"
 * (faint guide, no section yet) from whatever isn't listed.
 */
export const HOME_LOOM_SECTIONS: readonly HomeLoomSection[] = [
  { id: "muammo", strand: "square" },
  { id: "usul", strand: "diamond" },
  { id: "dastur", strand: "weave" },
  { id: "natijalar", strand: "ring" },
  { id: "narx", strand: "fill" },
  { id: "boshlash", strand: "glow" },
];

/**
 * Strands with no registered section yet — the faint, unfinished guide state.
 *
 * All six strands are now registered (Wave E, slice E6 shipped `boshlash` ->
 * `glow`), so this returns []: the star is fully woven and the loom shows no
 * muted strand. The earlier `strand !== "glow"` special case existed only
 * because the glow halo rests at opacity 0 in the SVG while no section claimed
 * it; now that `boshlash` claims it, glow is muted by the same rule as every
 * other strand, and the registry is the single source of truth.
 */
export function mutedHomeStrands(sections: readonly HomeLoomSection[] = HOME_LOOM_SECTIONS): StrandKey[] {
  const active = new Set(sections.map((section) => section.strand));
  return STRAND_KEYS.filter((strand) => !active.has(strand));
}
