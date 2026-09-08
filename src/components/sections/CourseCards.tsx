"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ArrowRight, CirclePlay } from "lucide-react";

export const CourseCards = React.memo(function CourseCards() {
  return (
    <section id="kurs-tanlash" className="relative w-full py-16 md:py-24 bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-[680px] mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-line)] bg-[var(--color-cream-warm)] text-[12px] tracking-wider text-[var(--color-accent)] uppercase font-mono font-bold mb-3">
            <span>Qaysi kurs?</span>
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)] mb-4">
            Sizga qaysi kurs mos?
          </h2>
          <p className="text-base text-[var(--color-ink-muted)]">
            Maqsadingizga qarab tanlang — ikkalasi ham amaliy va sun'iy intellekt bilan.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid gap-6 lg:gap-8 max-w-[960px] mx-auto md:grid-cols-2">
          
          {/* Card 1: Vibe Coding Express */}
          <article className="relative flex flex-col rounded-[var(--radius-xl)] bg-[var(--color-cream-warm)] p-7 md:p-8 border-2 border-[var(--color-accent)] shadow-[var(--shadow-md)]">
            <span className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[var(--color-accent)] text-white text-xs font-mono font-bold tracking-wider uppercase">
              Tavsiya etiladi
            </span>

            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-2">
              Vibe Coding Express
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-6 leading-relaxed">
              AI bilan ishlaydigan mahsulot (web, bot, MVP) qurmoqchi bo'lsangiz.
            </p>

            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-accent)] mb-3">
              Sizga mos, agar:
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "Ilova, MVP yoki Telegram bot qurmoqchisiz",
                "Tadbirkor, marketolog yoki mahsulot egasisiz",
                "Kod yozmasdan real mahsulot chiqarmoqchisiz",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-[var(--color-ink)]">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="text-sm font-semibold text-[var(--color-ink-muted)] mb-5">
              2 990 000 so'mdan · 3 oyga bo'lib to'lash bor
            </div>

            <div className="space-y-3">
              <Link href="/kurs/vibe-coding-express" prefetch={true}>
                <button className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold btn-primary h-12 px-6 text-sm w-full">
                  Kursni ko'rish
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/bepul-dars" prefetch={true}>
                <button className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold btn-secondary h-12 px-6 text-sm w-full">
                  <CirclePlay className="w-4 h-4 text-[var(--color-accent)]" />
                  Bepul darsni ko'rish
                </button>
              </Link>
            </div>
          </article>

          {/* Card 2: AI Asoslari */}
          <article className="relative flex flex-col rounded-[var(--radius-xl)] bg-[var(--color-cream-warm)] p-7 md:p-8 border border-[var(--color-border-strong)] hover:border-[var(--color-accent-line)] transition-colors">
            <h3 className="font-serif text-2xl md:text-3xl font-bold text-[var(--color-ink)] mb-2">
              AI Asoslari
            </h3>
            <p className="text-sm text-[var(--color-ink-muted)] mb-6 leading-relaxed">
              AI vositalari va prompt-injiniringni noldan o'rganmoqchi bo'lsangiz.
            </p>

            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-accent)] mb-3">
              Sizga mos, agar:
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                "AI'da yangi boshlovchisiz",
                "Prompt, hujjat va media yaratishni o'rganmoqchisiz",
                "Kundalik ish va kontentda AI'dan foydalanmoqchisiz",
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-[var(--color-ink)]">
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="text-sm font-semibold text-[var(--color-ink-muted)] mb-5">
              990 000 so'mdan · bir martalik to'lov
            </div>

            <div className="space-y-3">
              <Link href="/kurs/ai-asoslari" prefetch={true}>
                <button className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold btn-secondary h-12 px-6 text-sm w-full">
                  Kursni ko'rish
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/bepul-dars" prefetch={true}>
                <button className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold btn-secondary h-12 px-6 text-sm w-full">
                  <CirclePlay className="w-4 h-4 text-[var(--color-accent)]" />
                  Bepul darsni ko'rish
                </button>
              </Link>
            </div>
          </article>

        </div>
      </div>
    </section>
  );
});
