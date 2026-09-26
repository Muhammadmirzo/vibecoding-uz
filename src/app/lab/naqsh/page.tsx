import type { Metadata } from "next";
import { HeroDemo } from "@/features/lab-naqsh/ui/HeroDemo";
import { LabNaqshStory } from "@/features/lab-naqsh/ui/LabNaqshStory";

/**
 * AWWWARDS slice 1 prototype: the loom star + scroll-scrubbed story.
 * Hidden — noindex, unlinked from any nav. See
 * docs/redesign/awwwards/02-art-direction.md §1, §6, §9 (build plan, slice 1).
 */
export const metadata: Metadata = { title: "Lab: Naqsh", robots: { index: false, follow: false } };

export default function LabNaqshPage() {
  return (
    <main className="bg-brand-surface">
      <HeroDemo />
      <LabNaqshStory />
    </main>
  );
}
