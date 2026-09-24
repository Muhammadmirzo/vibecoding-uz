"use client";

import * as React from "react";
import { cn } from "./utils";

interface TerminalWindowProps {
  lines: readonly string[];
  className?: string;
  title?: string;
}

export function TerminalWindow({ lines, className, title = "build — claude-code" }: TerminalWindowProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  // The complete result is in the server HTML. Motion only enhances this after hydration.
  const [visible, setVisible] = React.useState(lines.length);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      setVisible(0);
      timer = window.setTimeout(() => setVisible(1), 280);
    }, { threshold: 0.45 });

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  React.useEffect(() => {
    if (visible === 0 || visible >= lines.length) return;
    const timer = window.setTimeout(() => setVisible((count) => count + 1), 520);
    return () => window.clearTimeout(timer);
  }, [lines.length, visible]);

  return (
    <div ref={containerRef} className={cn("overflow-hidden rounded-xl bg-ink text-bg shadow-lg", className)}>
      <div className="flex items-center gap-2 border-b border-bg/10 px-4 py-3 font-mono text-xs text-bg/60">
        <span className="size-2 rounded-full bg-danger" aria-hidden="true" />
        <span className="size-2 rounded-full bg-gold" aria-hidden="true" />
        <span className="size-2 rounded-full bg-success" aria-hidden="true" />
        <span className="ml-2 truncate">{title}</span>
      </div>
      <div className="min-h-72 p-5 font-mono text-[13px] leading-7 sm:text-sm" aria-label="Claude Code build transcript">
        {lines.map((line, index) => {
          const isUrl = line.startsWith("https://");
          const isSuccess = line.startsWith("✓");
          const content = line.replace(/^[›✓]\s*/, "");
          const isVisible = index < visible;
          return (
            <p key={`${line}-${index}`} className={cn("flex gap-3 transition-opacity duration-300", isVisible ? "opacity-100" : "opacity-20", isVisible && index === visible - 1 ? "animate-fade-up" : "") }>
              <span className={cn("shrink-0", isSuccess ? "text-success" : isUrl ? "text-gold" : "text-accent")} aria-hidden="true">
                {isSuccess ? "✓" : isUrl ? "↗" : "›"}
              </span>
              <span className={isUrl ? "text-gold" : undefined}>{content}</span>
            </p>
          );
        })}
      </div>
    </div>
  );
}
