import Link from "next/link";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export function ServicesProcessAndFaq() {
  const page = siteConfig.servicesPage;

  return (
    <>
      <section className="border-y border-border bg-ink text-cream" aria-labelledby="process-title">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="font-mono text-sm text-accent">Xavfsiz boshlash</p>
          <h2 id="process-title" className="mt-3 max-w-2xl font-serif text-4xl font-bold md:text-5xl">Qaror oldidan ko‘ramiz.</h2>
          <ol className="mt-12 grid border-l border-t border-cream/20 md:grid-cols-3">
            {page.process.map((step, index) => (
              <li key={step.title} className="min-h-56 border-b border-r border-cream/20 p-6">
                <span className="font-mono text-sm text-accent">0{index + 1}</span>
                <h3 className="mt-10 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[.75fr_1.25fr]" aria-labelledby="faq-title">
        <div>
          <p className="font-mono text-sm text-accent">Ochiq savollar</p>
          <h2 id="faq-title" className="mt-3 font-serif text-4xl font-bold md:text-5xl">Avval bilish kerak.</h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-muted">Javob topilmasa, Telegram orqali bepul savol bering.</p>
        </div>
        <div className="border-t border-border">
          {page.faq.map((item, index) => (
            <details key={item.question} className="group border-b border-border py-1" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 font-semibold">
                {item.question}
                <span className="text-accent"><Plus className="h-4 w-4 group-open:hidden" aria-hidden="true" /><Minus className="hidden h-4 w-4 group-open:block" aria-hidden="true" /></span>
              </summary>
              <p className="max-w-2xl pb-5 pr-8 text-sm leading-relaxed text-ink-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-cream-warm">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <div><p className="font-serif text-2xl font-bold">Ko‘rib chiqishga tayyormisiz?</p><p className="mt-2 text-sm text-ink-muted">{page.trustText}</p></div>
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">{page.portfolioLabel}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </footer>
    </>
  );
}
