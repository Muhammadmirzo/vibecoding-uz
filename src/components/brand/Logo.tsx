import {
  LOGO_CARET,
  LOGO_CARET_STROKE,
  LOGO_CURSOR,
  LOGO_DIAMOND,
  LOGO_SQUARE_SEGMENTS,
  LOGO_STROKE,
  LOGO_VIEWBOX,
  type LogoColors,
} from "./logoGeometry";

/**
 * Naqsh brand mark — an 8-point interlaced girih star with a `>_` prompt.
 * Geometry lives in ./logoGeometry (single source for every logo render).
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

function strokes(variant: LogoVariant): LogoColors {
  if (variant === "mono") {
    return { square: "currentColor", diamond: "currentColor", caret: "currentColor" };
  }
  return { square: "var(--brand)", diamond: "var(--gold)", caret: "var(--accent)" };
}

/**
 * The mark's shapes without the <svg> wrapper, as one intrinsic <g>.
 * next/og (Satori) only accepts intrinsic elements inside <svg>, so icon/OG
 * routes CALL it as a function: `{LogoMarkShapes({ colors })}`.
 */
export function LogoMarkShapes({ colors }: { colors: LogoColors }) {
  return (
    <g>
      {/* Diamond — full strand, drawn first (under) */}
      <path d={LOGO_DIAMOND} stroke={colors.diamond} strokeWidth={LOGO_STROKE} strokeLinejoin="miter" className="naqsh-mark-diamond" />
      {/* Square — 4 corner strokes on top; the gaps let the diamond pass over */}
      <g stroke={colors.square} strokeWidth={LOGO_STROKE} strokeLinejoin="miter" strokeLinecap="butt" className="naqsh-mark-square">
        {LOGO_SQUARE_SEGMENTS.map((points) => (
          <polyline key={points} points={points} />
        ))}
      </g>
      {/* `>_` prompt */}
      <g stroke={colors.caret} strokeWidth={LOGO_CARET_STROKE} strokeLinecap="round" strokeLinejoin="round" className="naqsh-mark-caret">
        <polyline points={LOGO_CARET} />
        <line {...LOGO_CURSOR} />
      </g>
    </g>
  );
}

export function LogoMark({
  size = 32,
  variant = "color",
  className,
  animated = false,
  title = "Naqsh",
}: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={LOGO_VIEWBOX}
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={animated ? `naqsh-logo-animated ${className ?? ""}` : className}
    >
      <LogoMarkShapes colors={strokes(variant)} />
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
