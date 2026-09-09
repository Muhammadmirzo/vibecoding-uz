"use client";

import * as React from "react";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Filter,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import {
  STATIC_TESTIMONIALS,
} from "@/features/testimonials/testimonialsData";

export default function TestimoniyalarPage() {
  const [selectedRating, setSelectedRating] = React.useState<"all" | "5" | "4">("all");
  const [selectedCourse, setSelectedCourse] = React.useState<string>("all");

  const filteredReviews = React.useMemo(() => {
    return STATIC_TESTIMONIALS.filter((item) => {
      const matchRating =
        selectedRating === "all" || item.rating.toString() === selectedRating;
      const matchCourse =
        selectedCourse === "all" || item.courseTitle === selectedCourse;

      return matchRating && matchCourse;
    });
  }, [selectedRating, selectedCourse]);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-[760px] mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-accent-line bg-cream-warm text-[12px] tracking-wider text-accent uppercase font-mono font-bold">
            <Star className="w-4 h-4 fill-current" /> Bitiruvchilar Natijalari
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight">
            O'quvchilarimiz erishgan{" "}
            <span className="accent-serif">haqiqiy natijalar</span>
          </h1>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Vibe Coding Express va AI Asoslari kurslari bitiruvchilarining yaratgan MVP tizimlari va samimiy fikrlari.
          </p>
        </div>

        {/* Halol reyting xulosasi paneli */}
        <div className="bg-cream-warm border border-border-strong rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-accent fill-current" />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-bold text-ink">
              Fikrlar platforma ichidan — tahrirsiz
            </span>
          </div>
          <div className="text-xs sm:text-sm font-mono font-semibold text-accent">
            {STATIC_TESTIMONIALS.length} ta fikr ko'rsatilmoqda
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-cream-warm border border-border-strong rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Rating Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-ink-subtle uppercase flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Baho:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedRating("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedRating === "all"
                      ? "bg-accent text-white"
                      : "bg-cream text-ink border border-border hover:bg-cream-deep"
                  }`}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setSelectedRating("5")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                    selectedRating === "5"
                      ? "bg-accent text-white"
                      : "bg-cream text-ink border border-border hover:bg-cream-deep"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current text-accent" /> 5 Yulduz
                </button>
                <button
                  onClick={() => setSelectedRating("4")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                    selectedRating === "4"
                      ? "bg-accent text-white"
                      : "bg-cream text-ink border border-border hover:bg-cream-deep"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-current text-accent" /> 4 Yulduz
                </button>
              </div>
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-ink-subtle uppercase">
                Kurs:
              </span>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="h-9 px-3 rounded-lg border border-border-strong bg-cream text-ink text-xs focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">Barcha kurslar</option>
                <option value="Vibe Coding Express">Vibe Coding Express</option>
                <option value="AI Asoslari">AI Asoslari</option>
              </select>
            </div>

          </div>
        </div>

        {/* Reviews List Counter */}
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted border-b border-border pb-3">
          <span>
            Sharhlar soni: <strong className="text-accent">{filteredReviews.length} ta</strong>
          </span>
          <span className="flex items-center gap-1.5 text-success">
            <ShieldCheck className="w-4 h-4" /> Barcha sharhlar haqiqiy bitiruvchilar tomonidan qoldirilgan
          </span>
        </div>

        {/* Reviews Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((item) => {
            const initials = item.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2);

            return (
              <div
                key={item.id}
                className="bg-cream-warm border border-border-strong rounded-2xl overflow-hidden hover:border-accent-line hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                {/* Review Body */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Stars and Result Tag */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.rating
                                ? "text-accent fill-current"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>

                      {item.resultMetric && (
                        <span className="text-[11px] font-mono font-bold text-accent bg-accent-soft px-2.5 py-0.5 rounded-full border border-accent-line">
                          {item.resultMetric}
                        </span>
                      )}
                    </div>

                    {/* Platforma ichidan fikr mikro-belgi */}
                    <div className="flex items-center gap-1.5 font-mono text-xs text-success">
                      <BadgeCheck className="w-4 h-4 text-success flex-shrink-0" />
                      <span>Platforma ichidan fikr</span>
                    </div>

                    {/* Review Text */}
                    <p className="text-xs md:text-sm text-ink-muted leading-relaxed italic">
                      "{item.body}"
                    </p>
                  </div>

                  {/* Student Details Card Footer */}
                  <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center text-xs uppercase tracking-wider">
                          {initials}
                        </div>
                      )}
                      <div>
                        <div className="text-xs md:text-sm font-bold text-ink flex items-center gap-1">
                          {item.fullName}
                          {item.verified && (
                            <span title="Tasdiqlangan bitiruvchi">
                              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-ink-muted">
                          {item.role} {item.company ? `· ${item.company}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-mono font-semibold text-accent">
                        {item.courseTitle}
                      </div>
                      {item.cohortName && (
                        <div className="text-[10px] font-mono text-ink-subtle">
                          {item.cohortName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Big Bottom Action Card */}
        <div className="bg-cream-warm border border-accent-line rounded-2xl p-8 md:p-12 text-center max-w-3xl mx-auto space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-extrabold text-ink">
              Siz ham o'z natijangizni yaratishga{" "}
              <span className="accent-serif">tayyormisiz?</span>
            </h3>
            <p className="text-xs md:text-sm text-ink-muted max-w-lg mx-auto">
              5 daqiqalik diagnostika testidan o'ting va qaysi yo'nalish sizga mos kelishini aniqlang.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/diagnostika">
              <button className="btn-primary h-12 px-8 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                <span>Diagnostika Kvizi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/kurs/vibe-coding-express">
              <button className="btn-secondary h-12 px-8 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                <span>Vibe Coding Express dasturi</span>
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
