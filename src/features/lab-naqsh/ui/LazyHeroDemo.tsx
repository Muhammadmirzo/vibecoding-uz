"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { StaticDemoPanel } from "./StaticDemoPanel";

// GSAP/Flip (the interactive panel's only heavy dependency) never ships in
// the home page's initial bundle: `ssr:false` keeps it out of the SSR HTML,
// and mounting is deferred below until the browser is idle. Until then (and
// if the chunk is still loading) StaticDemoPanel — same markup, same box
// size — is shown, so there is no layout shift when the swap happens.
const HeroDemoPanel = dynamic(() => import("./HeroDemoPanel").then((mod) => mod.HeroDemoPanel), {
  ssr: false,
  loading: () => <StaticDemoPanel />,
});

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * Home hero's demo slot. Renders the static, zero-JS mock immediately (this
 * is what SSR/no-JS visitors and search bots see), then swaps in the real
 * GSAP-driven demo once the main thread is idle — never competing with the
 * headline/CTA for first-paint resources. See
 * docs/redesign/awwwards/02-art-direction.md §8 (LCP/motion JS budget).
 */
export function LazyHeroDemo() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window as IdleWindow;
    if (typeof win.requestIdleCallback === "function") {
      const handle = win.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => win.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(() => setReady(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) return <StaticDemoPanel />;
  return <HeroDemoPanel />;
}
