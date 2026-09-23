import * as React from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { QuizQuestion } from "./quizData";

interface QuestionCardProps {
  question: QuizQuestion;
  questionIndex: number;
  selectedOption?: number;
  headingRef: React.RefObject<HTMLHeadingElement>;
  isFirst: boolean;
  onSelect: (optionIndex: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

interface QuizOptionItemProps {
  label: string;
  description?: string;
  isSelected: boolean;
  onSelect: () => void;
}

const QuizOptionItem = React.memo(function QuizOptionItem({
  label,
  description,
  isSelected,
  onSelect,
}: QuizOptionItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      className={`flex w-full items-start gap-3.5 rounded-[var(--radius-lg)] border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-cream-warm)] ${
        isSelected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-sm"
          : "border-[var(--color-border-strong)] bg-[var(--color-cream)] hover:border-[var(--color-accent-line)]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
          isSelected
            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
            : "border-[var(--color-ink-subtle)]"
        }`}
      >
        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
      </span>
      <span>
        <span className="block text-sm font-semibold text-[var(--color-ink)]">{label}</span>
        {description && (
          <span className="mt-0.5 block text-xs text-[var(--color-ink-muted)]">{description}</span>
        )}
      </span>
    </button>
  );
});

export function QuestionCard({
  question,
  questionIndex,
  selectedOption,
  headingRef,
  isFirst,
  onSelect,
  onPrevious,
  onNext,
}: QuestionCardProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-bold text-[var(--color-ink)] focus:outline-none md:text-2xl"
        >
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="text-sm text-[var(--color-ink-muted)]">{question.subtitle}</p>
        )}
      </div>

      <div className="space-y-3" role="group" aria-label={`${questionIndex + 1}-savol javoblari`}>
        {question.options.map((option, index) => (
          <QuizOptionItem
            key={option.label}
            label={option.label}
            description={option.description}
            isSelected={selectedOption === index}
            onSelect={() => onSelect(index)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-4">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          className="btn-secondary inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" /> Orqaga
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={selectedOption === undefined}
          className="btn-primary inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] px-8 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          Keyingisi <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
