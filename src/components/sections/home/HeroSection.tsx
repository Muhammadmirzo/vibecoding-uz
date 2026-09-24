import { ArrowRight, CirclePlay, MapPin, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { Button, Container, GirihPattern, TerminalWindow } from "@/components/ui";
import { siteConfig } from "@/lib/siteConfig";

const session = [
  "› Toshkentdagi nonvoyxonalar uchun buyurtma ilovasi yarat",
  "✓ Created app/orders, app/menu and app/checkout",
  "✓ Database schema: products, orders, couriers",
  "✓ Telegram bot bilan buyurtma qabuli ulandi",
  "✓ Deployed to Vercel",
  "https://nonvoyxa-orders.vercel.app",
] as const;

function AppPreview() {
  return (
    <div className="absolute -bottom-7 -right-5 hidden w-64 rounded-lg border border-border-strong bg-bg-elevated p-3 shadow-lg lg:block xl:-right-9 xl:w-72" aria-hidden="true">
      <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-gold-soft text-brand"><ShoppingBag className="size-3.5" /></span>
          <span className="text-xs font-bold text-ink">Nonvoyxa</span>
        </div>
        <span className="rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-bold text-success">Ochiq</span>
      </div>
      <div className="space-y-2">
        <div className="flex gap-2 rounded-md bg-bg-sunken p-2">
          <div className="size-10 rounded bg-gold-soft" />
          <div className="flex-1 space-y-1.5 py-0.5"><span className="block h-1.5 w-3/4 rounded bg-border-strong" /><span className="block h-1.5 w-1/2 rounded bg-border" /></div>
          <span className="text-[10px] font-bold text-ink">28k</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-border px-2 py-2 text-[10px] text-ink-muted"><span className="flex items-center gap-1"><MapPin className="size-3 text-accent" />Yetkazib berish</span><span className="font-semibold text-ink">25–35 min</span></div>
        <div className="flex items-center gap-1 text-[9px] text-ink-subtle"><Star className="size-3 fill-gold text-gold" />4.9 · 320+ buyurtma</div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-bg py-16 sm:py-24 lg:py-28">
      <GirihPattern className="absolute inset-0 -z-10 h-full w-full text-accent opacity-[0.065]" aria-hidden="true" />
      <div className="absolute left-1/2 top-8 -z-10 h-72 w-[min(92vw,900px)] -translate-x-1/2 rounded-full bg-accent-soft/55 blur-3xl" aria-hidden="true" />
      <Container className="grid items-center gap-14 lg:grid-cols-[7fr_5fr] lg:gap-12 xl:gap-16">
        <div>
          <p className="mb-5 text-sm font-semibold text-brand">AI bilan mahsulot qurish</p>
          <h1 className="max-w-3xl font-display text-[clamp(1.875rem,1rem+3vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-ink">
            G&apos;oyangizni <span className="relative whitespace-nowrap text-brand"><span className="relative z-10">8 haftada</span><span className="absolute inset-x-0 bottom-0.5 z-0 h-2 -rotate-1 bg-gold/35" aria-hidden="true" /></span> ishlaydigan ilovaga aylantiring — AI bilan, kod yozishni bilmasangiz ham.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">Dasturchi yollash kutilganidek qimmat emas. Siz g&apos;oyangizni, Claude Code yordamida qadam-baqadam ishlaydigan ilovaga aylantirasiz.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/diagnostika" size="lg">Bepul diagnostika — 2 daqiqa <ArrowRight className="size-5" aria-hidden="true" /></Button>
            <Button href="/bepul-dars" size="lg" variant="outline"><CirclePlay className="size-5" aria-hidden="true" />Bepul darsga yozilish</Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
            <span>Keyingi guruh: <strong className="text-ink">{siteConfig.nextCohortDate}</strong></span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-success" aria-hidden="true" />{siteConfig.guaranteeText}</span>
          </div>
        </div>
        <div className="relative pb-8 lg:pb-10">
          <TerminalWindow lines={session} />
          <p className="mt-3 text-center font-mono text-xs text-ink-subtle">Bir promptdan tayyor ilovagacha</p>
          <AppPreview />
        </div>
      </Container>
    </section>
  );
}
