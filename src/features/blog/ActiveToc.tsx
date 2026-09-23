"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "./types";

export function ActiveToc({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState(toc[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    toc.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [toc]);

  return (
    <nav className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
      {toc.map((item) => {
        const isActive = activeId === item.id;
        return (
          <a key={item.id} href={`#${item.id}`} className={`block text-xs py-2 px-3 rounded-lg transition-all leading-snug ${isActive ? "bg-accent-soft text-accent font-bold border-l-2 border-accent" : "text-ink-muted hover:text-ink hover:bg-cream"} ${item.level === 3 ? "ml-3" : ""}`}>
            {item.title}
          </a>
        );
      })}
    </nav>
  );
}
