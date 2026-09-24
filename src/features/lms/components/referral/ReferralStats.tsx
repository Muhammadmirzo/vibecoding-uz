import { ArrowRight, CheckCircle2, HelpCircle, Share2, Users } from "lucide-react";
import type { ReferralStats } from "./referralTypes";

export function ReferralStats({ stats, onPayout }: { stats: ReferralStats; onPayout: () => void }) {
  const cards = [
    { label: "Havolaga o'tishlar", value: stats.clicks, detail: "Tizimdagi tashriflar", icon: Share2 },
    { label: "Ro'yxatdan o'tganlar", value: stats.registered, detail: "Taklif havolasi orqali", icon: Users },
    { label: "To'lov qilganlar", value: stats.paid, detail: "Muvaffaqiyatli xaridlar", icon: CheckCircle2 },
  ];
  return <>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-xl border border-border bg-bg-elevated p-5"><div className="flex items-center gap-2 text-sm text-ink-muted"><Icon className="h-4 w-4 text-accent" aria-hidden="true" />{card.label}</div><p className="mt-2 font-mono text-2xl font-bold text-ink">{card.value}</p><p className="mt-1 text-sm text-ink-subtle">{card.detail}</p></div>; })}
      <div className="rounded-xl border border-gold bg-bg-elevated p-5"><p className="text-sm font-semibold text-ink">Yechib olinadigan bonus</p><p className="mt-2 font-mono text-2xl font-bold text-ink">{stats.balance.toLocaleString("uz-UZ")} UZS</p><button type="button" onClick={onPayout} disabled={stats.balance <= 0} className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:text-ink-subtle">Bonusni yechish <ArrowRight className="h-4 w-4" aria-hidden="true" /></button></div>
    </div>
    <section className="rounded-2xl border border-border bg-bg-elevated p-6 md:p-8"><div className="flex items-start gap-3"><HelpCircle className="h-6 w-6 shrink-0 text-accent" aria-hidden="true" /><div><h2 className="font-display text-lg font-semibold text-ink">Taklif dasturi qanday ishlaydi?</h2><p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted">Havolani ulashing. Do&apos;stingiz ro&apos;yxatdan o&apos;tganidan keyin uning faollik holati va bonus hisobi tizimda qayd etiladi.</p></div></div><div className="mt-6 grid gap-4 md:grid-cols-3"><ProcessStep number="1" title="Havolani ulashing" text="Shaxsiy taklif havolangizni tanlangan kanalda ulashing." /><ProcessStep number="2" title="Do'stingiz ro'yxatdan o'tadi" text="U havoladan foydalanib ro'yxatdan o'tganda aktivlik yoziladi." /><ProcessStep number="3" title="Holat kuzatiladi" text="To'lov va bonus holati faqat tizim ma'lumotlari mavjud bo'lganda ko'rsatiladi." /></div></section>
  </>;
}

function ProcessStep({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="rounded-lg border border-border bg-bg-sunken p-4"><span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft font-mono text-sm font-bold text-brand">{number}</span><h3 className="mt-3 font-semibold text-ink">{title}</h3><p className="mt-2 text-sm leading-relaxed text-ink-muted">{text}</p></div>;
}
