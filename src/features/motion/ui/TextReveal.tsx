import * as React from "react";
import { cn } from "@/components/ui/utils";

interface TextRevealProps {
  /** Full headline text. Kept intact in `aria-label` for SEO/a11y. */
  text: string;
  /** "load" = CSS entrance on first paint (hero). "scroll" = plays when revealed. */
  mode?: "load" | "scroll";
  /** Base delay in ms before the first word (syncs with sibling moments). */
  baseDelay?: number;
  className?: string;
}

/**
 * Headline word-by-word mask slide. SSR text stays intact (visual words are
 * `aria-hidden`; screen readers + crawlers read the plain `aria-label`).
 * Pure CSS — zero JS. Final state is the default; animation only applies
 * under the matching `data-motion` gates.
 */
export function TextReveal({ text, mode = "load", baseDelay = 0, className }: TextRevealProps) {
  const words = text.split(" ").filter(Boolean);
  return (
    <span
      className={cn("text-reveal", mode === "scroll" && "text-reveal-scroll", className)}
      data-text-reveal={mode}
    >
      {/* Full text for screen readers + crawlers; visual words are decorative. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <span className="tr-mask">
            <span
              className="tr-word"
              style={{ "--i": index, "--tr-base": `${baseDelay}ms` } as React.CSSProperties}
            >
              {word}
            </span>
          </span>
          {index < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
      </span>
    </span>
  );
}
