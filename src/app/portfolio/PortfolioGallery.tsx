"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Filter, Sparkles } from "lucide-react";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PORTFOLIO_DATA } from "@/features/portfolio/portfolioData";

export function PortfolioGallery() {
  const [selectedCategory, setSelectedCategory] = React.useState("Barchasi");
  const categories = React.useMemo(
    () => ["Barchasi", ...Array.from(new Set(PORTFOLIO_DATA.map((item) => item.category)))],
    [],
  );
  const filteredItems = React.useMemo(
    () =>
      selectedCategory === "Barchasi"
        ? PORTFOLIO_DATA
        : PORTFOLIO_DATA.filter((item) => item.category === selectedCategory),
    [selectedCategory],
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-zinc-950 text-white">
      <div className="mx-auto w-full max-w-[1360px] px-5 pb-16 pt-24 md:px-8 lg:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 transition-colors hover:text-white md:text-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Bosh sahifaga qaytish</span>
          </Link>
          <span className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {PORTFOLIO_DATA.length} ta jonli loyiha
          </span>
        </div>

        <div className="mx-auto mb-10 max-w-[760px] text-center">
          <h1 className="mb-4 text-3xl font-extrabold text-white md:text-5xl">
            Vibe Coding Portfoliolari — <span className="font-serif font-normal italic text-accent">Jonli Loyihalar</span>
          </h1>
          <p className="text-sm leading-relaxed text-white/70 md:text-base">
            Dasturlashsiz, sun&apos;iy intellekt yordamida yaratilgan va bozorda faol ishlayotgan real startap va platformalar to&apos;plami.
          </p>
        </div>

        <div className="mb-6 w-full overflow-x-auto px-1 pb-2 scrollbar-none">
          <div
            role="group"
            aria-label="Kategoriyalar"
            className="flex w-max shrink-0 items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.05] p-1.5"
          >
            <Filter className="ml-2 mr-1 h-4 w-4 text-white/50" aria-hidden="true" />
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-colors md:text-sm ${
                  selectedCategory === category
                    ? "bg-accent text-white shadow-xs"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-10 max-w-2xl text-xs leading-relaxed text-white/60">
          Ko&apos;rsatilgan raqamlar — loyihalarning o&apos;z saytlaridagi ochiq ma&apos;lumotlar; mustaqil audit qilinmagan.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <PortfolioCard key={item.id} item={item} variant="dark" />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="py-16 text-center text-white/60">Ushbu kategoriyada hali loyihalar mavjud emas.</div>
        )}
      </div>
    </div>
  );
}
