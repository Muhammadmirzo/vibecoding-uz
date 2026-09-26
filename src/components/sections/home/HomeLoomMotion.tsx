"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { HomeLoomSection } from "@/features/lab-naqsh/domain/homeLoom";

// Same split as LazyHeroDemo/HeroDemoPanel: gsap + ScrollTrigger live only in
// this chunk, loaded with next/dynamic(ssr:false) so they never reach the
// server-rendered `/` HTML or its initial client bundle.
const HomeLoomMotionImpl = dynamic(() => import("./HomeLoomMotionImpl").then((mod) => mod.HomeLoomMotionImpl), {
  ssr: false,
});

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function prefersNoMotion(): boolean {
  if (typeof window === "undefined") return true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const off = document.documentElement.dataset.motion === "off";
  return reduced || off;
}

/**
 * Gate in front of HomeLoomMotionImpl: with reduced motion or
 * `data-motion="off"` the star simply stays as SSR'd (complete for its
 * registered strands, faint guide for the rest, no scrub) and the gsap chunk
 * is never even requested. Otherwise it loads on idle — the same timing
 * LazyHeroDemo already uses for the hero demo, so both dynamic `import()`s
 * resolve `gsap` into one shared chunk instead of two copies.
 */
export function HomeLoomMotion({ sections }: { sections: readonly HomeLoomSection[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (prefersNoMotion()) return undefined;
    const win = window as IdleWindow;
    if (typeof win.requestIdleCallback === "function") {
      const handle = win.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => win.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return null;
  return <HomeLoomMotionImpl sections={sections} />;
}
