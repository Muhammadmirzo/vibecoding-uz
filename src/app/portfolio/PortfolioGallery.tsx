"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { Button, Container } from "@/components/ui";
import { EmptyState } from "@/components/pages/PageBits";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import "@/components/pages/w6c.css";
import type { PortfolioItem } from "@/features/portfolio/portfolioData";

const FILTERS = [
  { value: "all", label: "Barchasi" },
  { value: "owner", label: "Mening loyihalarim" },
  { value: "student", label: "Talabalar" },
  { value: "client", label: "Mijozlar" },
] as const;
type FilterValue = (typeof FILTERS)[number]["value"];

type Props = { items: PortfolioItem[] };

function GalleryEmptyState({ featured }: { featured: boolean }) {
  return (
    <EmptyState
      title={featured ? "Asosiy loyihalar tez orada" : "Bu filtrda loyiha topilmadi"}
      body="Boshqa filtrni tanlab ko'ring yoki diagnostika orqali o'z g'oyangizni shakllantiring."
      className="border-dashed"
    />
  );
}

export function PortfolioGallery({ items }: Props) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [visibleCount, setVisibleCount] = useState(6);
  const featured = useMemo(() => items.filter((item) => item.isFeatured).slice(0, 3), [items]);
  const filtered = useMemo(() => filter === "all" ? items : items.filter((item) => item.ownership === filter), [filter, items]);
  const visible = filtered.slice(0, visibleCount);

  function selectFilter(value: FilterValue) {
    if (value === filter) return;
    const apply = () => {
      setFilter(value);
      setVisibleCount(6);
    };
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      !reduce &&
      root.dataset.motion === "full" &&
      typeof (document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition === "function"
    ) {
      (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(apply);
    } else {
      apply();
    }
  }

  return <div className="bg-bg text-ink">
    <Container className="py-16">
      <section aria-labelledby="featured-projects">
        <h2 id="featured-projects" className="font-display text-3xl font-semibold text-ink">Asosiy loyihalar</h2>
        {featured.length > 0 ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.map((item) => <PortfolioCard key={item.id} item={item} />)}</div> : <div className="mt-8"><GalleryEmptyState featured /></div>}
      </section>
      <section className="mt-20" aria-labelledby="all-projects">
        <h2 id="all-projects" className="font-display text-3xl font-semibold text-ink">Barcha loyihalar</h2>
        <div role="group" aria-label="Loyiha egaligi" className="mb-8 mt-6 flex gap-2 overflow-x-auto pb-2">
          <span className="inline-flex items-center gap-2 px-2 text-sm text-ink-muted"><Filter className="size-4" aria-hidden="true" /> Filtr</span>
          {FILTERS.map((item) => <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => selectFilter(item.value)} className={`min-h-11 whitespace-nowrap rounded-lg px-4 text-sm font-semibold ${filter === item.value ? "bg-brand text-white" : "border border-border bg-bg-elevated text-ink-muted hover:border-brand"}`}>{item.label}</button>)}
        </div>
        <div className="min-h-96">
          {visible.length > 0 ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <PortfolioCard key={item.id} item={item} />)}</div> : <GalleryEmptyState featured={false} />}
        </div>
        {visibleCount < filtered.length && <div className="mt-10 text-center"><Button type="button" variant="outline" onClick={() => setVisibleCount((count) => count + 6)}>Ko&apos;proq ko&apos;rsatish</Button></div>}
        <div className="mt-12 flex justify-center"><Button href="/xizmatlar" size="lg">Xuddi shunday loyiha qurish</Button></div>
      </section>
    </Container>
    <NextStepCTA />
  </div>;
}
