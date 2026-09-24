/**
 * Naqsh mark geometry — the ONLY place the logo shape is defined.
 * Logo.tsx, apple-icon, opengraph-image and the static SVGs
 * (scripts/brand/build-logo-svgs.ts) all render from these constants.
 *
 * 32-unit grid, centre (16,16). Two equal squares form an 8-point girih star:
 * - Square: axis-aligned, half-side 9 → edges at 7 and 25.
 * - Diamond: the same square rotated 45° → vertices 9√2 ≈ 12.73 from centre.
 * They cross at 8 points (±3.73 from each edge midpoint). Walking clockwise,
 * the strands alternate over/under: the diamond is drawn first (full), the
 * square on top as 4 corner strokes with a gap at every other crossing, so
 * the diamond shows through there. No masks or background colour needed.
 * Centre: `>_` terminal prompt — craft meets code.
 */

export const LOGO_VIEWBOX = "0 0 32 32";
export const LOGO_STROKE = 2.5;
export const LOGO_CARET_STROKE = 2.25;

export const LOGO_DIAMOND = "M16 3.27 L28.73 16 L16 28.73 L3.27 16 Z";

/** Square as 4 corner strokes; gaps (4.5 wide) centred on the "under" crossings. */
export const LOGO_SQUARE_SEGMENTS = [
  "14.52,7 25,7 25,10.02",
  "25,14.52 25,25 21.98,25",
  "17.48,25 7,25 7,21.98",
  "7,17.48 7,7 10.02,7",
] as const;

export const LOGO_CARET = "11.75,12.75 15,16 11.75,19.25";
export const LOGO_CURSOR = { x1: 16.75, y1: 19.25, x2: 20.25, y2: 19.25 } as const;

/** Hex values for contexts without CSS variables (icons, OG, static SVG). */
export const LOGO_HEX = {
  square: "#1440A0",
  diamond: "#E8A317",
  caret: "#0FA3A3",
  ink: "#0E1A2B",
  ivory: "#FAF7F0",
} as const;

export interface LogoColors {
  square: string;
  diamond: string;
  caret: string;
}

/** Inner SVG markup of the mark (no <svg> wrapper) for static generation. */
export function logoMarkInnerSvg(c: LogoColors): string {
  const segments = LOGO_SQUARE_SEGMENTS.map((p) => `    <polyline points="${p}"/>`).join("\n");
  return [
    `  <path d="${LOGO_DIAMOND}" stroke="${c.diamond}" stroke-width="${LOGO_STROKE}" stroke-linejoin="miter"/>`,
    `  <g stroke="${c.square}" stroke-width="${LOGO_STROKE}" stroke-linejoin="miter" stroke-linecap="butt">`,
    segments,
    `  </g>`,
    `  <g stroke="${c.caret}" stroke-width="${LOGO_CARET_STROKE}" stroke-linecap="round" stroke-linejoin="round">`,
    `    <polyline points="${LOGO_CARET}"/>`,
    `    <line x1="${LOGO_CURSOR.x1}" y1="${LOGO_CURSOR.y1}" x2="${LOGO_CURSOR.x2}" y2="${LOGO_CURSOR.y2}"/>`,
    `  </g>`,
  ].join("\n");
}
