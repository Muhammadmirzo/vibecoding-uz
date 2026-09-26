"use client";

import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { templateFor, type IdeaId } from "../domain/ideas";

gsap.registerPlugin(Flip);

export type DemoPhase = "idle" | "typing" | "assembling" | "done";
export interface DemoState {
  idea: IdeaId | null;
  phase: DemoPhase;
}

function prefersNoMotion(): boolean {
  if (typeof window === "undefined") return true;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const off = document.documentElement.dataset.motion === "off";
  return reduced || off;
}

/**
 * Drives the hero demo state machine: type the prompt (~0.6s), then Flip the
 * girih tiles from scattered into the assembled mock (~0.6s) — ~1.2s total,
 * per docs/redesign/awwwards/02-art-direction.md §5/§6. Reduced motion or
 * `data-motion="off"` skips straight to the finished mock. SSR/no-JS render
 * the initial state (onlayn-dokon, "done") as plain React output — nothing
 * here runs until a chip/submit fires.
 */
export function useHeroDemoMotion(promptRef: React.RefObject<HTMLSpanElement>, mockRef: React.RefObject<HTMLDivElement>) {
  const [state, setState] = useState<DemoState>({ idea: "onlayn-dokon", phase: "done" });
  const [announcement, setAnnouncement] = useState("");

  const announce = useCallback((idea: IdeaId) => {
    setAnnouncement(`Namuna tayyor: ${templateFor(idea).siteName}`);
  }, []);

  const chooseIdea = useCallback(
    (idea: IdeaId) => {
      if (prefersNoMotion()) {
        setState({ idea, phase: "done" });
        announce(idea);
        return;
      }

      setState({ idea, phase: "typing" });

      const proxy = { i: 0 };
      const text = templateFor(idea).promptLine;
      gsap.to(proxy, {
        i: text.length,
        duration: 0.55,
        ease: "none",
        onUpdate: () => {
          if (promptRef.current) promptRef.current.textContent = text.slice(0, Math.round(proxy.i));
        },
        onComplete: () => setState({ idea, phase: "assembling" }),
      });
    },
    [announce, promptRef],
  );

  const reset = useCallback(() => {
    setState({ idea: null, phase: "idle" });
    setAnnouncement("");
  }, []);

  // When typing flips the phase to "assembling", the tiles commit to the DOM
  // in their scattered layout. Capture that layout, synchronously switch to
  // the assembled layout, then Flip between the two (transform/scale only).
  useEffect(() => {
    if (state.phase !== "assembling" || !state.idea) return;
    const container = mockRef.current;
    const ideaAtAssemble = state.idea;
    const tiles = container?.querySelectorAll<HTMLElement>("[data-tile]") ?? [];
    if (!container || !tiles.length) {
      setState({ idea: ideaAtAssemble, phase: "done" });
      return;
    }

    const flipState = Flip.getState(tiles);
    flushSync(() => setState({ idea: ideaAtAssemble, phase: "done" }));

    Flip.from(flipState, {
      duration: 0.6,
      ease: "power2.inOut",
      stagger: 0.04,
      scale: true,
      onComplete: () => announce(ideaAtAssemble),
    });
  }, [state.phase, state.idea, mockRef, announce]);

  /** SSR-safe prompt text: empty only mid-typing (gsap owns the span then). */
  const promptText = state.idea && state.phase !== "typing" ? templateFor(state.idea).promptLine : "";

  return { state, promptText, chooseIdea, reset, announcement };
}
