import { BrainCircuit, CheckCircle2, MessageSquareText, Rocket } from "lucide-react";
import { Container, Section } from "@/components/ui";
import { ProcessDemo } from "@/features/motion/ui/ProcessDemo";
import { Reveal } from "@/features/motion/ui/Reveal";
import { ScrollFillText } from "@/features/motion/ui/ScrollFillText";
import { Spotlight } from "@/features/motion/ui/Spotlight";
import { Tilt } from "@/features/motion/ui/Tilt";

const Icon = BrainCircuit;
const CheckIcon = CheckCircle2;
const MessageIcon = MessageSquareText;
const LaunchIcon = Rocket;

export function Transformation() {
  return (
    <Section pattern={false} className="bg-bg py-24 sm:py-32">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1fr_.65fr] lg:items-end">
          <div>
            <p className="mb-4 font-mono text-sm text-brand">transformatsiya / 0 → 8 hafta</p>
            <h2 className="max-w-4xl font-display text-[clamp(2rem,1.2rem+3vw,3.6rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">
              <ScrollFillText text="G'oyadan — ishlaydigan mahsulotgacha." />
            </h2>
          </div>
          <p className="max-w-xl text-lg leading-relaxed text-ink-muted lg:pb-2">
            Har bir hafta bitta aniq natija: muammo aniqroq, interfeys aniqroq, qaror sizga ochiqroq. Kurs nazariy emas — ko'rinadigan o'zgarishlar ketma-ketligi.
          </p>
        </div>

        <div className="bento-grid mt-14">
          <Reveal className="bento-tile bento-wide" index={0}>
            <Spotlight className="h-full"><Tilt className="h-full">
              <article className="bento-card h-full">
                <div className="bento-index">01</div><Icon className="bento-icon" aria-hidden="true" />
                <div className="mt-auto"><h3>Avval muammoni kichraytiramiz.</h3><p>Vazifa, kim uchun va muvaffaqiyat nimani anglatishi — prompt yozilishidan oldin aniq bo'ladi.</p></div>
              </article>
            </Tilt></Spotlight>
          </Reveal>

          <Reveal className="bento-tile" index={1}>
            <Spotlight className="h-full"><Tilt className="h-full">
              <article className="bento-card h-full">
                <div className="bento-index">02</div><MessageIcon className="bento-icon" aria-hidden="true" />
                <h3>AI bilan tez iteratsiya.</h3><p>Kod, matn va rasmni bir vaqtda solishtirib, kerakli yo'nalishni tanlaysiz.</p>
                <ProcessDemo kind="prompt" />
              </article>
            </Tilt></Spotlight>
          </Reveal>

          <Reveal className="bento-tile" index={2}>
            <Spotlight className="h-full"><Tilt className="h-full">
              <article className="bento-card h-full">
                <div className="bento-index">03</div><CheckIcon className="bento-icon" aria-hidden="true" />
                <h3>Qaror o'zingizniki.</h3><p>AI variant taklif qiladi; siz maqsad va foydalanuvchi uchun to'g'ri qarorni tasdiqlaysiz.</p>
                <ProcessDemo kind="toggle" />
              </article>
            </Tilt></Spotlight>
          </Reveal>

          <Reveal className="bento-tile bento-wide" index={3}>
            <Spotlight className="h-full"><Tilt className="h-full">
              <article className="bento-card h-full">
                <div className="bento-index">04</div><LaunchIcon className="bento-icon" aria-hidden="true" />
                <div className="mt-auto"><h3>Ishlashdan e'lon qilishgacha.</h3><p>Test, xato tuzatish va haqiqiy foydalanuvchiga taqdim etish kursi yakunlanishi emas, tugash nuqtasi emas.</p></div>
              </article>
            </Tilt></Spotlight>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
