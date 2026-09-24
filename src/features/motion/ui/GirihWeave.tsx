import type * as React from "react";
import { cn } from "@/components/ui/utils";

interface GirihWeaveProps {
  className?: string;
}

/**
 * Signature hero ornament: one 8-point girih tile whose strokes "weave in"
 * (stroke-dashoffset draw, one shot, hero gate) under a slow ambient
 * shimmer travelling along the same lines (infinite, ambient gate).
 * Mounts in the final state — animation only under the motion gates.
 * Pure CSS, zero JS, hidden from assistive technology.
 */
export function GirihWeave({ className }: GirihWeaveProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn("girih-weave", className)}
    >
      <defs>
        <linearGradient id="girih-shimmer" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--brand)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--gold)" />
          <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* base tile — draw-in */}
      <g className="weave-base" stroke="currentColor" strokeWidth="1.5">
        <rect x="55" y="55" width="90" height="90" pathLength={1} className="weave-stroke" style={{ "--i": 0 } as React.CSSProperties} />
        <rect x="55" y="55" width="90" height="90" transform="rotate(45 100 100)" pathLength={1} className="weave-stroke" style={{ "--i": 1 } as React.CSSProperties} />
        <polygon points="126.6,107.6 107.6,126.6 92.4,126.6 73.4,107.6 73.4,92.4 92.4,73.4 107.6,73.4 126.6,92.4" pathLength={1} className="weave-stroke" style={{ "--i": 2 } as React.CSSProperties} />
        <circle cx="100" cy="100" r="7" pathLength={1} className="weave-stroke" style={{ "--i": 3 } as React.CSSProperties} />
      </g>
      {/* travelling highlight — ambient shimmer */}
      <g className="weave-shimmer" stroke="url(#girih-shimmer)" strokeWidth="1.5">
        <rect x="55" y="55" width="90" height="90" pathLength={1} className="weave-glow" />
        <rect x="55" y="55" width="90" height="90" transform="rotate(45 100 100)" pathLength={1} className="weave-glow" />
      </g>
    </svg>
  );
}
