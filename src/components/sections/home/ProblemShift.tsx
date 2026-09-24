import { Check, X } from "lucide-react";
import { Container, GirihPattern, Heading, Section } from "@/components/ui";
import { Reveal } from "@/features/motion/ui/Reveal";

const oldWay = ["Nazorat butun boshqaruvda dasturchida", "Har bir o'zgarish yangi muhokama", "Kutilgan natija oldindan aniq emas"];
const newWay = ["Siz bilim va mahsulot qarorini boshqarasiz", "Har bir sprint natijani ko'rsatadi", "Mentor birinchi kunidan yon bo'ladi"];

export function ProblemShift() {
  return (
    <Section pattern={false} className="problem-section bg-bg-sunken py-24 sm:py-32">
      <GirihPattern className="absolute inset-0 h-full w-full text-brand opacity-[0.045]" aria-hidden="true" />
      <Container className="relative grid gap-6 lg:grid-cols-2">
        <Reveal index={0}>
          <article className="problem-panel h-full p-7 sm:p-10">
            <p className="font-mono text-sm text-ink-subtle">eski usul</p>
            <Heading className="mt-3">Avval g'oya bo'lib qolardi.</Heading>
            <p className="mt-4 text-lg text-ink-muted">Dasturchi izlash, narx kelishish va uzoq kutish — har bir qadamda g'oya kechikadi.</p>
            <ul className="mt-8 space-y-4">{oldWay.map((item) => <li key={item} className="flex gap-3 text-ink"><X className="mt-1 size-5 shrink-0 text-danger" aria-hidden="true" />{item}</li>)}</ul>
          </article>
        </Reveal>
        <Reveal index={1}>
          <article className="problem-panel problem-panel-new h-full p-7 sm:p-10">
            <p className="font-mono text-sm text-accent">AI bilan yangi usul</p>
            <Heading className="mt-3">Endi o'zingiz qurasiz.</Heading>
            <p className="mt-4 text-lg text-ink-muted">G'oyani yozing, qadamlarni AI bilan ko'ring va natijani o'zingiz tekshiring.</p>
            <ul className="mt-8 space-y-4">{newWay.map((item) => <li key={item} className="flex gap-3 text-ink"><Check className="mt-1 size-5 shrink-0 text-success" aria-hidden="true" />{item}</li>)}</ul>
          </article>
        </Reveal>
      </Container>
    </Section>
  );
}
