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
];

/**
 * Strands with no registered section yet. `glow` is excluded: it already
 * rests at opacity 0 in the SVG (section 6's pulse-in effect), so muting it
 * further would be a no-op — this only touches strands that would otherwise
 * render at full/near-full opacity as if "finished".
 */
export function mutedHomeStrands(sections: readonly HomeLoomSection[] = HOME_LOOM_SECTIONS): StrandKey[] {
  const active = new Set(sections.map((section) => section.strand));
  return STRAND_KEYS.filter((strand) => strand !== "glow" && !active.has(strand));
}
