import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { LeadCaptureForm } from "@/features/leads/ui/LeadCaptureForm";
import { Container } from "@/components/ui/Layout";
import { Card } from "@/components/ui/Surfaces";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal, RevealGroup } from "@/features/motion/ui/Reveal";

export const metadata: Metadata = { title: "Jonli meetlar va yozuvlar", description: "Naqsh jonli sessiyalari va ochiq AI yozuvlari." };

const meets = [
  { title: "Claude Code bilan Telegram bot yaratish", date: "18-Oktyabr, 2026 · 20:00", live: true, text: "Jonli sessiyada bot loyihasini bosqichma-bosqich quramiz." },
  { title: "Cursor IDE va VS Code: AI agentlarni sozlash", date: "28-Avgust, 2026", live: false, text: "Koddagi xatolarni tezroq topish bo‘yicha amaliy meet yozuvi." },
];

export default function Page() {
  return (
    <div className="bg-bg text-ink">
      <PageHero
        variant="compact"
        eyebrow="Jonli sessiyalar"
        title="Meetlar va yozuvlar"
        lede="Savollarga javob olish va birga kodlash uchun ochiq sessiyalar."
      />
      <Container className="pb-20 sm:pb-28">
        <RevealGroup className="grid gap-5 md:grid-cols-2">
          {meets.map((meet) => (
            <Card key={meet.title} className="card-glow flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-mono text-xs text-accent">
                  <Calendar className="size-4" aria-hidden="true" />{meet.date}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-ink-muted">
                  {meet.live && (
                    <span className="relative flex size-2" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                      <span className="relative inline-flex size-2 rounded-full bg-success" />
                    </span>
                  )}
                  {meet.live ? "Yaqinlashayotgan" : "Yozuv"}
                </span>
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold text-ink">{meet.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{meet.text}</p>
              <p className="mt-6 text-sm text-ink-subtle">Telegram havolasini olish uchun pastdagi shaklni to‘ldiring.</p>
            </Card>
          ))}
        </RevealGroup>
        <Reveal>
          <Card className="mt-12 max-w-xl">
            <LeadCaptureForm source="meetlar" ctaLabel="Meetlarga qo‘shilish" title="Meet havolasini olish" description="Ma’lumotlarni qoldirgandan keyin Telegram havolasi ochiladi." revealUrl="https://t.me/m/ODAfK_QIMjky" revealText="Meet yozuvlari Telegram orqali ochiladi." />
          </Card>
        </Reveal>
      </Container>
      <NextStepCTA title="Meetdan keyin o‘z yo‘nalishingizni aniqlang" />
    </div>
  );
}
