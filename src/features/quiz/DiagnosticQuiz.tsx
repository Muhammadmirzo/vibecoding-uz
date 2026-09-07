"use client";

import * as React from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, QuizQuestion } from "./quizData";
import { Check, ArrowRight, ArrowLeft, Sparkles, Phone, User, CheckCircle2, Loader2 } from "lucide-react";

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
    <div
      onClick={onSelect}
      className={`cursor-pointer p-4 rounded-[var(--radius-lg)] border transition-all duration-200 flex items-start gap-3.5 ${
        isSelected
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-sm"
          : "border-[var(--color-border-strong)] bg-[var(--color-cream)] hover:border-[var(--color-accent-line)]"
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0 ${
          isSelected
            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
            : "border-[var(--color-ink-subtle)]"
        }`}
      >
        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
      </div>
      <div>
        <div className="text-sm font-semibold text-[var(--color-ink)]">
          {label}
        </div>
        {description && (
          <div className="text-xs text-[var(--color-ink-muted)] mt-0.5">
            {description}
          </div>
        )}
      </div>
    </div>
  );
});

export const DiagnosticQuiz = React.memo(function DiagnosticQuiz() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("+998");
  const [submitted, setSubmitted] = React.useState(false);
  const [recommendedCourse, setRecommendedCourse] = React.useState<"vibe-coding-express" | "ai-asoslari">("vibe-coding-express");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const totalSteps = QUIZ_QUESTIONS.length;
  const isFormStep = currentStep === totalSteps;

  const handleSelectOption = React.useCallback((stepIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [stepIndex]: optionIndex }));
  }, []);

  const handleNext = React.useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const handlePrev = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const calculateRecommendation = React.useCallback(() => {
    let expressScore = 0;
    let basicsScore = 0;

    Object.entries(answers).forEach(([qIdx, optIdx]) => {
      const question = QUIZ_QUESTIONS[Number(qIdx)];
      if (question && question.options[optIdx]) {
        const selected = question.options[optIdx];
        if (selected.targetCourse === "vibe-coding-express") {
          expressScore += selected.weight;
        } else {
          basicsScore += selected.weight;
        }
      }
    });

    return expressScore >= basicsScore ? "vibe-coding-express" : "ai-asoslari";
  }, [answers]);

  const handleSubmit = React.useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const course = calculateRecommendation();
    setRecommendedCourse(course);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          source: "quiz",
          quizAnswers: answers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 429) {
          setErrorMsg(data.error || "Juda ko'p urinish joylandi. Birozdan so'ng qayta urinib ko'ring.");
        } else {
          setErrorMsg(data.error || "Xatolik yuz berdi");
        }
      }
    } catch {
      // Continue locally even if server call fails in dev/offline
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  }, [calculateRecommendation, name, phone, answers]);

  const progressPercent = React.useMemo(() => {
    return Math.round(((currentStep + 1) / (totalSteps + 1)) * 100);
  }, [currentStep, totalSteps]);

  return (
    <div className="w-full max-w-[720px] mx-auto bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-6 md:p-10 shadow-[var(--shadow-lg)]">
      
      {/* Progress Bar */}
      {!submitted && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-[var(--color-ink-subtle)] mb-2">
            <span>Savol {Math.min(currentStep + 1, totalSteps)} / {totalSteps}</span>
            <span>{progressPercent}% bajarildi</span>
          </div>
          <div className="w-full h-2 bg-[var(--color-cream-deep)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Submitted Result Screen */}
      {submitted ? (
        <div className="text-center py-6 space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#27C93F]/15 text-[#27C93F] mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-mono font-bold uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Diagnostika natijasi
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-ink)]">
              Sizga mos kurs:{" "}
              <span className="accent-serif">
                {recommendedCourse === "vibe-coding-express" ? "Vibe Coding Express" : "AI Asoslari"}
              </span>
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)] max-w-[500px] mx-auto">
              Javoblaringiz tahlil qilindi. Rahmat, <strong>{name}</strong>! Menejerimiz tez orada <strong>{phone}</strong> raqamingizga bog'lanadi va bepul konsultatsiya beradi.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/kurs/${recommendedCourse}`} prefetch={true}>
              <button className="btn-primary h-12 px-8 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                Tavsiya etilgan kursni ko'rish
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/bepul-dars" prefetch={true}>
              <button className="btn-secondary h-12 px-6 rounded-[var(--radius-md)] text-sm font-semibold w-full sm:w-auto">
                Bepul darsni boshlash
              </button>
            </Link>
          </div>
        </div>
      ) : isFormStep ? (
        /* Lead Capture Form Step */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[var(--color-ink)]">
              Natijani olish uchun ma'lumotlarni kiriting
            </h2>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Shaxsiy tavsiya va bepul darsga kirish havolasi ko'rsatiladi.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[var(--color-ink)] mb-1.5 uppercase">
                Ismingiz
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-[var(--color-ink-subtle)] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ismingizni kiriting"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[var(--color-ink)] mb-1.5 uppercase">
                Telefon raqamingiz (Telegram)
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-[var(--color-ink-subtle)] absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="+998 90 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={loading}
              className="btn-secondary h-12 px-5 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Orqaga
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-12 px-8 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...
                </>
              ) : (
                <>
                  Natijani ko'rish
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Quiz Question Steps */
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--color-ink)]">
              {QUIZ_QUESTIONS[currentStep].question}
            </h2>
            {QUIZ_QUESTIONS[currentStep].subtitle && (
              <p className="text-sm text-[var(--color-ink-muted)]">
                {QUIZ_QUESTIONS[currentStep].subtitle}
              </p>
            )}
          </div>

          <div className="space-y-3">
            {QUIZ_QUESTIONS[currentStep].options.map((opt, idx) => {
              const isSelected = answers[currentStep] === idx;
              return (
                <QuizOptionItem
                  key={idx}
                  label={opt.label}
                  description={opt.description}
                  isSelected={isSelected}
                  onSelect={() => handleSelectOption(currentStep, idx)}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="btn-secondary h-12 px-5 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Orqaga
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={answers[currentStep] === undefined}
              className="btn-primary h-12 px-8 rounded-[var(--radius-md)] text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Keyingisi
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
});
