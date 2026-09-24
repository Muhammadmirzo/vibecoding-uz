/**
 * Naqsh brand mark — an 8-point interlaced girih star.
 *
 * Geometry (32-unit grid, pixel-aligned):
 * - Square A: axis-aligned 16×16 square, inset 8 units on every side.
 * - Square B: diamond with vertices at distance 11 from the centre
 *   (16,5) (27,16) (16,27) (5,16) — i.e. square A rotated 45°.
 * - Interlace: the two strokes cross at 8 points. Square B is drawn on top
 *   with a gap at every other crossing (stroke-dasharray in real path units,
 *   no pathLength dependency), so the weave alternates over/under with no
 *   background-colour dependency — the mark works on light, dark and
 *   photographic backgrounds, in browsers and SVG rasterizers alike.
 * - Centre: a `>` prompt caret plus a short cursor bar — craft meets code.
 *
 * Colours come from theme tokens (brand / gold / accent); `mono` uses
 * `currentColor` for single-colour reproduction (footer, print, certificates).
 */

export type LogoVariant = "color" | "mono";

export interface LogoMarkProps {
  /** Rendered pixel size of the square mark (default 32). */
  size?: number;
  /** "color" uses theme tokens, "mono" uses currentColor. */
  variant?: LogoVariant;
  className?: string;
  /**
   * Subtle stroke-draw on first paint. Pure CSS; disabled under
   * `prefers-reduced-motion` and when `<html data-motion="off">`.
   */
  animated?: boolean;
  /** Accessible label; defaults to "Naqsh". Pass null/"" for decorative use. */
  title?: string | null;
}

/**
 * Diamond geometry in real path units (no pathLength — portable across
 * browsers and rasterizers): each edge is 11√2 ≈ 15.556 long; crossings sit
 * 3√2 ≈ 4.243 and 8√2 ≈ 11.314 along every edge. Gaps (2.8 wide, marginally
 * wider than the 2.75 stroke) are centred on each edge's FIRST crossing:
 * D = [4.243, 19.799, 35.354, 50.910]. On-length = 15.556 − 2.8 = 12.756;
 * the gap spans pattern [12.756, 15.556] (centre 14.156), so
 * offset = 14.156 − 4.243 = 9.913.
 */
const DIAMOND_DASH = "12.756 2.8";
const DIAMOND_OFFSET = 9.913;

function strokes(variant: LogoVariant): { square: string; diamond: string; caret: string } {
  if (variant === "mono") {
    return { square: "currentColor", diamond: "currentColor", caret: "currentColor" };
  }
  return { square: "var(--brand)", diamond: "var(--gold)", caret: "var(--accent)" };
}

export function LogoMark({
  size = 32,
  variant = "color",
  className,
  animated = false,
  title = "Naqsh",
}: LogoMarkProps) {
  const c = strokes(variant);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={animated ? `naqsh-logo-animated ${className ?? ""}` : className}
    >
      {/* Square A — axis-aligned, always underneath */}
      <rect
        x="8"
        y="8"
        width="16"
        height="16"
        stroke={c.square}
        strokeWidth="2.75"
        className="naqsh-mark-square"
      />
      {/* Square B — diamond on top, gapped at alternating crossings for the weave */}
      <path
        d="M16 5 L27 16 L16 27 L5 16 Z"
        stroke={c.diamond}
        strokeWidth="2.75"
        strokeLinejoin="round"
        strokeDasharray={DIAMOND_DASH}
        strokeDashoffset={DIAMOND_OFFSET}
        className="naqsh-mark-diamond"
      />
      {/* Prompt caret + cursor bar */}
      <g
        stroke={c.caret}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="naqsh-mark-caret"
      >
        <polyline points="13.5,12.5 17.5,16 13.5,19.5" />
        <line x1="20.5" y1="12.5" x2="20.5" y2="19.5" />
      </g>
    </svg>
  );
}

export interface LogoProps extends LogoMarkProps {
  /** Font size of the wordmark in px; defaults to 0.66 × mark size. */
  wordmarkSize?: number;
}

/**
 * Full lockup: girih mark + lowercase `naqsh` wordmark in font-display
 * with tight tracking.
 */
export function Logo({
  size = 32,
  variant = "color",
  className,
  animated = false,
  title = "Naqsh",
  wordmarkSize,
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} variant={variant} animated={animated} title={title} />
      <span
        aria-hidden={title ? true : undefined}
        className="font-display font-semibold lowercase leading-none text-ink"
        style={{ fontSize: wordmarkSize ?? Math.round(size * 0.66), letterSpacing: "-0.045em" }}
      >
        naqsh
      </span>
    </span>
  );
}
