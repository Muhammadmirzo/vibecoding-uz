"use client";

import { useRef } from "react";
import { Button } from "@/components/ui";
import { STORY_SECTIONS } from "../domain/strands";
import { LoomStar } from "./LoomStar";
import { StorySection } from "./StorySection";
import { useLoomMotion } from "./useLoomMotion";

/**
 * `/lab/naqsh` prototype (AWWWARDS slice 1): the story sections + the loom
 * star. Desktop pins the star in a sticky right column; phone gets a thin
 * thread in the left margin with a small star near the end. Both are the
 * SAME <LoomStar> markup rendered twice — useLoomMotion scrubs every
 * matching `[data-strand]` element regardless of which copy is visible.
 */
export function LabNaqshStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  useLoomMotion(containerRef);

  return (
    <div ref={containerRef} className="relative bg-brand-surface">
      {/* phone: thin vertical thread in the left margin */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 w-px bg-white/15 lg:hidden" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-24 left-4 -translate-x-1/2 lg:hidden">
        <LoomStar size={56} />
      </div>

      <div className="mx-auto grid max-w-container grid-cols-1 gap-8 px-5 pl-12 sm:px-8 sm:pl-14 lg:grid-cols-12 lg:gap-12 lg:pl-8">
        <div className="lg:col-span-7 lg:col-start-1">
          {STORY_SECTIONS.map((section, index) => (
            <StorySection key={section.id} section={section} index={index}>
              {section.id === "boshlash" && (
                <div className="mt-8">
                  <Button href="/diagnostika" size="lg" data-track="lab_naqsh_cta">
                    Bepul diagnostika
                  </Button>
                </div>
              )}
            </StorySection>
          ))}
        </div>

        {/* desktop: sticky loom column */}
        <div className="relative hidden lg:col-span-5 lg:col-start-8 lg:block">
          <div className="sticky top-24 flex h-[calc(100vh-6rem)] items-center justify-center">
            <LoomStar size={380} />
          </div>
        </div>
      </div>
    </div>
  );
}
