interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  progressPercent: number;
}

export function QuizProgress({
  currentStep,
  totalSteps,
  progressPercent,
}: QuizProgressProps) {
  const questionNumber = Math.min(currentStep + 1, totalSteps);

  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between text-xs font-mono font-semibold text-[var(--color-ink-subtle)]">
        <span aria-current="step">Savol {questionNumber} / {totalSteps}</span>
        <span>{progressPercent}% bajarildi</span>
      </div>
      <div
        role="progressbar"
        aria-label={`Diagnostika savollari: ${questionNumber} / ${totalSteps}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercent}
        aria-valuetext={`${questionNumber} / ${totalSteps} savol, ${progressPercent}% bajarildi`}
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-cream-deep)]"
      >
        <div
          className="h-full bg-[var(--color-accent)] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
