"use client";

import * as React from "react";
import { cn } from "./utils";

export function TerminalWindow({ lines, className, title = "build — claude-code" }: { lines: string[]; className?: string; title?: string }) {
  const [visible, setVisible] = React.useState(0);
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(lines.length);
      return;
    }
    if (visible >= lines.length) return;
    const timer = window.setTimeout(() => setVisible((n) => n + 1), 520);
    return () => window.clearTimeout(timer);
  }, [visible, lines.length]);
  return <div className={cn("overflow-hidden rounded-xl bg-ink text-bg shadow-lg", className)}><div className="flex items-center gap-2 border-b border-bg/10 px-4 py-3 font-mono text-xs text-bg/60"><span className="size-2 rounded-full bg-danger" /><span className="size-2 rounded-full bg-gold" /><span className="size-2 rounded-full bg-success" /><span className="ml-2">{title}</span></div><div className="min-h-44 p-5 font-mono text-sm leading-7">{lines.slice(0, visible).map((line, i) => <p key={`${line}-${i}`} className="animate-fade-up"><span className="mr-3 text-accent">$</span>{line}<span className="ml-1 inline-block h-5 w-2 translate-y-1 bg-gold animate-typing-caret" aria-hidden="true" /></p>)}</div></div>;
}
