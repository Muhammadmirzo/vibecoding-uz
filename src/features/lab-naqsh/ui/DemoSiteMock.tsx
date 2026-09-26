"use client";

import type { RefObject } from "react";
import { templateFor, type IdeaId, type MockBlock, type MockLayout } from "../domain/ideas";
import { TileShape } from "./TileShape";
import { cn } from "@/components/ui/utils";

/** Grid-template-areas per idea layout — real layout differences, not just copy. */
const LAYOUT_AREAS: Record<MockLayout, string> = {
  grid: "'header header' 'hero hero' 'c1 c2' 'cta cta'",
  stack: "'header header' 'hero hero' 'c1 c1' 'c2 c2' 'cta cta'",
  chat: "'header header' 'hero hero' 'c1 .' '. c2' 'cta cta'",
};

/**
 * Fixed scattered offsets for up to 5 tiles — deterministic, no randomness
 * (SSR-safe). No rotation: GSAP Flip interpolates position/scale, not CSS
 * rotate, so a rotated "from" box would just snap straight at the end.
 */
const SCATTER = [
  { top: "6%", left: "4%" },
  { top: "58%", left: "68%" },
  { top: "10%", left: "62%" },
  { top: "54%", left: "8%" },
  { top: "34%", left: "36%" },
] as const;

const GRID_AREA: Record<MockBlock["kind"], string> = {
  header: "header",
  hero: "hero",
  content: "content",
  cta: "cta",
};

interface DemoSiteMockProps {
  ideaId: IdeaId | null;
  assembled: boolean;
  mockRef: RefObject<HTMLDivElement>;
}

/**
 * The mini site mock the girih tiles assemble into. `assembled=false` renders
 * the tiles scattered (pre-Flip), `assembled=true` lays them out as a real
 * mock page — the SAME elements, only their position/size changes, which is
 * what GSAP Flip animates between.
 */
export function DemoSiteMock({ ideaId, assembled, mockRef }: DemoSiteMockProps) {
  if (!ideaId) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-white/20 text-sm text-on-brand-surface opacity-70">
        Namuna shu yerda paydo bo'ladi
      </div>
    );
  }

  const template = templateFor(ideaId);
  let contentIndex = 0;

  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded border border-white/25 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-on-brand-surface opacity-70">
          namuna
        </span>
        <span className="text-xs text-on-brand-surface opacity-70">{template.siteName}</span>
      </div>

      <div
        ref={mockRef}
        className={cn("relative", assembled ? "grid min-h-64 grid-cols-2 gap-2" : "h-64")}
        style={
          assembled
            ? { gridTemplateAreas: LAYOUT_AREAS[template.layout], gridTemplateRows: "auto auto auto auto auto" }
            : undefined
        }
      >
        {template.blocks.map((block, index) => {
          const area = block.kind === "content" ? `c${contentIndex + 1}` : GRID_AREA[block.kind];
          const isChatBubble = template.layout === "chat" && block.kind === "content";
          const chatSide = isChatBubble && contentIndex === 0 ? "start" : "end";
          if (block.kind === "content") contentIndex += 1;
          const scatter = SCATTER[index] ?? SCATTER[0];

          return (
            <div
              key={`${block.kind}-${block.text}`}
              data-tile={block.kind}
              className={cn(
                "flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-on-brand-surface",
                block.kind === "hero" && "text-sm",
                block.kind === "cta" && "justify-center bg-gold text-on-gold",
                isChatBubble && assembled && cn("max-w-[80%] rounded-full", chatSide === "start" ? "justify-self-start" : "justify-self-end"),
                !assembled && "absolute w-28",
              )}
              style={assembled ? { gridArea: area } : { top: scatter.top, left: scatter.left }}
            >
              <TileShape shape={block.shape} className={block.kind === "cta" ? "text-on-gold" : "text-accent"} />
              <span className="truncate">{block.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
