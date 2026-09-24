import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Surfaces";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surfaces";
import { SuccessCheck } from "@/features/motion/ui/SuccessCheck";
import { revealProps } from "@/features/motion/ui/Reveal";
import {
  QUIZ_COURSE_META,
  buildReasoning,
  calculateScores,
  recommendationSummary,
  type QuizAnswers,
  type QuizCourseSlug,
} from "../domain";

interface QuizResultCardProps {
  course: QuizCourseSlug;
  answers: QuizAnswers;
  leadName?: string;
}

export function QuizResultCard({ course, answers, leadName }: QuizResultCardProps) {
  const meta = QUIZ_COURSE_META[course];
  const scores = calculateScores(answers);
  const reasons = buildReasoning(answers);

  return (
    <div className="space-y-6 py-2 text-center">
      <div {...revealProps(0)} className="mx-auto flex size-14 items-center justify-center">
        <SuccessCheck size={56} label="Diagnostika natijasi tayyor" />
      </div>
      <div {...revealProps(1)} className="space-y-3">
        <Badge variant="gold">
          <Sparkles className="mr-1 size-3.5" aria-hidden="true" /> Diagnostika natijasi
        </Badge>
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Sizga mos yo'nalish: {meta.title}
        </h2>
        <p className="mx-auto max-w-xl text-ink-muted">
          {leadName ? <>Rahmat, <strong className="text-ink">{leadName}</strong>! </> : null}
          {recommendationSummary(course, scores)}
        </p>
      </div>

      {reasons.length > 0 && (
        <Card className="mx-auto max-w-xl space-y-3 p-5 text-left" {...revealProps(2)}>
          <h3 className="text-sm font-semibold text-ink">Nega aynan shu kurs?</h3>
          <ul className="space-y-2.5">
            {reasons.slice(0, 4).map((reason) => (
              <li key={reason.questionId} className="flex gap-2.5 text-sm text-ink-muted">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <span>
                  <span className="font-semibold text-ink">{reason.pickedLabel}</span>
                  <span className="block text-xs text-ink-subtle">{reason.question}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mx-auto max-w-xl border-gold/50 bg-gold-soft/40 p-6 text-left" {...revealProps(3)}>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Tavsiya etilgan kurs</p>
        <p className="mt-1 font-display text-xl font-semibold text-ink">{meta.title}</p>
        <p className="mt-2 text-sm text-ink-muted">{meta.tagline}</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button href={meta.courseHref} className="flex-1">
            Kursni ko'rish <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button href="/bepul-dars" variant="secondary" className="flex-1">
            Bepul darsni boshlash
          </Button>
        </div>
      </Card>
    </div>
  );
}
