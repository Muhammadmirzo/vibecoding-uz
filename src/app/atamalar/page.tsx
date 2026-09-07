"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Search, BookOpen } from "lucide-react";
import type { SpinWheelTerm } from "@/components/ui/SpinWheel";

const SpinWheel = dynamic(() => import("@/components/ui/SpinWheel"), {
  ssr: false,
  loading: () => (
    <div className="max-w-[720px] mx-auto mb-10 p-6 rounded-[var(--radius-xl)] bg-[var(--color-cream-warm)] border border-[var(--color-accent-line)] text-center text-xs font-mono text-[var(--color-ink-muted)]">
      Lug'at charxi yuklanmoqda...
    </div>
  ),
});

const TERMS: SpinWheelTerm[] = [
  {
    termEn: "Vibe Coding",
    termUz: "Vayb Kodlash",
    category: "Metodologiya",
    definition:
      "Dasturchi kabi sintaksis yozmasdan, AI agentlariga (Claude Code, Cursor) aniq ko'rsatma (prompt) berib mahsulot yaratish usuli.",
  },
  {
    termEn: "Prompt Engineering",
    termUz: "Prompt Injiniringi",
    category: "AI Vositalar",
    definition:
      "Sun'iy intellektdan aniq va sifatli natija olish uchun to'g'ri topshiriq matnini shakllantirish san'ati.",
  },
  {
    termEn: "Model Context Protocol (MCP)",
    termUz: "Model Kontekst Protokoli",
    category: "Arxitektura",
    definition:
      "AI agentlarini tashqi ma'lumotlar bazasi va API integratsiyalariga xavfsiz ulash standarti.",
  },
  {
    termEn: "Context Window",
    termUz: "Kontekst Oynasi",
    category: "LLM Metrikalari",
    definition:
      "AI modeli bir vaqtning o'zida xotirada saqlay oladigan maksimal tokenlar hajmi.",
  },
  {
    termEn: "Hallucination",
    termUz: "Gallyutsinatsiya",
    category: "LLM Xossalari",
    definition:
      "AI modelining yo'q ma'lumotni xuddi haqiqatdek ishonch bilan o'ylab topishi va taqdim etishi.",
  },
  {
    termEn: "RAG (Retrieval-Augmented Generation)",
    termUz: "Qidiruv bilan Boyitilgan Generatsiya",
    category: "Arxitektura",
    definition:
      "AI modeliga tashqi ma'lumotlar bazasidan kontent qidirib topib, aniqroq javob berishini ta'minlash texnologiyasi.",
  },
];

const GlossaryTermCard = React.memo(function GlossaryTermCard({
  term,
}: {
  term: SpinWheelTerm;
}) {
  return (
    <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-lg)] p-6 space-y-2 hover:border-[var(--color-accent-line)] transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[var(--color-ink)]">
          {term.termEn}{" "}
          <span className="text-xs font-normal text-[var(--color-ink-muted)]">
            ({term.termUz})
          </span>
        </h3>
        <span className="text-[11px] font-mono font-bold text-[var(--color-accent)] bg-[var(--color-cream)] px-2.5 py-0.5 rounded border border-[var(--color-border)]">
          {term.category}
        </span>
      </div>
      <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
        {term.definition}
      </p>
    </div>
  );
});

export default function AtamalarPage() {
  const [query, setQuery] = React.useState("");

  const filteredTerms = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TERMS;
    return TERMS.filter(
      (t) =>
        t.termEn.toLowerCase().includes(q) ||
        t.termUz.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [query]);

  const handleQueryChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    []
  );

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-[680px] mx-auto mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-line)] bg-[var(--color-cream-warm)] text-[12px] tracking-wider text-[var(--color-accent)] uppercase font-mono font-bold">
            <BookOpen className="w-4 h-4" /> AI va Vibe Coding Atamalar Lug'ati
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)]">
            Texnik so'zlarni <span className="accent-serif">sodda tilda</span> tushuning
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Sun'iy intellekt va dasturlash sohasidagi eng muhim tushunchalarning o'zbekcha izohli lug'ati.
          </p>
        </div>

        {/* Dynamic SpinWheel Component */}
        <SpinWheel terms={TERMS} />

        {/* Search Bar */}
        <div className="max-w-[600px] mx-auto mb-10 relative">
          <Search className="w-5 h-5 text-[var(--color-ink-subtle)] absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Atamani izlang (masalan: Vibe Coding, Prompt, RAG)..."
            value={query}
            onChange={handleQueryChange}
            className="w-full h-12 pl-12 pr-4 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-cream-warm)] text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
        </div>

        {/* Glossary Terms List */}
        <div className="grid md:grid-cols-2 gap-4 max-w-[1000px] mx-auto">
          {filteredTerms.map((term) => (
            <GlossaryTermCard key={term.termEn} term={term} />
          ))}
        </div>
      </div>
    </div>
  );
}
