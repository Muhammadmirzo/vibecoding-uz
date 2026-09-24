"use client";

import * as React from "react";

/**
 * Scroll progress hairline for long pages (blog posts, course page).
 * Fixed top, `scaleX` transform only. Single rAF-throttled passive scroll
 * listener; skips work when the tab is hidden. Hidden entirely when motion
 * is off. Mount only on long pages.
 */
export function ScrollProgress() {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const raf = React.useRef(0);
  const ticking = React.useRef(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      ticking.current = false;
      if (document.hidden) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      node.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={ref} className="scroll-progress-bar" />
    </div>
  );
}
