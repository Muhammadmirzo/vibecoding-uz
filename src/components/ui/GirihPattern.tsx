import * as React from "react";

export function GirihPattern({ className = "", ...props }: React.SVGProps<SVGSVGElement>) {
  const patternId = React.useId().replace(/:/g, "");

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      style={{
        maskImage: "radial-gradient(ellipse at 70% 40%, black, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, black, transparent 70%)",
      }}
      {...props}
    >
      <defs>
        <pattern id={patternId} width="72" height="72" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="1" fill="none">
            {/* interlaced 8-point star (khatam): two overlapping rotated squares */}
            <rect x="20" y="20" width="32" height="32" />
            <rect x="20" y="20" width="32" height="32" transform="rotate(45 36 36)" />
            {/* inner octagon lines */}
            <polygon points="46.2,40.2 40.2,46.2 31.8,46.2 25.8,40.2 25.8,31.8 31.8,25.8 40.2,25.8 46.2,31.8" />
            <circle cx="36" cy="36" r="2" />
            {/* tile-edge connectors so the lattice reads across tiles */}
            <path d="M36 0v8M36 64v8M0 36h8M64 36h8" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
