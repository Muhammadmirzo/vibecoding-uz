"use client";

import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { STORY_SECTIONS, type StrandKey } from "../domain/strands";

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
 * Wires the loom (scrub each section's strand) and the headline reveals.
 * Everything here is additive: the SSR markup is already the "finished"
 * state, so when `prefers-reduced-motion` or no-JS applies, nothing runs
 * and the page stays exactly as rendered.
 */
export function useLoomMotion(containerRef: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return undefined;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    lenis.on("scroll", ScrollTrigger.update);

    const ctx = gsap.context(() => {
      for (const section of STORY_SECTIONS) {
        const sectionEl = container.querySelector<HTMLElement>(`[data-lab-section="${section.id}"]`);
        if (!sectionEl) continue;

        const strands = container.querySelectorAll<SVGElement>(`[data-strand="${section.strand}"]`);
        const hidden = HIDDEN_VARS[section.strand];
        const drawn = DRAWN_VARS[section.strand];
        if (strands.length && hidden && drawn) {
          gsap.set(strands, hidden);
          gsap.to(strands, {
            ...drawn,
            ease: "none",
            scrollTrigger: {
              trigger: sectionEl,
              start: "top center",
              end: "bottom center",
              scrub: true,
            },
          });
        }

        const headline = sectionEl.querySelector<HTMLElement>(".lab-headline");
        if (headline) {
          gsap.fromTo(
            headline,
            { clipPath: "inset(0 0 100% 0)" },
            {
              clipPath: "inset(0 0 0% 0)",
              duration: 0.9,
              ease: "expo.out",
              scrollTrigger: { trigger: sectionEl, start: "top 78%", toggleActions: "play none none none" },
            },
          );
        }
      }

      // Final section: one gentle pulse on the completed star (section 6 = "boshlash").
      const finalSection = container.querySelector<HTMLElement>('[data-lab-section="boshlash"]');
      const glowHalo = container.querySelectorAll<SVGElement>('[data-strand="glow"]');
      const core = container.querySelectorAll<SVGElement>("[data-strand-core]");
      if (finalSection && glowHalo.length) {
        ScrollTrigger.create({
          trigger: finalSection,
          start: "top 60%",
          once: true,
          onEnter: () => {
            const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power2.inOut" } });
            tl.to(glowHalo, { opacity: 0.55 }, 0)
              .to(core, { scale: 1.04, transformOrigin: "16px 16px" }, 0)
              .to(glowHalo, { opacity: 0 }, 0.6)
              .to(core, { scale: 1, transformOrigin: "16px 16px" }, 0.6);
          },
        });
      }
    }, container);

    return () => {
      ctx.revert();
      gsap.ticker.remove(onTick);
      lenis.destroy();
    };
  }, [containerRef]);
}
