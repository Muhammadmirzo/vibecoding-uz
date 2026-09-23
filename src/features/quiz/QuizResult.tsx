import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { QuizCourse } from "./scoring";

interface QuizResultProps {
  course: QuizCourse;
  name: string;
  phone: string;
}

export function QuizResult({ course, name, phone }: QuizResultProps) {
  return (
    <div className="space-y-6 py-6 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-soft)] px-3 py-1 font-mono text-xs font-bold uppercase text-[var(--color-accent)]">
          <Sparkles className="h-3.5 w-3.5" /> Diagnostika natijasi
        </span>
        <h2 className="text-2xl font-extrabold text-[var(--color-ink)] md:text-3xl">
          Sizga mos kurs:{" "}
          <span className="accent-serif">
            {course === "vibe-coding-express" ? "Vibe Coding Express" : "AI Asoslari"}
          </span>
        </h2>
        <p className="mx-auto max-w-[500px] text-sm text-[var(--color-ink-muted)]">
          Javoblaringiz tahlil qilindi. Rahmat, <strong>{name}</strong>! Menejerimiz tez orada{" "}
          <strong>{phone}</strong> raqamingizga bog&apos;lanadi va bepul konsultatsiya beradi.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
        <Link href={`/kurs/${course}`} prefetch={true} className="w-full sm:w-auto">
          <button type="button" className="btn-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] px-8 text-sm font-semibold sm:w-auto">
            Tavsiya etilgan kursni ko&apos;rish <ArrowRight className="h-4 w-4" />
          </button>
        </Link>
        <Link href="/bepul-dars" prefetch={true} className="w-full sm:w-auto">
          <button type="button" className="btn-secondary h-12 w-full rounded-[var(--radius-md)] px-6 text-sm font-semibold sm:w-auto">
            Bepul darsni boshlash
          </button>
        </Link>
      </div>
    </div>
  );
}
