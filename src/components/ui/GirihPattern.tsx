import * as React from "react";

export function GirihPattern({ className = "" }: React.SVGProps<SVGSVGElement>) {
  const patternId = React.useId().replace(/:/g, "");
  const maskId = React.useId().replace(/:/g, "");

  return (
    <svg aria-hidden="true" className={className} fill="none">
      <defs>
        <radialGradient id={`${patternId}-fade`} cx="50%" cy="48%" r="58%">
          <stop offset="0" stopColor="white" stopOpacity="0.95" />
          <stop offset="0.58" stopColor="white" stopOpacity="0.42" />
          <stop offset="1" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill={`url(#${patternId}-fade)`} />
        </mask>
        <pattern id={patternId} width="96" height="96" patternUnits="userSpaceOnUse">
          <g stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round">
            <path d="M48 8 59 26 80 21 75 42 88 48 75 54 80 75 59 70 48 88 37 70 16 75 21 54 8 48 21 42 16 21 37 26Z" />
            <path d="M48 18 54 33 68 35 58 45 61 59 48 53 35 59 38 45 28 35 42 33Z" opacity="0.82" />
            <path d="M0 12 18 21M0 84 18 75M78 21 96 12M78 75 96 84M12 0 21 18M84 0 75 18M12 96 21 78M84 96 75 78" opacity="0.58" />
            <path d="M0 48h8M88 48h8M48 0v8M48 88v8" opacity="0.72" />
            <circle cx="48" cy="48" r="3" opacity="0.7" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
    </svg>
  );
}
