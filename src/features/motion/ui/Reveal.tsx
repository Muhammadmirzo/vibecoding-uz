import * as React from "react";
import { cn } from "@/components/ui/utils";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Stagger index among siblings. Rendered as `--i` and consumed by CSS
   * (`transition-delay: calc(var(--i) * 70ms)`). Keep 0 for standalone blocks.
   */
  index?: number;
}

/**
 * Scroll reveal wrapper. Server-rendered: content is fully visible without
 * JS (the hidden pre-state only exists under `html.motion-armed`, a class
 * the `RevealRoot` island adds after hydration). One shared
 * IntersectionObserver (in `RevealRoot`) adds `.is-visible` once.
 *
 * Do NOT use above the fold — hero moments use CSS load animations instead.
 */
export function Reveal({ index = 0, className, style, children, ...props }: RevealProps) {
  return (
    <div
      data-reveal=""
      style={{ "--i": index, ...style } as React.CSSProperties}
      className={cn("reveal", className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface RevealGroupProps {
  className?: string;
  children: React.ReactNode;
}

/**
 * Server-side stagger helper: wraps each child in a `Reveal` with an
 * incrementing index. Zero client JS.
 */
export function RevealGroup({ className, children }: RevealGroupProps) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <Reveal index={index}>{child}</Reveal>
      ))}
    </div>
  );
}

/** Props stamp for stamping `data-reveal` onto existing server markup. */
export function revealProps(index = 0): {
  "data-reveal": string;
  style: React.CSSProperties;
} {
  return { "data-reveal": "", style: { "--i": index } as React.CSSProperties };
}
