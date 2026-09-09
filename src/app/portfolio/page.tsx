"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PORTFOLIO_DATA, type PortfolioItem } from "@/features/portfolio/portfolioData";
import { ArrowLeft, Sparkles, Filter } from "lucide-react";

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Barchasi");

  const categories = React.useMemo(() => {
    const set = new Set<string>(["Barchasi"]);
    PORTFOLIO_DATA.forEach((item) => set.add(item.category));
    return Array.from(set);
  }, []);

  const filteredItems = React.useMemo(() => {
    if (selectedCategory === "Barchasi") return PORTFOLIO_DATA;
    return PORTFOLIO_DATA.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-[#141413] text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
          {/* Top Breadcrumb & Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Bosh sahifaga qaytish</span>
            </Link>

            <span className="text-xs font-mono font-bold text-accent bg-accent/10 border border-accent/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> {PORTFOLIO_DATA.length} ta Jonli Loyiha
            </span>
          </div>

          {/* Page Header */}
          <div className="text-center max-w-[760px] mx-auto mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Vibe Coding Portfoliolari — <span className="font-serif italic font-normal text-accent">Jonli Loyihalar</span>
            </h1>
            <p className="text-sm md:text-base text-white/70 leading-relaxed">
              Dasturlashsiz, sun&apos;iy intellekt yordamida yaratilgan va bozorda faol ishlayotgan real startap va platformalar to&apos;plami.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-start md:justify-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none w-full px-1">
            <div className="flex items-center gap-1.5 bg-white/[0.05] p-1.5 rounded-2xl border border-white/10 shrink-0">
              <Filter className="w-4 h-4 text-white/50 ml-2 mr-1" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-accent text-white shadow-xs"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolios MacBook Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredItems.map((item) => (
              <PortfolioCard key={item.id} item={item} variant="dark" />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-16 text-center text-white/60">
              Ushbu kategoriyada hali loyihalar mavjud emas.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
