"use client";

import { useRef } from "react";
import { matchIdeaFromText } from "../domain/ideas";
import { DemoSiteMock } from "./DemoSiteMock";
import { DemoTerminal } from "./DemoTerminal";
import { useHeroDemoMotion } from "./useHeroDemoMotion";

/**
 * AWWWARDS slice 2: the hero live demo. `> ` prompt + 3 idea chips (+ a
 * free-text idea on desktop) → a short typed prompt → girih tiles fly in
 * (GSAP Flip) and assemble into a "namuna" (scripted, not real AI output)
 * mini site mock. See docs/redesign/awwwards/02-art-direction.md §6.
 *
 * SSR/no-JS renders the initial state directly: the "Onlayn do'kon" mock
 * already assembled, no animation classes involved.
 */
export function HeroDemo() {
  const promptRef = useRef<HTMLSpanElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);
  const { state, promptText, chooseIdea, reset, announcement } = useHeroDemoMotion(promptRef, mockRef);

  return (
    <section className="border-b border-white/10 py-16 sm:py-20" aria-label="Jonli namuna: g'oyadan saytga">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-accent">Jonli namuna</p>
        <h1
          className="mt-4 max-w-2xl text-balance font-display font-bold leading-[0.98] tracking-[-0.035em] text-on-brand-surface"
          style={{ fontSize: "clamp(1.75rem, 4vw, 3.5rem)" }}
        >
          G'oyangizni yozing — sayt shu yerda to'qiladi.
        </h1>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <DemoTerminal
            promptRef={promptRef}
            promptText={promptText}
            selectedIdea={state.idea}
            onSelectChip={chooseIdea}
            onSubmitText={(text) => chooseIdea(matchIdeaFromText(text))}
          />

          <div>
            <DemoSiteMock ideaId={state.idea} assembled={state.phase !== "assembling"} mockRef={mockRef} />
            <div className="mt-3 flex items-center justify-between">
              <p aria-live="polite" className="text-xs text-ink-subtle">
                {announcement}
              </p>
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-on-brand-surface hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Qaytadan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
