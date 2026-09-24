import { ArrowRight, CirclePlay, ShieldCheck } from "lucide-react";
import { Button, Container, GirihPattern, TerminalWindow } from "@/components/ui";
import { siteConfig } from "@/lib/siteConfig";

const session = [
  "› G'oya: o'zbek tilidagi klan reytingi",
  "› Claude Code: sxemani rejalashtirdi",
  "✓ Next.js sahifa tayyor",
  "✓ Supabase ma'lumotlari ulandi",
  "✓ Ilova tayyor — endi foydalanishga tayyor!",
];

export function HeroSection() {
  return <section className="relative overflow-hidden bg-bg py-20 sm:py-28"><GirihPattern className="absolute inset-0 h-full w-full text-brand opacity-[.05]" aria-hidden="true" /><Container className="relative grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]"><div><p className="mb-5 text-sm font-semibold text-brand">AI bilan mahsulot qurish</p><h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">G'oyangizni 8 haftada ishlaydigan ilovaga aylantiring — AI bilan, kod yozishni bilmasangiz ham.</h1><p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">Dasturchi yollash kutilganidek qimmat emas. Siz g'oyangizni, Claude Code yordamida qadam-baqadam ishlaydigan ilovaga aylantirasiz.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button href="/diagnostika" size="lg">Bepul diagnostika — 2 daqiqa <ArrowRight className="size-5" aria-hidden="true" /></Button><Button href="/bepul-dars" size="lg" variant="outline"><CirclePlay className="size-5" aria-hidden="true" />Bepul darsga yozilish</Button></div><p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted"><span>Keyingi guruh: <strong className="text-ink">{siteConfig.nextCohortDate}</strong></span><span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-success" aria-hidden="true" />{siteConfig.guaranteeText}</span></p></div><div><TerminalWindow lines={session} /><p className="mt-3 text-center font-mono text-xs text-ink-subtle">Real promptdan tayyor ilovagacha</p></div></Container></section>;
}
