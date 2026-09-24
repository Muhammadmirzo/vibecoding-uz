import type { Metadata } from "next";
import { LeadCaptureForm } from "@/features/leads/ui/LeadCaptureForm";
import { Container } from "@/components/ui/Layout";
import { Card } from "@/components/ui/Surfaces";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal, RevealGroup } from "@/features/motion/ui/Reveal";

export const metadata: Metadata = { title: "Bepul AI resurslar", description: "Tadbirkor, marketolog va o‘qituvchilar uchun AI promptlari hamda amaliy qo‘llanmalar." };

const resources = [
  { title: "Tadbirkorlar", count: "Promptlar va MVP checklist" },
  { title: "Marketologlar", count: "Kontent va SMM starter" },
  { title: "O‘qituvchilar", count: "Dars rejalari va mashqlar" },
  { title: "Moliya mutaxassislari", count: "Hisobot va formulalar" },
];

export default function Page() {
  return (
    <div className="bg-bg text-ink">
      <PageHero
        variant="compact"
        eyebrow="Bepul kutubxona"
        title="Sohangizga mos AI resurslari"
        lede="Telegram orqali yuklab olishdan oldin, resurslarni yuborish uchun ma’lumot qoldiring."
      />
      <Container className="pb-20 sm:pb-28">
        <RevealGroup className="grid gap-5 sm:grid-cols-2">
          {resources.map((item) => (
            <Card key={item.title} className="card-glow">
              <h2 className="font-display text-xl font-bold text-ink">{item.title}</h2>
              <p className="mt-2 text-sm text-ink-muted">{item.count}</p>
            </Card>
          ))}
        </RevealGroup>
        <Reveal>
          <Card className="mt-12 max-w-xl">
            <LeadCaptureForm source="resurslar" ctaLabel="Resurslarni olish" title="Telegram havolasini ochish" description="Ma’lumotlarni qoldirgandan keyin resurslar havolasi ko‘rsatiladi." revealUrl="https://t.me/m/ODAfK_QIMjky" revealText="Telegram orqali resurslarni yuklab oling." />
          </Card>
        </Reveal>
      </Container>
      <NextStepCTA title="Resurdan keyin o‘z loyihangizni boshlang" />
    </div>
  );
}
