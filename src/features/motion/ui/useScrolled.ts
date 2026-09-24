"use client";

import * as React from "react";

/**
 * True once the page is scrolled past `threshold` px. Single
 * rAF-throttled passive listener per hook instance (header only).
 * Used to condense the header (background + shadow only — the header
 * height never changes, so CLS stays 0).
 */
export function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    let raf = 0;
    let ticking = false;
    const update = () => {
      ticking = false;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return scrolled;
}
