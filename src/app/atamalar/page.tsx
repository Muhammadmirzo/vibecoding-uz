"use client";

import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/Form";
import { Container } from "@/components/ui";
import { Card } from "@/components/ui/Surfaces";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { PageHero } from "@/components/pages/PageHero";
import { EmptyState } from "@/components/pages/PageBits";

const terms = [
  { en: "Vibe Coding", uz: "Vayb kodlash", category: "Metodologiya", text: "AI agentlariga aniq ko‘rsatma berib, dasturchi kabi sintaksis yozmasdan mahsulot yaratish usuli." },
  { en: "Prompt Engineering", uz: "Prompt injiniringi", category: "AI vositalar", text: "Sun’iy intellektdan aniq va sifatli natija olish uchun topshiriq matnini shakllantirish." },
  { en: "Model Context Protocol", uz: "Model kontekst protokoli", category: "Arxitektura", text: "AI agentlarini tashqi ma’lumotlar va API integratsiyalariga ulash standarti." },
  { en: "Context Window", uz: "Kontekst oynasi", category: "LLM metrikalari", text: "AI modeli bir vaqtning o‘zida qayta ishlashi mumkin bo‘lgan kontekst hajmi." },
  { en: "Hallucination", uz: "Gallyutsinatsiya", category: "LLM xossalari", text: "Modelning mavjud bo‘lmagan ma’lumotni ishonch bilan taklif qilishi." },
  { en: "RAG", uz: "Qidiruv bilan boyitilgan generatsiya", category: "Arxitektura", text: "Tashqi ma’lumotlar bazasidan qidirib, model javobini aniqlashtirish texnologiyasi." },
];

export default function Page() {
  const [query, setQuery] = useState("");
  const found = useMemo(() => {
    const value = query.trim().toLowerCase();
    return terms.filter((item) => !value || Object.values(item).some((field) => field.toLowerCase().includes(value)));
  }, [query]);

  return (
    <div className="bg-bg text-ink">
      <PageHero
        variant="compact"
        eyebrow={<><BookOpen className="mr-2 inline size-4" aria-hidden="true" /> Lug‘at</>}
        title="Texnik so‘zlarni sodda tilda tushuning"
        lede="AI va dasturlashdagi asosiy tushunchalarning o‘zbekcha izohlari."
      />
      <Container className="pb-20 sm:pb-28">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-3.5 size-5 text-ink-subtle" aria-hidden="true" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Atamani izlang..."
            className="h-12 pl-12"
            aria-label="Atamalarni qidirish"
            role="searchbox"
          />
        </div>
        <p className="mt-4 font-mono text-xs text-ink-muted" role="status" aria-live="polite">
          {query ? `${found.length} ta atama topildi` : `Jami ${found.length} ta atama`}
        </p>
        {found.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {found.map((item) => (
              <Card key={item.en} className="card-glow">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-ink">{item.en}</h2>
                  <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-xs text-accent">{item.category}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">{item.uz}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.text}</p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Bunday atama topilmadi"
            body="Qidiruv so‘zini o‘zgartirib ko‘ring — masalan, “prompt” yoki “kontekst”."
            className="mt-6"
          />
        )}
      </Container>
      <NextStepCTA title="Tushunchalarni amaliyotda sinab ko‘ring" />
    </div>
  );
}
