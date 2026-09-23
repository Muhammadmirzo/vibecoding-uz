"use client";

import { ArrowUpRight, ExternalLink, User, Users } from "lucide-react";

export function ProofStats() {
  return (
    <section aria-labelledby="proof-heading" className="w-full border-b border-[var(--color-border)] bg-[var(--color-cream-deep)] py-8 md:py-10">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        <div className="mb-6 md:mb-8">
          <p className="font-mono text-xs font-semibold tracking-wider text-[var(--color-accent)]">
            Jonli isbot — ko&apos;chirib emas, qurib ko&apos;rsatamiz
          </p>
          <h2 id="proof-heading" className="mt-2 font-serif text-2xl font-bold text-[var(--color-ink)] md:text-3xl">
            Asoschi qurdi
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <a
            href="https://clash-nexus.vercel.app/"
            target="_blank"
            rel="noopener"
            className="group relative col-span-2 flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-accent-line)] hover:shadow-[var(--shadow-md)] lg:col-span-1"
          >
            <span aria-hidden="true" className="absolute left-0 right-0 top-0 h-[3px] bg-[var(--color-accent)] opacity-70 transition-opacity group-hover:opacity-100" />
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[var(--color-accent)]">
              JONLI LOYIHA
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </div>
            <div className="mt-2 font-serif text-2xl font-bold italic text-[var(--color-ink)] md:text-3xl">
              Clash Nexus
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              Clash of Clans muxlislar platformasi: klan/o&apos;yPSCinchi qidiruv (tag
              orqali), O&apos;zbekiston top reytingi, yangiliklar, turnirlar,
              bozor; uz/ru/en.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-medium text-[var(--color-accent)]">
              hoziroq oching
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </a>

          <a
            href="https://github.com/Muhammadmirzo"
            target="_blank"
            rel="noopener"
            className="group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-accent-line)] hover:shadow-[var(--shadow-md)] md:p-6"
          >
            <span aria-hidden="true" className="absolute left-0 right-0 top-0 h-[3px] bg-[var(--color-accent)] opacity-70 transition-opacity group-hover:opacity-100" />
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[var(--color-ink-subtle)]">
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              MUALLIF
            </div>
            <div className="mt-2 font-serif text-2xl font-bold italic text-[var(--color-ink)] md:text-3xl">
              Muhammad Mirzo
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              github.com/Muhammadmirzo
            </p>
            <span className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-medium text-[var(--color-accent)]">
              profilni ko&apos;rish
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </a>

          <div className="relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-cream)] p-5 shadow-[var(--shadow-sm)] md:p-6">
            <span aria-hidden="true" className="absolute left-0 right-0 top-0 h-[3px] bg-[var(--color-accent)] opacity-70" />
            <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[var(--color-ink-subtle)]">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              QABUL
            </div>
            <div className="mt-2 font-serif text-2xl font-bold italic text-[var(--color-ink)] md:text-3xl">
              1-guruhga yozuv ochiq
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
              O&apos;rinlar cheklangan, ro&apos;yxat ochiq ko&apos;rsatiladi.
            </p>
          </div>
        </div>

        <p className="mt-4 font-mono text-[11px] leading-relaxed text-[var(--color-ink-subtle)]">
          Clash Nexus — Supercell bilan bog&apos;liq bo&apos;lmagan mustaqil loyiha.
        </p>
      </div>
    </section>
  );
}
