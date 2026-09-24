"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";

interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Card spotlight: a radial gradient follows the pointer via `--mx`/`--my`
 * CSS vars (rAF-throttled). Pointer-fine + full-motion only; otherwise a
 * plain wrapper. The glow itself is pure CSS (`::before`, opacity only).
 */
export function Spotlight({ className, children, ...props }: SpotlightProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const raf = React.useRef(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const root = document.documentElement;
    const enabled =
      root.dataset.motion === "full" &&
      root.dataset.motionPointer === "on" &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled) return;

    const onMove = (event: PointerEvent) => {
      if (document.hidden) return;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        node.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        node.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    };
    node.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      node.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} {...props} className={cn("spotlight", className)}>
      {children}
    </div>
  );
}
