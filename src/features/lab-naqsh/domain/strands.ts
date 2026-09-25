/**
 * Pure mapping: story sections -> loom star strands (AWWWARDS slice 1).
 * No I/O, no DOM, no GSAP here — the UI layer (useLoomMotion) reads this
 * to know which SVG strand to scrub for which section, and GSAP itself
 * does the imperative drawing.
 */

export const STRAND_KEYS = ["square", "diamond", "weave", "ring", "fill", "glow"] as const;
export type StrandKey = (typeof STRAND_KEYS)[number];

export interface StorySectionMeta {
  id: string;
  strand: StrandKey;
  headline: string;
  body: string;
}

/**
 * §1 of docs/redesign/awwwards/02-art-direction.md, sections 1-6 (the hero
 * demo, section 0, is a separate slice). Copy is placeholder — honesty rule:
 * no invented numbers, reviews or students. Every body line is tagged
 * PLACEHOLDER so it can never be mistaken for shipped copy.
 */
export const STORY_SECTIONS: readonly StorySectionMeta[] = [
  {
    id: "muammo",
    strand: "square",
    headline: "Dasturlashni o'rganish yo'li chalkash.",
    body: "PLACEHOLDER — muammoning qisqa tavsifi shu yerga keladi.",
  },
  {
    id: "usul",
    strand: "diamond",
    headline: "Vibe coding: g'oyadan ishlaydigan mahsulotgacha.",
    body: "PLACEHOLDER — usul 3 qadamda qanday ishlashi shu yerda tushuntiriladi.",
  },
  {
    id: "dastur",
    strand: "weave",
    headline: "Har hafta — bitta yangi qatlam.",
    body: "PLACEHOLDER — haftalik dastur tuzilishi shu yerga qo'yiladi.",
  },
  {
    id: "natijalar",
    strand: "ring",
    headline: "Talabalar nima qurishi mumkin.",
    body: "PLACEHOLDER — real loyihalar shu yerda ko'rsatiladi, o'ylab topilgan raqamsiz.",
  },
  {
    id: "narx",
    strand: "fill",
    headline: "Narx — aniq va oddiy.",
    body: "PLACEHOLDER — narx va savol-javoblar shu yerga keladi.",
  },
  {
    id: "boshlash",
    strand: "glow",
    headline: "Naqsh to'liq to'qildi.",
    body: "PLACEHOLDER — yakuniy chaqiriq matni shu yerga keladi.",
  },
] as const;

/** Clamp to [0, 1]; every progress value fed to the SVG passes through this. */
export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/**
 * stroke-dashoffset for a pathLength=1 strand: fully hidden at progress 0,
 * fully drawn at progress 1.
 */
export function strandDashOffset(progress: number): number {
  return 1 - clamp01(progress);
}

export interface ScrollRange {
  start: number;
  end: number;
}

/**
 * Equal-width [start,end] scroll fraction owned by section `index` out of
 * `total` sections laid out one after another. Pure arithmetic so the loom
 * timeline can be unit-tested without a browser or ScrollTrigger.
 */
export function sectionScrollRange(index: number, total: number): ScrollRange {
  if (total <= 0) return { start: 0, end: 1 };
  const safeIndex = Math.min(Math.max(index, 0), total - 1);
  const start = safeIndex / total;
  const end = (safeIndex + 1) / total;
  return { start, end };
}

/** Look up a section's strand by id; falls back to "square" if unknown. */
export function strandForSection(id: string): StrandKey {
  return STORY_SECTIONS.find((section) => section.id === id)?.strand ?? "square";
}
