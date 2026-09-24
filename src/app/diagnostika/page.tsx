import type { Metadata } from "next";
import { DiagnosticQuiz } from "@/features/quiz/DiagnosticQuiz";
import { QUIZ_QUESTIONS } from "@/features/quiz/domain/questions";
import { Badge } from "@/components/ui/Surfaces";
import { Button } from "@/components/ui/Button";
import { Container, Eyebrow, Heading } from "@/components/ui/Layout";

export const metadata: Metadata = {
  title: "Bepul diagnostika — sizga mos kursni 2 daqiqada aniqlang",
  description: `${QUIZ_QUESTIONS.length} ta tezkor savolga javob bering va maqsadingizga mos AI kurs tavsiyasini oling.`,
};

export default function DiagnostikaPage() {
  return (
    <div className="bg-bg pb-20 pt-28">
      <Container>
        <div className="mx-auto mb-10 max-w-2xl space-y-4 text-center">
          <Badge variant="gold">2 daqiqa · {QUIZ_QUESTIONS.length} savol · bepul</Badge>
          <Heading as="h1">Qaysi kurs maqsadingizga mos keladi?</Heading>
          <p className="text-ink-muted">
            Quyidagi savollarga samimiy javob bering — oxirida sizga mos
            yo'nalish va keyingi qadamni ko'rsatamiz.
          </p>
        </div>

        <DiagnosticQuiz />

        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-border bg-bg-elevated p-6 text-center">
          <Eyebrow className="mb-2">Savollarga javob berishni xohlamaysizmi?</Eyebrow>
          <p className="text-sm text-ink-muted">
            To'g'ridan-to'g'ri 30 daqiqalik bepul darsni ko'ring va metodni o'zingiz baholang.
          </p>
          <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/bepul-dars" variant="secondary">
              Bepul darsga yozilish
            </Button>
            <Button href="/kurs/vibe-coding-express" variant="ghost">
              Kurslarni ko'rish
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
