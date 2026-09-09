"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PORTFOLIO_DATA } from "@/features/portfolio/portfolioData";

export function PortfolioSection() {
  const featuredItems = PORTFOLIO_DATA.slice(0, 6);
  const totalCount = PORTFOLIO_DATA.length;

  return (
    <section
      id="portfel"
      className="relative w-full py-16 md:py-24 bg-[#141413] text-white border-y border-white/10 overflow-hidden scroll-mt-24"
    >
      {/* Background Radial Accent Glow (Matching vibecoding.uz reference) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[70%] max-w-[720px] h-[320px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(ellipse at center, var(--color-accent) 0%, transparent 70%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        {/* Section Header */}
        <div className="relative text-center max-w-[720px] mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-accent/40 bg-white/[0.05] text-xs md:text-sm tracking-widest text-accent uppercase font-mono font-bold mb-3">
            ISBOT
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 text-balance">
            Portfelim — mening{" "}
            <span className="font-serif italic font-normal text-accent">
              diplomim
            </span>
          </h2>
          <p className="text-sm md:text-base text-white/70 text-balance">
            Sertifikat emas, slayd emas — ishlab turgan bizneslar. Barchasini shu kursda o&apos;rgatadigan metod bilan qurganman. Bosing, o&apos;zingiz ko&apos;ring.
          </p>
        </div>

        {/* MacBook Portfolio Cards Grid (6 items max on desktop) */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {featuredItems.map((item) => (
            <PortfolioCard key={item.id} item={item} variant="dark" />
          ))}
        </div>

        {/* View All Portfolios CTA Button when total items > 6 */}
        {totalCount > 6 && (
          <div className="mt-12 text-center">
            <Link
              href="/portfolio"
              prefetch={true}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-accent text-white font-semibold text-sm md:text-base shadow-sm hover:bg-accent-hover transition-colors group"
            >
              <span>Barcha portfoliolarni ko&apos;rish ({totalCount}+)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Info Banner (Matching vibecoding.uz reference) */}
        <div className="relative mt-12 max-w-[900px] mx-auto flex items-start gap-4 p-5 md:p-6 rounded-2xl border border-accent/30 border-l-4 border-l-accent bg-white/[0.05] text-white">
          <Info className="w-5.5 h-5.5 shrink-0 mt-0.5 text-accent" />
          <p className="text-xs md:text-sm text-white/80 leading-relaxed">
            O&apos;zim loyihalar qilaman — va aynan shu yo&apos;lni sizga o&apos;rgataman. Siz o&apos;qiyotgan bu platformaning o&apos;zi ham to&apos;liq Claude Code va Vibe Coding bilan qurilgan.
          </p>
        </div>
      </div>
    </section>
  );
}
