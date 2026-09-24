"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
import { PORTFOLIO_DATA } from "@/features/portfolio/portfolioData";
import { Button, Container, Eyebrow, Heading } from "@/components/ui";
import { NextStepCTA } from "@/components/ui/NextStepCTA";

export function PortfolioGallery() {
  const [category, setCategory] = useState("Barchasi");
  const categories = useMemo(() => ["Barchasi", ...Array.from(new Set(PORTFOLIO_DATA.map(item => item.category)))], []);
  const items = category === "Barchasi" ? PORTFOLIO_DATA : PORTFOLIO_DATA.filter(item => item.category === category);
  return <div className="min-h-screen bg-bg text-ink"><section className="border-b border-border bg-bg-sunken"><Container className="py-20 sm:py-28"><Eyebrow>Portfolio</Eyebrow><Heading className="mt-3 max-w-4xl">AI yordamida qurilgan jonli loyihalar.</Heading><p className="mt-4 max-w-2xl text-lg text-ink-muted">Real misollar orqali g'oyadan ishlaydigan mahsulotgacha bo'lgan jarayonni ko'ring.</p><p className="mt-5 text-sm text-ink-subtle">Ko'rsatilgan raqamlar loyihaning o'z saytidagi ochiq ma'lumotlari; mustaqil audit qilinmagan.</p></Container></section><Container className="py-16"><div role="group" aria-label="Kategoriyalar" className="mb-10 flex gap-2 overflow-x-auto pb-2"><span className="inline-flex items-center gap-2 px-2 text-sm text-ink-muted"><Filter className="size-4" aria-hidden="true" /> Filtr</span>{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)} className={`min-h-11 whitespace-nowrap rounded-lg px-4 text-sm font-semibold ${category === item ? "bg-brand text-white" : "border border-border bg-bg-elevated text-ink-muted hover:border-brand"}`}>{item}</button>)}</div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <PortfolioCard key={item.id} item={item} />)}</div>{items.length === 0 && <p className="py-16 text-center text-ink-muted">Bu kategoriyada loyihalar mavjud emas.</p>}<div className="mt-12 flex justify-center"><Button href="/xizmatlar" size="lg">Xuddi shunday loyiha qurish</Button></div></Container><NextStepCTA /></div>;
}
