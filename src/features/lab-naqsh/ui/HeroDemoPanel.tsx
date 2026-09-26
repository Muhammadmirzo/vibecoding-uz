"use client";

import { useRef } from "react";
import { matchIdeaFromText } from "../domain/ideas";
import { DemoSiteMock } from "./DemoSiteMock";
import { DemoTerminal } from "./DemoTerminal";
import { useHeroDemoMotion } from "./useHeroDemoMotion";

/**
 * The interactive half of the "prompt → site" demo: terminal (chips + typing)
 * + the girih-tile mock it assembles. Shared by /lab/naqsh (HeroDemo.tsx) and
 * the home hero (LazyHeroDemo.tsx). Pulls in GSAP/Flip via useHeroDemoMotion,
 * so callers that care about first-load JS must load this lazily (see
 * LazyHeroDemo) rather than importing it directly. See
 * docs/redesign/awwwards/02-art-direction.md §6.
 */
export function HeroDemoPanel() {
  const promptRef = useRef<HTMLSpanElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);
  const { state, promptText, chooseIdea, reset, announcement } = useHeroDemoMotion(promptRef, mockRef);

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
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
          <p aria-live="polite" className="text-xs text-on-brand-surface opacity-70">
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
  );
}
