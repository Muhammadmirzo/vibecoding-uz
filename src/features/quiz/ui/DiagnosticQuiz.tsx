"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surfaces";
import { QUIZ_QUESTIONS } from "../domain/questions";
import { calculateRecommendation, type QuizAnswers } from "../domain/scoring";

const LeadCaptureForm = dynamic(
  () => import("@/features/leads/ui/LeadCaptureForm").then((mod) => mod.LeadCaptureForm),
  { ssr: false },
);

const QuizResultCard = dynamic(
  () => import("./QuizResultCard").then((mod) => mod.QuizResultCard),
  { ssr: false },
);

type Phase = "quiz" | "contact" | "result";

export function DiagnosticQuiz() {
  const [phase, setPhase] = React.useState<Phase>("quiz");
  const [stepIndex, setStepIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<QuizAnswers>({});
  const [leadName, setLeadName] = React.useState("");
  const headingRef = React.useRef<HTMLLegendElement>(null);

  const totalSteps = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[stepIndex];
  const selected = answers[stepIndex];
  const recommendation = React.useMemo(() => calculateRecommendation(answers), [answers]);
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(
    (phase === "quiz" ? stepIndex / (totalSteps + 1) : totalSteps / (totalSteps + 1)) * 100,
  );

  React.useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex, phase]);

  const selectOption = React.useCallback(
    (optionIndex: number) => {
      setAnswers((previous) => ({ ...previous, [stepIndex]: optionIndex }));
    },
    [stepIndex],
  );

  const goNext = React.useCallback(() => {
    if (selected === undefined) return;
    if (stepIndex + 1 >= totalSteps) {
      setPhase("contact");
    } else {
      setStepIndex((index) => index + 1);
    }
  }, [selected, stepIndex, totalSteps]);

  const goBack = React.useCallback(() => {
    if (phase === "contact") {
      setPhase("quiz");
      return;
    }
    setStepIndex((index) => Math.max(index - 1, 0));
  }, [phase]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        goNext();
        return;
      }
      const digit = Number(event.key);
      if (
        Number.isInteger(digit) &&
        digit >= 1 &&
        digit <= (question?.options.length ?? 0)
      ) {
        selectOption(digit - 1);
      }
    },
    [goNext, question, selectOption],
  );

  return (
    <Card className="mx-auto w-full max-w-2xl p-6 sm:p-10">
      {phase !== "result" && (
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between font-mono text-xs font-semibold text-ink-subtle">
            <span aria-current="step">{phase === "contact"
                ? `Oxirgi qadam: aloqa ma'lumoti`
                : `Savol ${stepIndex + 1} / ${totalSteps}`}</span>
            <span>{progressPercent}% bajarildi</span>
          </div>
          <div
            role="progressbar"
            aria-label="Diagnostika jarayoni"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            className="w6c-quizbar"
          >
            <span style={{ transform: `scaleX(${progressPercent / 100})` }} />
          </div>
          <ol className="mt-3 flex items-center gap-1.5" aria-hidden="true">
            {QUIZ_QUESTIONS.map((_, dotIndex) => (
              <li
                key={dotIndex}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  dotIndex < stepIndex || phase !== "quiz" ? "bg-accent" : dotIndex === stepIndex ? "bg-gold" : "bg-border"
                }`}
              />
            ))}
          </ol>
          <p className="sr-only" aria-live="polite">
            {phase === "contact"
              ? "Barcha savollar javoblandi"
              : `Savol ${stepIndex + 1} / ${totalSteps}. Javob shredildi: ${answeredCount} ta.`}
          </p>
        </div>
      )}

      {phase === "result" ? (
        <div className="w6c-result">
          <QuizResultCard course={recommendation} answers={answers} leadName={leadName} />
        </div>
      ) : phase === "contact" ? (
        <div key="contact" className="animate-fade-up">
          <LeadCaptureForm
            source="quiz"
            ctaLabel="Natijamni ko'rish"
            title="Natijani ochish uchun ma'lumot qoldiring"
            description="Shaxsiy tavsiya shu yerda ochiladi. Menejer qo'shimcha maslahat uchun bog'lanadi."
            quizAnswers={answers}
            recommendedCourseId={recommendation}
            onSuccess={(name) => {
              setLeadName(name);
              setPhase("result");
            }}
          />
          <Button variant="ghost" size="sm" onClick={goBack} className="mt-4">
            <ArrowLeft className="size-4" aria-hidden="true" /> Savollarga qaytish
          </Button>
        </div>
      ) : (
        question && (
          <fieldset
            key={stepIndex}
            onKeyDown={handleKeyDown}
            className="animate-fade-up space-y-6"
          >
            <legend ref={headingRef} tabIndex={-1} className="space-y-2 focus:outline-none">
              <span className="block font-display text-xl font-semibold text-ink sm:text-2xl">
                {question.question}
              </span>
              {question.subtitle && (
                <span className="block text-sm text-ink-muted">{question.subtitle}</span>
              )}
            </legend>
            <div className="space-y-3" role="radiogroup" aria-label={`${stepIndex + 1}-savol javoblari`}>
              {question.options.map((option, optionIndex) => {
                const isSelected = selected === optionIndex;
                const inputId = `quiz-q${stepIndex}-o${optionIndex}`;
                return (
                  <label
                    key={option.label}
                    htmlFor={inputId}
                    className={`quiz-option flex w-full cursor-pointer items-start gap-3.5 rounded-lg border p-4 text-left transition-colors focus-within:ring-2 focus-within:ring-gold/40 ${
                      isSelected
                        ? "border-brand bg-brand-soft"
                        : "border-border-strong bg-bg-elevated hover:border-brand"
                    }`}
                  >
                    <input
                      id={inputId}
                      type="radio"
                      name={`quiz-question-${stepIndex}`}
                      checked={isSelected}
                      onChange={() => selectOption(optionIndex)}
                      className="mt-1 size-4 shrink-0 accent-[var(--brand)]"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">
                        <span className="mr-2 font-mono text-xs text-ink-subtle" aria-hidden="true">
                          {optionIndex + 1}
                        </span>
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="mt-0.5 block text-xs text-ink-muted">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-ink-subtle">
              Klaviatura: 1–{question.options.length} — tanlash, Enter — keyingi savol.
            </p>
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>
                <ArrowLeft className="size-4" aria-hidden="true" /> Orqaga
              </Button>
              <Button onClick={goNext} disabled={selected === undefined}>
                {stepIndex + 1 >= totalSteps ? "Natijaga o'tish" : "Keyingisi"}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </fieldset>
        )
      )}
    </Card>
  );
}
