import type { CSSProperties } from "react";
import { Container, Section } from "@/components/ui";

const stages = [
  { weeks: "1–2", title: "Muammoni aniqlashtirish", copy: "Kim uchun, qanday vazifa va natijani nimadan ko'ramiz — yozma xaritalasiz.", output: "Aniq mahsulot briefi" },
  { weeks: "3–4", title: "Birinchi foydali versiya", copy: "Claude Code bilan interfeys va asosiy foydalanuvchi oqimini quramiz.", output: "Ishlaydigan prototip" },
  { weeks: "5–6", title: "Ma'lumot va integratsiya", copy: "Autentifikatsiya, ma'lumotlar va Telegram kabi kerakli bog'lanishlarni qo'shamiz.", output: "To'liq asosiy oqim" },
  { weeks: "7–8", title: "Test va haqiqiy natija", copy: "Xatolarni tuzatamiz, foydalanuvchiga beramiz va natijani tekshiramiz.", output: "Taqdim etilgan MVP" },
] as const;

export function Roadmap() {
  return (
    <Section pattern={false} className="roadmap-section bg-bg-sunken py-24 sm:py-32">
      <Container>
        <div className="max-w-3xl">
          <p className="mb-4 font-mono text-sm text-brand">8 haftalik yo'l / har bosqichda natija</p>
          <h2 className="font-display text-[clamp(2rem,1.2rem+3vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">Kurs haritasi — chalkash emas, ko'rinadigan.</h2>
          <p className="mt-5 max-w-2xl text-lg text-ink-muted">Bir bosqich tugagach keyingisiga o'tasiz. Har qadamda nimani qilishingiz va nima qo'lga olayotganiz aniq.</p>
        </div>

        <div className="roadmap-map mt-16">
          <svg className="roadmap-path" viewBox="0 0 1200 180" preserveAspectRatio="none" aria-hidden="true">
            <path className="roadmap-path-base" d="M40 90 C170 10 300 10 430 90 S690 170 820 90 S1050 10 1160 90" pathLength="1" />
            <path className="roadmap-path-progress" d="M40 90 C170 10 300 10 430 90 S690 170 820 90 S1050 10 1160 90" pathLength="1" />
          </svg>
          <ol className="roadmap-grid">
            {stages.map((stage, index) => (
              <li key={stage.weeks} className="roadmap-step" style={{ "--i": index } as CSSProperties}>
                <div className="roadmap-dot"><span /></div>
                <article className="roadmap-card">
                  <div className="flex items-start justify-between gap-4"><span className="font-mono text-xs font-semibold text-brand">{stage.weeks}-hafta</span><span className="roadmap-output">{stage.output}</span></div>
                  <h3>{stage.title}</h3><p>{stage.copy}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
