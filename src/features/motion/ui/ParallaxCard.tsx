"use client";

import * as React from "react";
import { useInView } from "./RevealRoot";

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max shift in px. Default 8 — gentle. */
  strength?: number;
}

function parallaxEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const root = document.documentElement;
  return (
    root.dataset.motion === "full" &&
    root.dataset.motionPointer === "on" &&
    !root.classList.contains("is-tab-hidden") &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Gentle pointer parallax (desktop only, full motion only) for the hero
 * floating app-preview card. rAF-throttled, transform-only, pauses when
 * offscreen (shared observer) or when the tab is hidden.
 */
export function ParallaxCard({ children, className, strength = 8 }: ParallaxCardProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const raf = React.useRef(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || !inView || !parallaxEnabled()) return;

    const set = (x: number, y: number) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        node.style.transform = x === 0 && y === 0 ? "" : `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    const onMove = (event: PointerEvent) => {
      if (document.hidden) return;
      const rect = node.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2 * strength;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2 * strength;
      set(x, y);
    };
    const onLeave = () => set(0, 0);

    const zone = node.parentElement ?? node;
    zone.addEventListener("pointermove", onMove, { passive: true });
    zone.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
    };
  }, [inView, strength, ref]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
