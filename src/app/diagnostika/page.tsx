import { DiagnosticQuiz } from "@/features/quiz/DiagnosticQuiz";
import { QUIZ_QUESTIONS } from "@/features/quiz/domain/questions";
import { Badge } from "@/components/ui/Surfaces";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surfaces";
import { Container, Eyebrow } from "@/components/ui/Layout";
import { Reveal } from "@/features/motion/ui/Reveal";
import { routeMetadata } from "@/lib/seo";
import "@/components/pages/w6c.css";

export const metadata = routeMetadata({
  title: "Bepul diagnostika — sizga mos kursni 2 daqiqada aniqlang",
  description: `${QUIZ_QUESTIONS.length} ta tezkor savolga javob bering va maqsadingizga mos AI kurs tavsiyasini oling.`,
  path: "/diagnostika",
});

export default function DiagnostikaPage() {
  return (
    <div className="bg-bg pb-20">
      <div className="w6c-hero">
        <div className="w6c-hero-mesh" aria-hidden="true" />
        <Container className="relative z-10 pt-28 sm:pt-32">
          <div className="mx-auto mb-10 max-w-2xl space-y-4 text-center">
            <Badge variant="gold" className="w6c-load" style={{ "--i": 0 } as React.CSSProperties}>
              2 daqiqa · {QUIZ_QUESTIONS.length} savol · bepul
            </Badge>
            <h1 className="w6c-load max-w-4xl text-balance font-display text-[clamp(2rem,1.2rem+3vw,3.25rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-ink" style={{ "--i": 1 } as React.CSSProperties}>
              Qaysi kurs maqsadingizga mos keladi?
            </h1>
            <p className="w6c-load text-lg text-ink-muted" style={{ "--i": 2 } as React.CSSProperties}>
              Quyidagi savollarga samimiy javob bering — oxirida sizga mos
              yo&apos;nalish va keyingi qadamni ko&apos;rsatamiz.
            </p>
          </div>
        </Container>
      </div>

      <Container>
        <DiagnosticQuiz />

        <Reveal>
          <Card className="card-glow mx-auto mt-12 max-w-2xl p-6 text-center">
            <Eyebrow className="mb-2">Savollarga javob berishni xohlamaysizmi?</Eyebrow>
            <p className="text-sm text-ink-muted">
              To&apos;g&apos;ridan-to&apos;g&apos;ri 30 daqiqalik bepul darsni ko&apos;ring va metodni o&apos;zingiz baholang.
            </p>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/bepul-dars" variant="secondary">
                Bepul darsga yozilish
              </Button>
              <Button href="/kurs/vibe-coding-express" variant="ghost">
                Kurslarni ko&apos;rish
              </Button>
            </div>
          </Card>
        </Reveal>
      </Container>
    </div>
  );
}
