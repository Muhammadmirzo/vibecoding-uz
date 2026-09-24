import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import { Card, Container, Section } from "@/components/ui";
import { Reveal } from "@/features/motion/ui/Reveal";
import { getPublicPortfolios } from "@/features/portfolio/server/portfolio.service";

export async function Projects() {
  const { portfolios } = await getPublicPortfolios();
  const featured = portfolios.slice(0, 3);
  return <Section pattern={false} className="girih-transition bg-ink text-bg"><Container><div className="max-w-2xl"><p className="mb-4 text-sm font-semibold text-gold">Real loyihalar</p><h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">Sertifikat emas, ochiladigan mahsulotlar.</h2><p className="mt-4 text-lg text-white/70">Quyidagi loyihalar metod bo'yicha qurilgan. Har birini ochib, o'zingiz ko'rib chiqing.</p></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.map((item, index) => <Reveal key={item.id} index={index % 3}><Card className="card-glow h-full border-white/10 bg-white/[.06] text-white"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{item.category}</span><ArrowUpRight className="size-5 text-gold" aria-hidden="true" /></div><h3 className="mt-7 font-display text-2xl font-semibold">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-white/70">{item.description}</p><p className="mt-6 text-xs text-white/50">{item.badgeText}</p></Card></Reveal>)}</div><div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center"><Link href="/portfolio" className="link-underline inline-flex min-h-11 items-center gap-2 font-semibold text-gold hover:underline">Portfolio bo'limini ochish <ArrowUpRight className="size-4" aria-hidden="true" /></Link><p className="flex items-start gap-2 text-xs text-white/50"><Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />Loyihalar muallifi yoki ochiq manbasi bilan bog'langan; ko'rsatilgan raqamlar mustaqil audit qilinmagan.</p></div></Container></Section>;
}
