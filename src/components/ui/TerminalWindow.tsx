import * as React from "react";
import { cn } from "./utils";

interface TerminalWindowProps {
  lines: readonly string[];
  className?: string;
  title?: string;
  /**
   * Base delay in ms before the first line (syncs with hero headline).
   * Lines keep their 180ms stagger. Pure CSS — SSR safe.
   */
  startDelay?: number;
}

function renderLine(line: string, key: number, startDelay: number) {
  const isSuccess = line.startsWith("✓");
  const isPrompt = line.startsWith("›") || line.startsWith(">");
  const glyph = isSuccess ? "✓" : "›";
  const content = line.replace(/^[›>✓]\s*/, "");

  // Split out an embedded URL (e.g. "Tayyor: https://…") so it keeps gold styling.
  const urlIndex = content.indexOf("https://");
  const before = urlIndex >= 0 ? content.slice(0, urlIndex) : content;
  const url = urlIndex >= 0 ? content.slice(urlIndex) : null;

  return (
    <p
      key={`${line}-${key}`}
      style={{ "--tl-delay": `${startDelay + key * 180}ms` } as React.CSSProperties}
      className="terminal-line flex gap-3"
    >
      <span
        className={cn(
          "shrink-0",
          isSuccess ? "text-success" : isPrompt ? "text-accent" : "text-accent",
        )}
        aria-hidden="true"
      >
        {glyph}
      </span>
      <span className="min-w-0">
        {url ? (
          <>
            <span className="block">{before}</span>
            <span className="block break-all text-gold">{url}</span>
          </>
        ) : (
          content
        )}
      </span>
    </p>
  );
}

export function TerminalWindow({ lines, className, title = "build — claude-code", startDelay = 0 }: TerminalWindowProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-ink text-bg shadow-lg", className)}>
      <div className="flex items-center gap-2 border-b border-bg/10 px-4 py-3 font-mono text-xs text-bg/60">
        <span className="size-2 rounded-full bg-danger" aria-hidden="true" />
        <span className="size-2 rounded-full bg-gold" aria-hidden="true" />
        <span className="size-2 rounded-full bg-success" aria-hidden="true" />
        <span className="ml-2 truncate">{title}</span>
      </div>
      <div className="p-5 font-mono text-[13px] leading-7 sm:text-sm" aria-label="Claude Code build transcript">
        {lines.map((line, index) => renderLine(line, index, startDelay))}
      </div>
    </div>
  );
}
