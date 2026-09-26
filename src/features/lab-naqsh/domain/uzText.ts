/**
 * Display-text normalisation for the home loom sections (Wave E, slice E3).
 *
 * §3 of docs/redesign/awwwards/02-art-direction.md: "Unbounded and Onest both
 * contain U+02BB (oʻ gʻ) ... Use U+02BB for the letters in display text so they
 * don't fall back to another font." Most course copy in the repo is typed with
 * a plain ASCII apostrophe (o'rganasiz) because that is what people type; in
 * the big display headings it is the modifier letter turned comma U+02BB that
 * must render, or the font falls back mid-word.
 *
 * Pure string work, no I/O — unit-tested in uzText.test.ts.
 */

/** Modifier letter turned comma — the Uzbek oʻ / gʻ letter. */
export const UZ_GHEIRA_U02BB = "\u02BB";

/**
 * Replaces ASCII apostrophes with U+02BB so course copy sourced from
 * src/features/courses/content.ts can be rendered in the display face
 * without hand-editing the single source of truth. In Uzbek the apostrophe
 * only ever marks the gʻ/oʻ letter (o'rganasiz, to'g'ri, to'lov, ma'lumot), so
 * a blanket replace is correct here — unlike an English word like "don't".
 */
export function uzDisplay(text: string): string {
  return text.replace(/'/g, UZ_GHEIRA_U02BB);
}
