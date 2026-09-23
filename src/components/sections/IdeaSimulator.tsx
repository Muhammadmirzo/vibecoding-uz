"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock3,
  Coins,
  Info,
} from "lucide-react";
import {
  estimateCustomIdea,
  estimatePreset,
  formatUzsRange,
} from "@/features/ideaSimulator/estimateIdea";
import {
  estimationRules,
  ideaPresets,
} from "@/features/ideaSimulator/ideaPresets";

export function IdeaSimulator() {
  const [selectedId, setSelectedId] = React.useState(ideaPresets[0].id);
  const [customIdea, setCustomIdea] = React.useState("");
  const [submittedIdea, setSubmittedIdea] = React.useState<string | null>(null);
  const estimate =
    submittedIdea === null
      ? estimatePreset(selectedId)
      : estimateCustomIdea(submittedIdea);

  const selectPreset = (id: string) => {
    setSelectedId(id);
    setSubmittedIdea(null);
  };

  const submitIdea = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (customIdea.trim()) setSubmittedIdea(customIdea);
  };

  return (
    <section className="w-full border-b border-border bg-cream-warm py-14 md:py-20">
      <div className="mx-auto w-full max-w-5xl px-5 md:px-8">
        <div className="mx-auto mb-9 max-w-3xl text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent-line bg-accent-soft px-3 py-1 font-mono text-xs font-semibold text-accent">
            <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
            Ochiq hisob-kitob
          </span>
          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-ink md:text-4xl">
            G'oyangiz uchun taxminiy muddat va byudjet
          </h2>
          <p className="text-sm leading-relaxed text-ink-muted md:text-base">
            Kategoriya bo'yicha ochiq qoidalar asosida MVP g'oyasini tahmin qiling.
            Natijada qanday hisoblanishi ham ko'rsatiladi.
          </p>
        </div>

        <form onSubmit={submitIdea} className="mb-5 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="custom-idea" className="sr-only">
              Biznes g'oyangiz
            </label>
            <input
              id="custom-idea"
              name="idea"
              type="text"
              value={customIdea}
              onChange={(event) => setCustomIdea(event.target.value)}
              aria-describedby="idea-hint"
              placeholder="Masalan: salonga mijozlar uchun Telegram bot"
              className="w-full rounded-xl border border-border-strong bg-cream px-4 py-3.5 text-sm text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p id="idea-hint" className="mt-1.5 text-xs text-ink-muted">
              Bot, CRM, salon, kontent yoki do'kon so'zlaridan birini yozing.
            </p>
          </div>
          <button
            type="submit"
            disabled={!customIdea.trim()}
            className="shrink-0 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Taxmin qilish
          </button>
        </form>

        <div className="mb-7 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-subtle">Tayyor shablonlar:</span>
          {ideaPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={submittedIdea === null && selectedId === preset.id}
              onClick={() => selectPreset(preset.id)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                submittedIdea === null && selectedId === preset.id
                  ? "border-ink bg-ink text-white"
                  : "border-border bg-cream text-ink-muted hover:border-accent-line"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border-strong bg-cream p-5 shadow-sm md:p-8">
          <div className="mb-6 grid gap-4 border-b border-border pb-6 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <span className="text-xs text-ink-subtle">Taxminiy muddat</span>
                <strong className="block text-xl text-ink">
                  {estimate.dayRange.min}–{estimate.dayRange.max} kun
                </strong>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Coins className="mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
              <div>
                <span className="text-xs text-ink-subtle">Taxminiy ish byudjeti</span>
                <strong className="block text-xl text-ink">
                  {formatUzsRange(estimate.costRange)}
                </strong>
              </div>
            </div>
            <div>
              <span className="text-xs text-ink-subtle">Murakkablik</span>
              <strong className="block text-xl capitalize text-ink">{estimate.complexity}</strong>
            </div>
          </div>

          <p className="mb-5 flex items-start gap-2 rounded-xl border border-accent-line bg-accent-soft p-3 text-sm font-semibold text-ink">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            Bu taxminy baho, aniq narx emas.
          </p>

          <div className="grid gap-7 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <h3 className="mb-2 text-sm font-bold text-ink">Ish bosqichlari</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {estimate.roadmap.map((step) => (
                  <p key={step} className="flex gap-2 rounded-xl border border-border bg-cream-warm p-3 text-xs leading-relaxed text-ink">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    <span>{step}</span>
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold text-ink">Tanlangan qoida</h3>
                <p className="mt-1 leading-relaxed text-ink-muted">{estimate.rule}</p>
              </div>
              <div>
                <h3 className="font-bold text-ink">Taxminlar</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-muted">
                  {estimate.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-ink">Bahoga kirmagan xarajatlar</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-muted">
                  {estimate.excludedCosts.map((cost) => <li key={cost}>{cost}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <details className="mt-6 rounded-xl border border-border bg-cream-warm p-3 text-sm">
            <summary className="cursor-pointer font-semibold text-ink">Qanday hisoblanadi?</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-muted">
              {estimationRules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </details>

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-ink-muted">
              {estimate.matched
                ? "Aniqlikni oshirish uchun funksiyalar ro'yxatini diagnostikada ko'rib chiqing."
                : "G'oyani aniqlashtirish uchun funksiyalar va majburiy integratsiyalarni yozib qoldiring."}
            </p>
            <Link
              href="/diagnostika"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              {estimate.matched ? "G'oyani aniqlashtirish" : "Aniqlashtirish uchun yozish"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
