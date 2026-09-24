import type { Metadata } from "next";
import { Check, Clock, ShieldCheck, User, X } from "lucide-react";
import { FaqDisclosure } from "@/components/ui/FaqDisclosure";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Surfaces";
import { Eyebrow, Heading, Section } from "@/components/ui/Layout";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/features/motion/ui/Reveal";
import { ScrollFillText } from "@/features/motion/ui/ScrollFillText";
import { BepulDarsLeadSection } from "./LeadSection";

export const metadata: Metadata = {
  title: "Bepul dars — 30 daqiqada AI bilan mahsulot qurish metodi",
  description:
    "Claude Code yordamida dasturchisiz ilova va bot qurish metodini 30 daqiqalik bepul darsda ko'ring.",
};

const AGENDA = [
  { time: "0–5 daqiqa", title: "Metod bilan tanishuv", text: "Nega AI bilan qurish an'anaviy yo'ldan tezroq ishlaydi." },
  { time: "5–15 daqiqa", title: "Jonli qurilish", text: "AI agenti yordamida kichik loyiha noldan yig'iladi." },
  { time: "15–25 daqiqa", title: "3 ta keng tarqalgan xato", text: "Yangi boshlovchilar yo'l qo'yadigan xatolar va ularning yechimi." },
  { time: "25–30 daqiqa", title: "Keyingi qadam", text: "Qaysi kurs sizga mosligi va qanday boshlash kerakligi." },
];

const FOR_WHOM = [
  "G'oyasi bor, lekin dasturchiga to'lashga byudjeti yo'q tadbirkorlar",
  "AI dan kundalik ishida foydalanmoqchi mutaxassislar",
  "Kod yozishni bilmaydigan, lekin mahsulot qurmoqchi talabalar",
];

const NOT_FOR = [
  "Tayyor nazariya tinglab o'tirmoqchilar — dars amaliy qurilishga qaratilgan",
  "Chuqur dasturlash nazariyasi kutganlar — metod AI bilan qurishga asoslangan",
];

const FAQS = [
  {
    question: "Dars haqiqatan bepulmi?",
    answer: "Ha, to'liq bepul. So'rovni qoldiring; saqlanish tasdiqlanganidan keyin Telegram orqali murojaat qilish yoki bepul dars sahifasidan foydalanish mumkin.",
  },
  {
    question: "Darsni ko'rish uchun dasturlash bilish shartmi?",
    answer: "Yo'q. Dars noldan boshlanadi va barcha qadamlar o'zbek tilida tushuntiriladi.",
  },
  {
    question: "Qancha vaqt ketadi?",
    answer: "30 daqiqa. Istalgan vaqtda to'xtatib, qayta ko'rishingiz mumkin.",
  },
  {
    question: "Keyin kursga yozilish shartmi?",
    answer: "Yo'q, hech qanday majburiyat yo'q. Darsdan keyin qaysi yo'nalish mosligini o'zingiz hal qilasiz.",
  },
];

const BENEFITS = [
  "MVP va Telegram bot qurishning 5 bosqichi",
  "Yangi boshlovchilar yo'l qo'yadigan 3 ta xato",
  "To'lov tizimi ulangan real misol",
];

export default function BepulDarsPage() {
  return (
    <div className="bg-bg">
      <PageHero
        eyebrow="Bepul video dars · 30 daqiqa"
        title="AI bilan 30 daqiqada haqiqiy loyiha qurish metodi"
        lede="Dasturchisiz, faqat AI agentlariga to'g'ri topshiriq berib mahsulot yaratish uslubini jonli misolda ko'ring."
        meta={
          <ul className="w6c-load mt-6 space-y-3" style={{ "--i": 2 } as React.CSSProperties}>
            {BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm font-semibold text-ink">
                <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        }
        aside={<BepulDarsLeadSection />}
      >
        <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-lg border border-border bg-bg-sunken p-4">
          <ShieldCheck className="size-6 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-xs text-ink-muted">
            Dars to&apos;liq bepul. Ma&apos;lumotlaringiz xavfsiz saqlanadi va spam yuborilmaydi.
          </p>
        </div>
      </PageHero>

      <Section pattern={false} className="w6c-wipe bg-bg-sunken">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow className="mb-4">Dars rejasi</Eyebrow>
            <Heading>30 daqiqada nimalarni ko&apos;rasiz</Heading>
            <p className="mt-4 font-display text-lg font-medium text-ink">
              <ScrollFillText text="Har bir daqiqa rejalangan: nazariya kam, jonli qurilish ko'p." />
            </p>
            <div className="w6c-path mt-8">
              <div className="w6c-path-rail" aria-hidden="true"><div className="w6c-path-progress" /></div>
              <ol className="space-y-4">
                {AGENDA.map((item) => (
                  <li key={item.title} className="w6c-step">
                    <span className="w6c-step-dot" aria-hidden="true" />
                    <div className="w6c-step-card flex gap-4">
                      <span className="flex shrink-0 items-center gap-1.5 self-start font-mono text-xs font-semibold text-brand">
                        <Clock className="size-4" aria-hidden="true" /> {item.time}
                      </span>
                      <span>
                        <span className="block font-semibold text-ink">{item.title}</span>
                        <span className="mt-1 block text-sm text-ink-muted">{item.text}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="space-y-6 lg:pt-[4.5rem]">
            <div>
              <Eyebrow className="mb-4">Kim uchun</Eyebrow>
              <Heading className="text-2xl">Bu dars sizga mos, agar...</Heading>
              <ul className="mt-6 space-y-3">
                {FOR_WHOM.map((item, index) => (
                  <li key={item} data-reveal="" style={{ "--i": index } as React.CSSProperties} className="reveal flex items-start gap-3 rounded-lg border border-border bg-bg-elevated p-4 text-sm text-ink">
                    <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Heading className="text-2xl">Kimga mos emas</Heading>
              <ul className="mt-6 space-y-3">
                {NOT_FOR.map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-lg border border-border bg-bg-elevated p-4 text-sm text-ink-muted">
                    <X className="mt-0.5 size-5 shrink-0 text-ink-subtle" aria-hidden="true" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Mentor" title="Darsni kim o'tadi?">
        <Reveal>
          <Card className="card-glow mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft font-display text-xl font-semibold text-brand" aria-hidden="true">
              <User className="size-7" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-ink">Mirzo</p>
              <p className="mt-1 text-sm text-ink-muted">
                EduBaza va Chatla loyihalari muallifi, vibe coding mentori. Darsda
                real loyihalarda qo&apos;llaniladigan usulni ko&apos;rsatadi.
              </p>
            </div>
          </Card>
        </Reveal>
      </Section>

      <Section pattern={false} className="bg-bg-sunken" eyebrow="Savol-javob" title="Ko'p so'raladigan savollar">
        <FaqDisclosure items={FAQS} />
        <Reveal className="mx-auto mt-10 flex max-w-3xl flex-col justify-center gap-3 sm:flex-row">
          <Button href="/diagnostika" size="lg">
            Avval diagnostikadan o&apos;tish
          </Button>
          <Button href="/kurs/vibe-coding-express" size="lg" variant="outline">
            Kurs dasturini ko&apos;rish
          </Button>
        </Reveal>
      </Section>
    </div>
  );
}
