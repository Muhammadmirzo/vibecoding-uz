"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck, ArrowRight, CirclePlay, Quote } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export const HeroSection = React.memo(function HeroSection() {
  return (
    <section className="relative w-full pt-28 pb-16 md:pt-36 md:pb-24 bg-[var(--color-cream-warm)] border-b border-[var(--color-border)]">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-14 items-center">
          
          {/* Left Hero Copy */}
          <div className="text-center lg:text-left">
            {/* Instructor Badge */}
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-line)] bg-[var(--color-cream)] text-[12px] md:text-[13px] tracking-wider text-[var(--color-accent)] uppercase font-mono font-bold mb-5 shadow-sm">
              <BadgeCheck className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0" />
              <span>Mirzo · Dizayner · metodolog · AI ekspert</span>
            </span>

            {/* H1 Heading with Instrument Serif Accent */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-[var(--color-ink)] mb-6 leading-[1.15] tracking-tight">
              AI bilan ishlashni — har kuni AI bilan loyihalar qilayotgan{" "}
              <span className="accent-serif">professional mentordan</span> o'rganing.
            </h1>

            {/* Subheadline */}
            <p className="text-base md:text-lg text-[var(--color-ink-muted)] mb-8 max-w-[580px] mx-auto lg:mx-0 leading-relaxed">
              EduBaza (27 000+ o'qituvchi) va Chatla (500+ biznes) loyihalarini 100% AI bilan qurganman — dasturchilarsiz.
              Ishlarimni 90% ga avtomatlashtirganman. Aynan shu metodni sizga ham o'rgataman.
            </p>

            {/* CTA Cluster */}
            <div className="flex flex-col items-center lg:items-start gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
                <Link href="/diagnostika" prefetch={true} className="w-full sm:w-auto">
                  <button className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold btn-primary h-14 px-8 text-base w-full sm:w-auto">
                    Qaysi kurs menga mos?
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>

                <Link href="/bepul-dars" prefetch={true} className="w-full sm:w-auto">
                  <button className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold btn-secondary h-14 px-6 text-base w-full sm:w-auto">
                    <CirclePlay className="w-5 h-5 text-[var(--color-accent)]" />
                    Bepul darsni olish
                  </button>
                </Link>
              </div>
              <span className="text-xs font-mono text-[var(--color-ink-subtle)] mt-1">
                2 daqiqalik diagnostika · 9 savol · bepul
              </span>
            </div>
          </div>

          {/* Right Instructor Profile Card */}
          <div className="relative mx-auto w-full max-w-[440px] lg:max-w-[480px]">
            <div className="rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] overflow-hidden shadow-[var(--shadow-lg)]">
              <div className="relative aspect-[16/9] bg-[var(--color-cream-deep)] flex items-center justify-center overflow-hidden">
                <img src="/images/hero-banner.jpg" alt="Mirzo Academy Vibe Coding Hero" className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-ink/85 backdrop-blur text-white text-xs font-mono font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  {siteConfig.stats.liveStartupsCount} jonli mahsulot asoschisi
                </div>
              </div>
              <div className="p-5 bg-[var(--color-cream)]">
                <div className="text-lg font-bold text-[var(--color-ink)] mb-1">Mirzo</div>
                <div className="text-xs text-[var(--color-accent)] font-medium mb-3">EdTech tadbirkor · vibe coding mentori</div>
                <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed flex gap-2.5">
                  <Quote className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
                  <span>Sizga quruq nazariya bermayman — kurslarimizda faqat real amaliyot va jonli loyihalar quriladi.</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});
