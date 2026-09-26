"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomeLoomSection } from "@/features/lab-naqsh/domain/homeLoom";
import type { StrandKey } from "@/features/lab-naqsh/domain/strands";

gsap.registerPlugin(ScrollTrigger);

/** Per-strand-type "hidden" starting values; the JSX default is the drawn end state. */
const HIDDEN_VARS: Partial<Record<StrandKey, gsap.TweenVars>> = {
  square: { attr: { "stroke-dashoffset": 1 } },
  diamond: { attr: { "stroke-dashoffset": 1 } },
  ring: { attr: { "stroke-dashoffset": 1 } },
  fill: { attr: { "fill-opacity": 0 } },
  weave: { opacity: 0, scale: 0.6, transformOrigin: "16px 16px" },
};

const DRAWN_VARS: Partial<Record<StrandKey, gsap.TweenVars>> = {
  square: { attr: { "stroke-dashoffset": 0 } },
  diamond: { attr: { "stroke-dashoffset": 0 } },
  ring: { attr: { "stroke-dashoffset": 0 } },
  fill: { attr: { "fill-opacity": 0.85 } },
  weave: { opacity: 1, scale: 1, transformOrigin: "16px 16px" },
};

/**
 * The real implementation behind HomeLoomMotion — only loaded once that
 * wrapper has decided motion is allowed and the browser is idle, so gsap +
 * ScrollTrigger never sit in the `/` initial bundle (art-direction §8).
 * Deliberately Lenis-free: the home page keeps native scroll this slice.
 */
export function HomeLoomMotionImpl({ sections }: { sections: readonly HomeLoomSection[] }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-home-loom]");
    if (!root) return undefined;

    const ctx = gsap.context(() => {
      for (const section of sections) {
        const sectionEl = root.querySelector<HTMLElement>(`[data-lab-section="${section.id}"]`);
        const strands = root.querySelectorAll<SVGElement>(`[data-strand="${section.strand}"]`);
        const hidden = HIDDEN_VARS[section.strand];
        const drawn = DRAWN_VARS[section.strand];
        if (!sectionEl || !strands.length || !hidden || !drawn) continue;

        gsap.set(strands, hidden);
        gsap.to(strands, {
          ...drawn,
          ease: "none",
          scrollTrigger: { trigger: sectionEl, start: "top center", end: "bottom center", scrub: true },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [sections]);

  return null;
}
