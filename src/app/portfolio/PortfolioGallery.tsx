"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { Button, Container, Eyebrow, Heading } from "@/components/ui";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";

const FILTERS = [
  { value: "all", label: "Barchasi" },
  { value: "owner", label: "Mening loyihalarim" },
  { value: "student", label: "Talabalar" },
  { value: "client", label: "Mijozlar" },
] as const;
type FilterValue = (typeof FILTERS)[number]["value"];

type Props = { items: PortfolioItem[] };

function EmptyState({ featured }: { featured: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-bg-elevated px-6 py-14 text-center">
      <h2 className="font-display text-xl font-semibold text-ink">{featured ? "Asosiy loyihalar tez orada" : "Bu filtrda loyiha topilmadi"}</h2>
      <p className="mx-auto mt-2 max-w-md text-ink-muted">Boshqa filtrni tanlab ko'ring yoki diagnostika orqali o'z g'oyangizni shakllantiring.</p>
    </div>
  );
}

export function PortfolioGallery({ items }: Props) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const featured = useMemo(() => items.filter((item) => item.isFeatured).slice(0, 3), [items]);
  const filtered = useMemo(() => filter === "all" ? items : items.filter((item) => item.ownership === filter), [filter, items]);
  const visible = filtered.slice(0, visibleCount);

  function selectFilter(value: FilterValue) {
    setFilter(value);
    setVisibleCount(6);
  }

  return <div className="min-h-screen bg-bg text-ink">
    <section className="border-b border-border bg-bg-sunken">
      <Container className="py-20 sm:py-28">
        <Eyebrow>Portfolio</Eyebrow>
        <Heading as="h1" className="mt-3 max-w-4xl text-balance">AI yordamida qurilgan jonli loyihalar.</Heading>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">Avval asosiy loyihalar, keyin qo'shimcha misollar.</p>
      </Container>
    </section>
    <Container className="py-16">
      <section aria-labelledby="featured-projects">
        <h2 id="featured-projects" className="font-display text-3xl font-semibold text-ink">Asosiy loyihalar</h2>
        {featured.length > 0 ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.map((item) => <PortfolioCard key={item.id} item={item} />)}</div> : <div className="mt-8"><EmptyState featured /></div>}
      </section>
      <section className="mt-20" aria-labelledby="all-projects">
        <h2 id="all-projects" className="font-display text-3xl font-semibold text-ink">Barcha loyihalar</h2>
        <div role="group" aria-label="Loyiha egaligi" className="mb-8 mt-6 flex gap-2 overflow-x-auto pb-2">
          <span className="inline-flex items-center gap-2 px-2 text-sm text-ink-muted"><Filter className="size-4" aria-hidden="true" /> Filtr</span>
          {FILTERS.map((item) => <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => selectFilter(item.value)} className={`min-h-11 whitespace-nowrap rounded-lg px-4 text-sm font-semibold ${filter === item.value ? "bg-brand text-white" : "border border-border bg-bg-elevated text-ink-muted hover:border-brand"}`}>{item.label}</button>)}
        </div>
        <div className="min-h-96">
          {visible.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <PortfolioCard key={item.id} item={item} />)}</div> : <EmptyState featured={false} />}
        </div>
        {visibleCount < filtered.length && <div className="mt-10 text-center"><Button type="button" variant="outline" onClick={() => setVisibleCount((count) => count + 6)}>Ko&apos;proq ko&apos;rsatish</Button></div>}
        <div className="mt-12 flex justify-center"><Button href="/xizmatlar" size="lg">Xuddi shunday loyiha qurish</Button></div>
      </section>
    </Container>
    <NextStepCTA />
  </div>;
}
