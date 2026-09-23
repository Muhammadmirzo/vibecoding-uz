"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Filter,
  Info,
  Sparkles,
  Star,
} from "lucide-react";
import { STATIC_TESTIMONIALS } from "@/features/testimonials/testimonialsData";

type RatingFilter = "all" | "5" | "4";

const ratingOptions: ReadonlyArray<{ value: RatingFilter; label: string }> = [
  { value: "all", label: "Barchasi" },
  { value: "5", label: "5 Yulduz" },
  { value: "4", label: "4 Yulduz" },
];

const courseOptions = ["Vibe Coding Express", "AI Asoslari"] as const;

export function TestimonialsExplorer() {
  const [selectedRating, setSelectedRating] = useState<RatingFilter>("all");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const filteredReviews = useMemo(
    () =>
      STATIC_TESTIMONIALS.filter(
        (item) =>
          (selectedRating === "all" || item.rating === Number(selectedRating)) &&
          (selectedCourse === "all" || item.courseTitle === selectedCourse),
      ),
    [selectedCourse, selectedRating],
  );

  const resetFilters = () => {
    setSelectedRating("all");
    setSelectedCourse("all");
  };

  return (
    <main className="min-h-screen bg-cream px-5 pb-20 pt-28 md:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1360px] space-y-12">
        <header className="mx-auto max-w-[800px] space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-md border border-accent-line bg-cream-warm px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-accent">
            <Star className="h-4 w-4 fill-current" /> Namunaviy fikrlar
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
            Kurs <span className="accent-serif">namuna ishlari</span>
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted md:text-base">
            Vibe Coding Express va AI Asoslari yo‘nalishlari bo‘yicha namunaviy
            fikrlar va o‘quv senariylari.
          </p>
        </header>

        <aside
          className="mx-auto flex max-w-4xl gap-3 rounded-xl border border-accent-line bg-accent-soft p-4 text-sm leading-relaxed text-ink sm:p-5"
          aria-label="Fikrlar holati haqida"
        >
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" aria-hidden="true" />
          <p>
            Bu sahifadagi fikrlar — platformaning{" "}
            <strong className="font-bold">namuna ishlari</strong>. Hali to‘lovli
            o‘quvchi natijalari yig‘ilmoqda; yangi bitiruvchilar natijalari faqat
            ularning rozig‘i bilan qo‘shiladi.
          </p>
        </aside>

        <section
          className="space-y-4 rounded-2xl border border-border-strong bg-cream-warm p-4 shadow-sm md:p-6"
          aria-label="Fikrlarni filtrlash"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Reyting bo‘yicha filtr">
              <span className="flex items-center gap-1 font-mono text-xs font-bold uppercase text-ink-subtle">
                <Filter className="h-3.5 w-3.5" aria-hidden="true" /> Baho:
              </span>
              {ratingOptions.map((option) => {
                const isActive = selectedRating === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSelectedRating(option.value)}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-accent text-cream"
                        : "border border-border bg-cream text-ink hover:bg-cream-deep"
                    }`}
                  >
                    {option.value !== "all" ? <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> : null}
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="testimonial-course"
                className="font-mono text-xs font-bold uppercase text-ink-subtle"
              >
                Kurs:
              </label>
              <select
                id="testimonial-course"
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                className="h-9 rounded-lg border border-border-strong bg-cream px-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">Barcha kurslar</option>
                {courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}
              </select>
            </div>
          </div>
          <p className="font-mono text-xs text-ink-muted">
            {STATIC_TESTIMONIALS.length} ta namuna fikr mavjud
          </p>
        </section>

        <div className="border-b border-border pb-3 font-mono text-xs text-ink-muted">
          Tanlangan filtr bo‘yicha: <strong className="text-accent">{filteredReviews.length} ta</strong>
        </div>

        {filteredReviews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredReviews.map((item) => {
              const initials = item.fullName.split(" ").map((name) => name[0]).join("").slice(0, 2);
              return (
                <article key={item.id} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-border-strong bg-cream-warm transition-all duration-200 hover:border-accent-line hover:shadow-lg">
                  <div className="flex flex-1 flex-col justify-between space-y-4 p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1" aria-label={`${item.rating} yulduz`}>
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star key={index} aria-hidden="true" className={`h-4 w-4 ${index < item.rating ? "fill-current text-accent" : "text-border"}`} />
                          ))}
                        </div>
                        {item.isExample ? (
                          <span className="rounded-full border border-accent-line bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] font-bold text-accent">Namuna</span>
                        ) : null}
                      </div>
                      <p className="text-xs italic leading-relaxed text-ink-muted md:text-sm">“{item.body}”</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                      <div>
                        <p className="text-xs font-bold text-ink md:text-sm">Namuna profil: {item.fullName}</p>
                        <p className="text-[11px] text-ink-muted">{item.role}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-mono text-[11px] font-semibold text-accent">{item.courseTitle}</p>
                        {item.cohortName ? <p className="font-mono text-[10px] text-ink-subtle">Namunaviy holat</p> : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="rounded-2xl border border-border-strong bg-cream-warm px-6 py-12 text-center" aria-live="polite">
            <Star className="mx-auto mb-4 h-8 w-8 text-border" aria-hidden="true" />
            <h2 className="text-lg font-bold text-ink">Bu filtrda fikr topilmadi</h2>
            <p className="mt-2 text-sm text-ink-muted">Boshqa reyting yoki kursni tanlab ko‘ring.</p>
            <button type="button" onClick={resetFilters} className="btn-secondary mt-5 h-11 rounded-lg px-6 text-xs font-semibold">Barchasini ko‘rish</button>
          </section>
        )}

        <section className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-accent-line bg-cream-warm p-8 text-center shadow-sm md:p-12">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent"><Sparkles className="h-6 w-6" aria-hidden="true" /></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-ink md:text-3xl">Yo‘nalishni aniqlashdan boshlang</h2>
            <p className="mx-auto max-w-lg text-xs text-ink-muted md:text-sm">Diagnostika kvizi orqali o‘rganish yo‘nalishingizni aniqlang.</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/diagnostika" className="btn-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-8 text-xs font-semibold sm:w-auto">Diagnostika Kvizi <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link href="/kurs/vibe-coding-express" className="btn-secondary flex h-12 w-full items-center justify-center rounded-lg px-8 text-xs font-semibold sm:w-auto">Kurs dasturi</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
