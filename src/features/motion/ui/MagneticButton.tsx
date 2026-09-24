"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";

interface MagneticButtonProps {
  /** A single element (the hero primary CTA). */
  children: React.ReactElement;
  className?: string;
  /** Max pull in px. Default 6 — restrained. */
  strength?: number;
}

function magneticEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const root = document.documentElement;
  return (
    root.dataset.motion === "full" &&
    root.dataset.motionPointer === "on" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Gentle magnetic pull for the hero primary CTA only. Clones the single
 * child to attach the transform (no wrapper → no layout change).
 * Pointer-fine, full-motion only. rAF-throttled, transform-only; springs
 * back with the shared spring easing. Plain passthrough otherwise.
 */
export function MagneticButton({ children, className, strength = 6 }: MagneticButtonProps) {
  const ref = React.useRef<HTMLElement | null>(null);
  const raf = React.useRef(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || !magneticEnabled()) return;

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

    node.classList.add("is-magnetic");
    node.addEventListener("pointermove", onMove, { passive: true });
    node.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      node.classList.remove("is-magnetic");
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  const setRef = React.useCallback(
    (node: HTMLElement | null) => {
      ref.current = node;
    },
    [],
  );

  return React.cloneElement(children, {
    ref: setRef,
    className: cn((children.props as { className?: string }).className, "magnetic", className),
  });
}
