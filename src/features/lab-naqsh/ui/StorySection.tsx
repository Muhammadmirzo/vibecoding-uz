import type { ReactNode } from "react";
import type { StorySectionMeta } from "../domain/strands";

/**
 * One story section (night canvas). Headline is wrapped in a mask span so
 * useLoomMotion can clip-path-reveal it; by default (SSR/no-JS) the mask is
 * fully open, so the headline is simply visible — motion only enhances.
 */
export function StorySection({
  section,
  index,
  children,
}: {
  section: StorySectionMeta;
  index: number;
  children?: ReactNode;
}) {
  return (
    <section
      id={section.id}
      data-lab-section={section.id}
      className="relative flex min-h-[90vh] flex-col justify-center py-24 first:min-h-[70vh]"
    >
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h2
        className="lab-headline mt-4 max-w-2xl text-balance font-display font-bold leading-[0.95] tracking-[-0.045em] text-on-brand-surface [clip-path:inset(0_0_0_0)] [text-wrap:balance]"
        style={{ fontSize: "clamp(2.25rem, 6vw, 6rem)" }}
      >
        {section.headline}
      </h2>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-brand-surface opacity-80">
        <span className="mr-2 rounded border border-white/25 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-on-brand-surface opacity-70">
          Placeholder
        </span>
        {section.body}
      </p>
      {children}
    </section>
  );
}
