"use client";

import { useId, useState, type FormEvent, type RefObject } from "react";
import { IDEA_CHIPS, IDEA_TEXT_MAX_LENGTH, clampIdeaText, type IdeaId } from "../domain/ideas";
import { cn } from "@/components/ui/utils";

interface DemoTerminalProps {
  promptRef: RefObject<HTMLSpanElement>;
  promptText: string;
  selectedIdea: IdeaId | null;
  onSelectChip: (id: IdeaId) => void;
  onSubmitText: (text: string) => void;
}

/**
 * The terminal panel: `>` caret, 3 idea chips, and (desktop only) a free-text
 * input. Chips are real buttons (keyboard + focus ring), the input has a
 * visible label. The typed-out prompt line lives in `promptRef` so the
 * motion hook can type into it directly without extra re-renders.
 */
export function DemoTerminal({ promptRef, promptText, selectedIdea, onSelectChip, onSubmitText }: DemoTerminalProps) {
  const [draft, setDraft] = useState("");
  const inputId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSubmitText(trimmed);
    setDraft("");
  }

  return (
    <div className="overflow-hidden rounded-xl bg-terminal text-terminal-ink shadow-lg">
      <div className="flex items-center gap-2 border-b border-terminal px-4 py-3 font-mono text-xs text-terminal-muted">
        <span className="size-2 rounded-full bg-danger" aria-hidden="true" />
        <span className="size-2 rounded-full bg-gold" aria-hidden="true" />
        <span className="size-2 rounded-full bg-success" aria-hidden="true" />
        <span className="ml-2 truncate">g'oya → sayt</span>
      </div>

      <div className="p-5 font-mono text-sm">
        <p className="flex items-center gap-1 text-terminal-ink">
          <span className="text-accent">&gt;</span>
          <span ref={promptRef} data-testid="demo-prompt">
            {promptText}
          </span>
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
              onClick={() => onSelectChip(chip.id)}
              aria-pressed={selectedIdea === chip.id}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-fast",
                "border-terminal-border text-terminal-ink hover:border-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-terminal",
                selectedIdea === chip.id && "border-accent text-accent",
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 hidden items-end gap-2 lg:flex">
          <div className="flex-1">
            <label htmlFor={inputId} className="mb-1 block text-[0.65rem] uppercase tracking-[0.1em] text-terminal-muted">
              Yoki o'z g'oyangizni yozing
            </label>
            <input
              id={inputId}
              type="text"
              value={draft}
              maxLength={IDEA_TEXT_MAX_LENGTH}
              onChange={(event) => setDraft(clampIdeaText(event.target.value))}
              placeholder="masalan: fitnes studiya uchun sayt"
              className="w-full rounded-md border border-terminal-border bg-transparent px-3 py-2 text-sm text-terminal-ink placeholder:text-terminal-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          <button
            type="submit"
            className="rounded-md border border-terminal-border px-3 py-2 text-xs font-semibold text-terminal-ink hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
