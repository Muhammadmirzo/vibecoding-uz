import type { ReactNode } from "react";
import { LoomStar } from "@/features/lab-naqsh/ui/LoomStar";
import { HOME_LOOM_SECTIONS, mutedHomeStrands } from "@/features/lab-naqsh/domain/homeLoom";
import { HomeLoomMotion } from "./HomeLoomMotion";

/**
 * Home-page loom infrastructure (Wave E, slice E1), per
 * docs/redesign/awwwards/02-art-direction.md §4 ("the star lives in a fixed
 * loom column: right 4 columns desktop, a thin thread in the left margin on
 * phone") and §6 ("the loom"). Pure SSR layout — the star is drawn as plain
 * markup (fully server-rendered, no CLS), and HomeLoomMotion is the only
 * client/JS piece, loaded lazily.
 *
 * API for later slices (E2..E6): wrap each new section's markup (with a
 * matching `data-lab-section="<id>"`) inside <HomeLoom> alongside the
 * sections that came before it, and add one `{ id, strand }` entry to
 * HOME_LOOM_SECTIONS (src/features/lab-naqsh/domain/homeLoom.ts). HomeLoom
 * derives the rest (which strands are still a faint, unmuted guide) itself.
 */
export function HomeLoom({ children }: { children: ReactNode }) {
  const muted = mutedHomeStrands();

  return (
    <div data-home-loom className="relative bg-brand-surface">
      {/* phone: thin thread in the left margin + a small sticky star, so the
          visitor sees it weave without a full sticky column stealing width */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-14 lg:hidden">
        <div className="absolute inset-y-0 left-7 w-px bg-border-onBrand" />
        <div className="sticky top-[42vh] flex justify-center py-2">
          <LoomStar size={48} weight={2} mutedStrands={muted} />
        </div>
      </div>

      <div className="mx-auto grid max-w-container grid-cols-1 gap-8 px-5 pl-16 sm:px-8 sm:pl-16 lg:grid-cols-12 lg:gap-12 lg:pl-8">
        <div className="lg:col-span-7 lg:col-start-1">{children}</div>

        {/* desktop: sticky loom column, right 4-5 of 12 */}
        <div className="relative hidden lg:col-span-5 lg:col-start-8 lg:block">
          <div className="sticky top-24 flex h-[calc(100vh-6rem)] items-center justify-center">
            <LoomStar size={380} mutedStrands={muted} />
          </div>
        </div>
      </div>

      <HomeLoomMotion sections={HOME_LOOM_SECTIONS} />
    </div>
  );
}
