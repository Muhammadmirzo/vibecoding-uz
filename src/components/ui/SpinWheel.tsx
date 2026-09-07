"use client";

import * as React from "react";
import { Sparkles, RotateCcw } from "lucide-react";

export interface SpinWheelTerm {
  termEn: string;
  termUz: string;
  category: string;
  definition: string;
}

interface SpinWheelProps {
  terms: SpinWheelTerm[];
}

export function SpinWheel({ terms }: SpinWheelProps) {
  const [randomTerm, setRandomTerm] = React.useState<SpinWheelTerm | null>(null);
  const [isSpinning, setIsSpinning] = React.useState(false);

  const handleSpinWheel = React.useCallback(() => {
    if (!terms || terms.length === 0 || isSpinning) return;

    setIsSpinning(true);
    let counter = 0;
    const maxSteps = 12;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * terms.length);
      setRandomTerm(terms[idx]);
      counter++;

      if (counter >= maxSteps) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  }, [terms, isSpinning]);

  return (
    <div className="max-w-[720px] mx-auto mb-10 p-6 rounded-[var(--radius-xl)] bg-[var(--color-cream-warm)] border border-[var(--color-accent-line)] text-center space-y-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[var(--color-accent)] uppercase">
        <Sparkles className="w-4 h-4" /> Interaktiv Tasodifiy Atama (Spin Wheel)
      </div>

      <button
        type="button"
        onClick={handleSpinWheel}
        disabled={isSpinning}
        className="btn-primary h-11 px-6 rounded-[var(--radius-md)] text-xs font-semibold inline-flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
      >
        <RotateCcw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
        <span>{isSpinning ? "Tanlanmoqda..." : "Tasodifiy atamani tanlash"}</span>
      </button>

      {randomTerm && (
        <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-cream)] border border-[var(--color-border-strong)] text-left mt-4 space-y-1 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-[var(--color-ink)]">
              {randomTerm.termEn} ({randomTerm.termUz})
            </span>
            <span className="text-xs font-mono text-[var(--color-accent)]">
              {randomTerm.category}
            </span>
          </div>
          <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
            {randomTerm.definition}
          </p>
        </div>
      )}
    </div>
  );
}

export default React.memo(SpinWheel);
