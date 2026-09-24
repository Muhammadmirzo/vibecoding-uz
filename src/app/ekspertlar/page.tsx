import type { Metadata } from "next";
import { BadgeCheck, Wrench } from "lucide-react";
import { Container } from "@/components/ui";
import { Card } from "@/components/ui/Surfaces";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { PageHero } from "@/components/pages/PageHero";
import { RevealGroup } from "@/features/motion/ui/Reveal";
import { Tilt } from "@/features/motion/ui/Tilt";

export const metadata: Metadata = { title: "Ekspertlar va bitiruvchilar", description: "Naqsh mentorlik yo‘nalishlari va namuna profillari haqida." };

const experts = [
  { name: "Namuna profil 1", role: "SaaS va botlar yo‘nalishi", skills: ["Claude Code", "Next.js", "Telegram Bot API"] },
  { name: "Namuna profil 2", role: "Prompt va avtomatlashtirish", skills: ["Prompt engineering", "Make.com", "Zod"] },
];

export default function Page() {
  return (
    <div className="bg-bg text-ink">
      <PageHero
        variant="compact"
        eyebrow="Hamjamiyat namunasi"
        title="Kurs jamoasi va mentorlik yo‘nalishlari"
        lede="Quyidagi profillar namuna ko‘rinishida berilgan. Haqiqiy ishtirokchi ma’lumotlari faqat rozik va tekshirilgan holda qo‘shiladi."
      />
      <Container className="pb-20 sm:pb-28">
        <RevealGroup className="grid gap-5 md:grid-cols-2">
          {experts.map((expert) => (
            <Tilt key={expert.name}>
              <Card className="spotlight card-glow h-full">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">{expert.name}</h2>
                    <p className="mt-1 text-sm font-semibold text-accent">{expert.role}</p>
                  </div>
                  <BadgeCheck className="size-6 shrink-0 text-accent" aria-label="Namuna profil" />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {expert.skills.map((skill) => (
                    <span key={skill} className="inline-flex items-center gap-1 rounded-md border border-border bg-bg-sunken px-3 py-1.5 font-mono text-xs text-ink-muted">
                      <Wrench className="size-3" aria-hidden="true" />{skill}
                    </span>
                  ))}
                </div>
                <p className="mt-6 border-t border-border pt-4 text-sm leading-relaxed text-ink-muted">Bu namuna ma’lumot emas. Haqiqiy profil uchun ism, rol va kontaktlar rozik bilan tasdiqlanadi.</p>
              </Card>
            </Tilt>
          ))}
        </RevealGroup>
      </Container>
      <NextStepCTA title="Siz ham o‘z loyihangizni quring" />
    </div>
  );
}
