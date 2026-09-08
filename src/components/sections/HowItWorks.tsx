"use client";

import * as React from "react";
import { siteConfig } from "@/lib/siteConfig";
import { Video, PauseCircle, Send, ClipboardCheck, Radio } from "lucide-react";

interface StepItem {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
}

const steps: StepItem[] = [
  {
    step: 1,
    title: "Video dars",
    subtitle: "Jonli qurish bilan, slaydsiz",
    description: "Har bir darsda tayyor slaydlar o'rniga, AI yordamida real ilova va tizimlar noldan yig'ilishi amalda ko'rsatiladi.",
    icon: Video,
  },
  {
    step: 2,
    title: "Amaliy pauza",
    subtitle: "Promptni nusxalab o'zingiz qurasiz",
    description: "Dars davomida berilgan aniq prompt va ko'rsatmalarni o'z kompyuteringizda darhol takrorlab, natijani ko'rasiz.",
    icon: PauseCircle,
  },
  {
    step: 3,
    title: "Uy vazifa",
    subtitle: "Telegram botga, aniq qabul mezoni bilan",
    description: "Bajargan amaliy vazifangizni Telegram botga yuborasiz. Aniq va shaffof mezonlar bo'yicha topshiriq qabul qilinadi.",
    icon: Send,
  },
  {
    step: 4,
    title: "Shaxsiy fidbek",
    subtitle: "Vazifangizni mentor ko'radi",
    description: "Yuborgan loyihangiz va kodingizni mentor shaxsan tekshirib, kamchiliklar hamda yaxshilash bo'yicha tahlil beradi.",
    icon: ClipboardCheck,
  },
  {
    step: 5,
    title: "Jonli sessiya",
    subtitle: `Haftada bir, hammasi yoziladi (${siteConfig.sessionFormat})`,
    description: "Haftalik jonli muloqotda murakkab savollarga javob olasiz, o'quvchilar loyihalari va real keyslar birgalikda tahlil qilinadi.",
    icon: Radio,
  },
];

export const HowItWorks = React.memo(function HowItWorks() {
  return (
    <section id="qanday-ishlaydi" className="relative w-full py-16 md:py-24 bg-cream border-b border-border">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="max-w-[720px] mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-accent-line bg-cream-warm text-[12px] tracking-wider text-accent uppercase font-mono font-bold mb-4 shadow-sm">
            <span>O'quv metodikasi</span>
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-ink mb-4 leading-tight">
            Qanday ishlaydi?
          </h2>
          <p className="text-base md:text-lg text-ink-muted leading-relaxed">
            Quruq ma'ruzalar o'rniga — ketma-ketlikda amaliy ko'nikma shakllantiruvchi 5 bosqichli o'quv tizimi.
          </p>
        </div>

        {/* 5 Steps Grid & Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Numbered List (1-5 circles with accent color) */}
          <div className="space-y-6 md:space-y-8 relative">
            <div className="hidden sm:block absolute left-[23px] top-6 bottom-6 w-[2px] bg-border-strong -z-10" />

            {steps.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.step}
                  className="group relative flex flex-col sm:flex-row items-start gap-4 md:gap-6 p-5 md:p-6 rounded-xl bg-cream-warm border border-border-strong shadow-sm hover:border-accent-line transition-all duration-200"
                >
                  {/* Accent Circle with Step Number (1-5) */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent text-white font-mono font-bold text-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    {item.step}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xl font-bold text-ink flex items-center gap-2">
                        {item.title}
                      </h3>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent bg-accent-soft px-2.5 py-1 rounded-md">
                        <IconComponent className="w-3.5 h-3.5" />
                        {item.subtitle}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted leading-relaxed pt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Visual Summary Card */}
          <div className="sticky top-24 rounded-xl border border-border-strong bg-cream-warm p-6 md:p-8 shadow-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-mono font-bold mb-4">
              <span>Natijaga yo'naltirilgan tizim</span>
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-4">
              Nima uchun bu metod samarali?
            </h3>
            <p className="text-sm text-ink-muted leading-relaxed mb-6">
              Siz faqat videolarni tomosha qilib o'tirmaysiz. Har bir darsdan so'ng darhol kodingizni sinaysiz va Telegram bot orqali vazifa topshirib, mentordan shaxsiy baho hamda takliflar olasiz.
            </p>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                <span>Jonli sessiyalar:</span>
                <span className="font-bold text-ink">{siteConfig.sessionFormat}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                <span>Kafolat muddati:</span>
                <span className="font-bold text-success">{siteConfig.guaranteeText}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
                <span>Vazifalar topshirish:</span>
                <span className="font-bold text-ink">Telegram bot orqali 24/7</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
});
