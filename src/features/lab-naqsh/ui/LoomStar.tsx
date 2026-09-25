import { LOGO_DIAMOND, LOGO_SQUARE_SEGMENTS, LOGO_VIEWBOX } from "@/components/brand/logoGeometry";
import { cn } from "@/components/ui/utils";

/**
 * The loom star: the brand mark's 8-point girih geometry (reused from
 * logoGeometry — the square + diamond paths are the single source of
 * truth), rendered large with a few extra strands (weave dots, outer
 * ring, gold fill, glow halo) that the story sections draw on scroll.
 *
 * SSR/no-JS default: every strand is fully drawn/opaque (the "finished"
 * state) — useLoomMotion only *hides* strands with gsap.set() once JS
 * confirms motion is allowed, per the reduced-motion / no-JS rule.
 */
export function LoomStar({ size = 320, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={LOGO_VIEWBOX}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("loom-star overflow-visible", className)}
    >
      <defs>
        <filter id="loom-glow-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      {/* section 4 — outer ring / tessellation hint */}
      <circle
        data-strand="ring"
        cx="16"
        cy="16"
        r="15"
        stroke="var(--accent)"
        strokeWidth="0.35"
        strokeDasharray="1"
        strokeDashoffset="0"
        pathLength={1}
        opacity="0.7"
      />

      {/* section 6 — glow halo behind the star, resting at opacity 0 */}
      <circle
        data-strand="glow"
        cx="16"
        cy="16"
        r="13"
        fill="var(--gold)"
        filter="url(#loom-glow-blur)"
        opacity="0"
      />

      <g data-strand-core="true">
        {/* section 5 — gold fill */}
        <path data-strand="fill" d={LOGO_DIAMOND} fill="var(--gold)" fillOpacity="0.85" />

        {/* section 2 — diamond strand */}
        <path
          data-strand="diamond"
          d={LOGO_DIAMOND}
          stroke="var(--gold)"
          strokeWidth="0.6"
          strokeLinejoin="miter"
          strokeDasharray="1"
          strokeDashoffset="0"
          pathLength={1}
        />

        {/* section 1 — square strand, 4 corner strokes */}
        <g stroke="var(--brand)" strokeWidth="0.6" strokeLinejoin="miter" strokeLinecap="butt">
          {LOGO_SQUARE_SEGMENTS.map((points) => (
            <polyline
              key={points}
              data-strand="square"
              points={points}
              strokeDasharray="1"
              strokeDashoffset="0"
              pathLength={1}
            />
          ))}
        </g>
      </g>

      {/* section 3 — over/under weave hint: the 8 crossing points */}
      <g data-strand="weave" fill="var(--accent)" opacity="1">
        {WEAVE_DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.55" />
        ))}
      </g>
    </svg>
  );
}

/** 8 points on a ring between the square and diamond, marking the weave. */
const WEAVE_DOTS: Array<[number, number]> = Array.from({ length: 8 }, (_, i) => {
  const angle = (Math.PI / 4) * i + Math.PI / 8;
  const radius = 10.6;
  const x = 16 + radius * Math.cos(angle);
  const y = 16 + radius * Math.sin(angle);
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
});
