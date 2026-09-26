import type { RefObject } from "react";
import { IDEA_CHIPS, IDEA_TEXT_MAX_LENGTH, templateFor } from "../domain/ideas";
import { DemoSiteMock } from "./DemoSiteMock";
import { cn } from "@/components/ui/utils";

const NOOP_MOCK_REF = { current: null } as RefObject<HTMLDivElement>;

/**
 * Server-renderable, zero-JS twin of HeroDemoPanel: same markup and box
 * sizes (assembled "onlayn-dokon" mock), so swapping it for the real,
 * GSAP-driven panel after idle causes no layout shift. Used as:
 * - the home hero's SSR content (LazyHeroDemo renders this until idle), and
 * - the `next/dynamic` loading fallback while the interactive chunk loads.
 *
 * Chips/input are real but `disabled` — no handlers exist yet, so a click
 * would do nothing; they become live the moment HeroDemoPanel takes over.
 */
export function StaticDemoPanel() {
  const template = templateFor("onlayn-dokon");

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
      <div className="overflow-hidden rounded-xl bg-terminal text-terminal-ink shadow-lg">
        <div className="flex items-center gap-2 border-b border-terminal px-4 py-3 font-mono text-xs text-terminal-muted">
          <span className="size-2 rounded-full bg-danger" aria-hidden="true" />
          <span className="size-2 rounded-full bg-gold" aria-hidden="true" />
          <span className="size-2 rounded-full bg-success" aria-hidden="true" />
          <span className="ml-2 truncate">g&apos;oya → sayt</span>
        </div>

        <div className="p-5 font-mono text-sm">
          <p className="flex items-center gap-1 text-terminal-ink">
            <span className="text-accent">&gt;</span>
            <span>{template.promptLine}</span>
            <span
              aria-hidden="true"
              className="motion-reduce:animate-none inline-block h-4 w-2 translate-y-px animate-typing-caret bg-accent"
            />
          </p>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Tayyor g'oyalar">
            {IDEA_CHIPS.map((chip) => (
              <button
                key={chip.id}
                type="button"
                disabled
                aria-pressed={chip.id === "onlayn-dokon"}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-fast",
                  "border-terminal-border text-terminal-ink",
                  chip.id === "onlayn-dokon" && "border-accent text-accent",
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form className="mt-4 hidden items-end gap-2 lg:flex">
            <div className="flex-1">
              <label className="mb-1 block text-[0.65rem] uppercase tracking-[0.1em] text-terminal-muted">
                Yoki o&apos;z g&apos;oyangizni yozing
              </label>
              <input
                type="text"
                disabled
                maxLength={IDEA_TEXT_MAX_LENGTH}
                placeholder="masalan: fitnes studiya uchun sayt"
                className="w-full rounded-md border border-terminal-border bg-transparent px-3 py-2 text-sm text-terminal-ink placeholder:text-terminal-muted"
              />
            </div>
            <button
              type="button"
              disabled
              className="rounded-md border border-terminal-border px-3 py-2 text-xs font-semibold text-terminal-ink"
            >
              Enter
            </button>
          </form>
        </div>
      </div>

      <div>
        <DemoSiteMock ideaId="onlayn-dokon" assembled mockRef={NOOP_MOCK_REF} />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-on-brand-surface opacity-70">Namuna tayyor: {template.siteName}</p>
          <button
            type="button"
            disabled
            className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-on-brand-surface"
          >
            Qaytadan
          </button>
        </div>
      </div>
    </div>
  );
}
