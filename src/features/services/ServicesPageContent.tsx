import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { servicesCatalog } from "./servicesCatalog";
import { ServicesProcessAndFaq } from "./ServicesProcessAndFaq";
import { siteConfig } from "@/lib/siteConfig";

function formatSum(value: number) {
  return `${new Intl.NumberFormat("uz-UZ").format(value)} so'm`;
}

export function ServicesPageContent() {
  const page = siteConfig.servicesPage;

  return (
    <div className="bg-cream text-ink">
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.2fr_.8fr] md:items-end md:py-28">
          <div>
            <p className="mb-5 font-mono text-sm text-accent">{page.eyebrow}</p>
            <h1 className="max-w-4xl font-serif text-5xl font-bold leading-[.98] tracking-tight md:text-7xl">
              {page.title}
            </h1>
          </div>
          <div className="md:border-l md:border-accent-line md:pl-8">
            <p className="text-lg leading-relaxed text-ink-muted">{page.promise}</p>
            <a href={page.telegramUrl} className="btn-primary mt-7 inline-flex h-12 items-center gap-2 px-6 text-sm font-semibold">
              {page.ctaLabel}<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20" aria-labelledby="services-title">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-sm text-accent">Uch xizmat</p>
            <h2 id="services-title" className="mt-3 font-serif text-4xl font-bold md:text-5xl">Nimadan boshlash mumkin?</h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-ink-muted">Narxlar boshlang‘ich diapazon. Aniq taklif mijoz vazifasi va hajmi ko‘rsatilgach beriladi.</p>
        </div>
        <div className="grid border-l border-t border-border md:grid-cols-3">
          {servicesCatalog.offers.map((offer, index) => (
            <article key={offer.id} className="flex min-h-full flex-col border-b border-r border-border bg-cream-warm p-7">
              <div className="mb-8 flex items-center justify-between">
                <span className="font-mono text-sm text-ink-subtle">0{index + 1}</span>
                <span className="text-xs text-ink-muted">{offer.timeline}</span>
              </div>
              <h3 className="font-serif text-3xl font-bold">{offer.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">{offer.summary}</p>
              <p className="mt-7 border-y border-accent-line py-4 font-mono text-lg font-semibold text-accent">
                {formatSum(offer.priceRange.min)}–{formatSum(offer.priceRange.max)}
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {offer.deliverables.map((item) => (
                  <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{item}</li>
                ))}
              </ul>
              <details className="mt-auto pt-7 text-xs leading-relaxed text-ink-muted">
                <summary className="cursor-pointer font-semibold text-ink">Niga mos emas?</summary>
                <p className="mt-2">{offer.notSuitableFor.join("; ")}</p>
                <p className="mt-2">Taklifga kirmaydi: {offer.excluded.join("; ")}</p>
              </details>
            </article>
          ))}
        </div>
      </section>
      <ServicesProcessAndFaq />
    </div>
  );
}
