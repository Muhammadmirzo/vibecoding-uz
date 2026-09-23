"use client";

import * as React from "react";
import { QUIZ_QUESTIONS } from "./quizData";
import { LeadCaptureForm } from "./LeadCaptureForm";
import { QuestionCard } from "./QuestionCard";
import { QuizProgress } from "./QuizProgress";
import { QuizResult } from "./QuizResult";
import {
  calculateRecommendation,
  QuizAnswers,
  QuizCourse,
} from "./scoring";

export const DiagnosticQuiz = React.memo(function DiagnosticQuiz() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<QuizAnswers>({});
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("+998");
  const [submitted, setSubmitted] = React.useState(false);
  const [recommendedCourse, setRecommendedCourse] =
    React.useState<QuizCourse>("vibe-coding-express");
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  const totalSteps = QUIZ_QUESTIONS.length;
  const isFormStep = currentStep === totalSteps;

  React.useEffect(() => {
    if (!submitted) headingRef.current?.focus();
  }, [currentStep, submitted]);

  const handleSelectOption = React.useCallback(
    (stepIndex: number, optionIndex: number) => {
      setAnswers((previous) => ({ ...previous, [stepIndex]: optionIndex }));
    },
    []
  );

  const handleNext = React.useCallback(() => {
    setCurrentStep((previous) => Math.min(previous + 1, totalSteps));
  }, [totalSteps]);

  const handlePrevious = React.useCallback(() => {
    setCurrentStep((previous) => Math.max(previous - 1, 0));
  }, []);

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErrorMessage(null);
      setLoading(true);

      const course = calculateRecommendation(answers);
      setRecommendedCourse(course);

      try {
        const response = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone, source: "quiz", quizAnswers: answers }),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          setErrorMessage(
            response.status === 429
              ? data.error || "Juda ko'p urinish joylandi. Birozdan so'ng qayta urinib ko'ring."
              : data.error || "Natijalarni saqlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
          );
        } else {
          setSubmitted(true);
        }
      } catch (error) {
        console.error("Quiz yuborishda xatolik:", error);
        setErrorMessage("Tarmoqda xatolik yuz berdi. Iltimos, ulanishingizni tekshirib, qayta urinib ko'ring.");
      } finally {
        setLoading(false);
      }
    },
    [answers, name, phone]
  );

  const progressPercent = Math.round(
    ((currentStep + 1) / (totalSteps + 1)) * 100
  );
  const questionNumber = Math.min(currentStep + 1, totalSteps);

  return (
    <div className="mx-auto w-full max-w-[720px] rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-cream-warm)] p-6 shadow-[var(--shadow-lg)] md:p-10">
      {!submitted && (
        <>
          <QuizProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            progressPercent={progressPercent}
          />
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            Savol {questionNumber} / {totalSteps}
          </p>
        </>
      )}

      {submitted ? (
        <QuizResult course={recommendedCourse} name={name} phone={phone} />
      ) : isFormStep ? (
        <LeadCaptureForm
          name={name}
          phone={phone}
          loading={loading}
          errorMessage={errorMessage}
          headingRef={headingRef}
          onNameChange={setName}
          onPhoneChange={setPhone}
          onPrevious={handlePrevious}
          onSubmit={handleSubmit}
        />
      ) : (
        <QuestionCard
          question={QUIZ_QUESTIONS[currentStep]}
          questionIndex={currentStep}
          selectedOption={answers[currentStep]}
          headingRef={headingRef}
          isFirst={currentStep === 0}
          onSelect={(optionIndex) => handleSelectOption(currentStep, optionIndex)}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </div>
  );
});
