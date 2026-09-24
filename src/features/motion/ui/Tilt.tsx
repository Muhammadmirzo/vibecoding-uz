"use client";

import * as React from "react";
import { cn } from "@/components/ui/utils";

interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
  strength?: number;
}

function enabled(): boolean {
  return document.documentElement.dataset.motion === "full" &&
    document.documentElement.dataset.motionPointer === "on" &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Fine-pointer 3D card tilt. Transform-only, rAF-batched, and a no-op island elsewhere. */
export function Tilt({ children, className, strength = 3, ...props }: TiltProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const raf = React.useRef(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || !enabled()) return;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const box = node.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        node.style.transform = `perspective(900px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateY(-2px)`;
      });
    };
    const leave = () => { node.style.transform = ""; };
    node.addEventListener("pointermove", move, { passive: true });
    node.addEventListener("pointerleave", leave, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return <div ref={ref} className={cn("tilt-card", className)} {...props}>{children}</div>;
}
