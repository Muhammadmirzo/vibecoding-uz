"use client";

import * as React from "react";

let sharedObserver: IntersectionObserver | null = null;
let revealObserver: IntersectionObserver | null = null;
let marqueeObserver: IntersectionObserver | null = null;
const pendingReveals = new Set<Element>();
let scrollTicking = false;

function revealOne(node: Element) {
  node.classList.add("is-visible");
  revealObserver?.unobserve(node);
  pendingReveals.delete(node);
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function motionScrollEnabled(): boolean {
  const root = document.documentElement;
  return (
    root.dataset.motion === "full" ||
    root.dataset.motion === "subtle"
  ) && root.dataset.motionScroll === "on";
}

function armReveals(scope: ParentNode) {
  if (!revealObserver) return;
  const nodes = scope instanceof Document || scope instanceof Element
    ? scope.querySelectorAll("[data-reveal]:not(.is-visible)")
    : [];
  nodes.forEach((node) => {
    pendingReveals.add(node);
    revealObserver?.observe(node);
  });
}

/** Reveal anything at/above the reveal line (catches fast-scroll skips). */
function sweepReveals() {
  scrollTicking = false;
  if (pendingReveals.size === 0) return;
  const line = window.innerHeight * 0.92;
  pendingReveals.forEach((node) => {
    if (!node.isConnected) {
      pendingReveals.delete(node);
      return;
    }
    if (node.getBoundingClientRect().top < line) revealOne(node);
  });
}

function onScrollSweep() {
  if (scrollTicking || pendingReveals.size === 0) return;
  scrollTicking = true;
  requestAnimationFrame(sweepReveals);
}

function armMarquees(scope: ParentNode) {
  if (!marqueeObserver) return;
  const nodes = scope instanceof Document || scope instanceof Element
    ? scope.querySelectorAll("[data-marquee], .girih-weave")
    : [];
  nodes.forEach((node) => marqueeObserver?.observe(node));
}

/**
 * Single global motion island, mounted once in the root layout.
 * Owns the ONE shared IntersectionObserver for `[data-reveal]` (adds
 * `.is-visible` once, then unobserves) and pauses `[data-marquee]`
 * tracks + decorative layers when offscreen or when the tab is hidden.
 * Arming is deferred with requestIdleCallback so hydration always wins
 * the race (no DOM mutation before React finishes comparing). One passive
 * rAF-throttled scroll listener sweeps scrolled-past nodes (fast-scroll
 * skips); it detaches once everything is visible. ~0.8 kB gz.
 */
export function RevealRoot() {
  React.useEffect(() => {
    if (prefersReducedMotion() || !motionScrollEnabled()) return;
    const root = document.documentElement;

    let disposed = false;
    let mutations: MutationObserver | null = null;
    let safetyTimer = 0;

    const arm = () => {
      if (disposed) return;
      root.classList.add("motion-armed");

      revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) revealOne(entry.target);
          }
        },
        { threshold: 0, rootMargin: "0px 0px -5% 0px" },
      );

      marqueeObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            entry.target.classList.toggle("is-paused", !entry.isIntersecting);
          }
        },
        { threshold: 0 },
      );

      armReveals(document);
      armMarquees(document);
      sweepReveals();
      window.addEventListener("scroll", onScrollSweep, { passive: true });
      window.addEventListener("resize", onScrollSweep, { passive: true });
      // Safety net: whatever blocks an observer callback (throttled webviews,
      // momentum scroll, bfcache), content that reached the viewport is shown.
      safetyTimer = window.setInterval(() => {
        if (pendingReveals.size === 0) window.clearInterval(safetyTimer);
        else sweepReveals();
      }, 1200);

      // Client-side navigations inject new nodes — watch for them.
      mutations = new MutationObserver((records) => {
        for (const record of records) {
          record.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              armReveals(node);
              armMarquees(node);
            }
          });
        }
      });
      if (document.body) mutations.observe(document.body, { childList: true, subtree: true });
    };

    const syncHidden = () => {
      root.classList.toggle("is-tab-hidden", document.hidden);
    };
    syncHidden();
    document.addEventListener("visibilitychange", syncHidden);

    // Decorative motion must not compete with hydration on the main thread.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let idleId = 0;
    let rafId = 0;
    if (typeof w.requestIdleCallback === "function") idleId = w.requestIdleCallback(arm);
    else rafId = requestAnimationFrame(() => window.setTimeout(arm, 0));

    return () => {
      disposed = true;
      mutations?.disconnect();
      document.removeEventListener("visibilitychange", syncHidden);
      window.removeEventListener("scroll", onScrollSweep);
      window.removeEventListener("resize", onScrollSweep);
      window.clearInterval(safetyTimer);
      revealObserver?.disconnect();
      marqueeObserver?.disconnect();
      revealObserver = null;
      marqueeObserver = null;
      if (typeof w.cancelIdleCallback === "function" && idleId) w.cancelIdleCallback(idleId);
      cancelAnimationFrame(rafId);
      root.classList.remove("motion-armed", "is-tab-hidden");
    };
  }, []);

  return null;
}

/** Shared one-shot in-view hook for tiny islands (CountUp, parallax). */
export function useInView<T extends Element>(options?: { threshold?: number }) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || inView) return;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    if (!sharedObserver) {
      sharedObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              (entry.target as Element & { __inview?: () => void }).__inview?.();
              sharedObserver?.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.2 },
      );
    }
    const target = node as Element & { __inview?: () => void };
    target.__inview = () => setInView(true);
    sharedObserver.observe(node);
    return () => {
      sharedObserver?.unobserve(node);
      target.__inview = undefined;
    };
  }, [inView, options?.threshold]);

  return { ref, inView };
}
