import * as React from "react";
import { cn } from "@/components/ui/utils";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the region (the moving copy itself is decorative). */
  label: string;
}

/**
 * CSS-only marquee. Children are rendered twice (second copy `aria-hidden`).
 * Pauses on hover/focus and when offscreen (`RevealRoot` toggles
 * `.is-paused`); static + natively scrollable when motion is off/subtle or
 * reduced-motion is requested. Zero JS in this component.
 */
export function Marquee({ label, className, children, ...props }: MarqueeProps) {
  return (
    <div data-marquee="" aria-label={label} className={cn("marquee", className)} {...props}>
      <div className="marquee-viewport">
        <div className="marquee-track">
          <div className="marquee-list">{children}</div>
          <div className="marquee-list" aria-hidden="true">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
