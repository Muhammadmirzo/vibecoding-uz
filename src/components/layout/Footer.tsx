import Link from "next/link";
import { ArrowUpRight, Send } from "lucide-react";
import { Container } from "@/components/ui";
import { BRAND } from "@/config/brand";
import { Brand } from "./Brand";

const columns = [
  ["Kurslar", [["Vibe Coding Express", "/kurs/vibe-coding-express"], ["AI Asoslari", "/kurs/ai-asoslari"], ["Diagnostika", "/diagnostika"], ["Bepul dars", "/bepul-dars"]]],
  ["Resurslar", [["Blog", "/blog"], ["Portfolio", "/portfolio"], ["Bepul resurslar", "/resurslar"], ["Meetlar", "/meetlar"]]],
  ["Kompaniya", [["Xizmatlar", "/xizmatlar"], ["Biz haqimizda", "/xizmatlar"], ["Aloqa", "mailto:hello@academy.mirzo.uz"]]],
  ["Huquqiy", [["Pul qaytarish", "/pul-qaytarish"], ["Maxfiylik", "/maxfiylik"], ["Oferta", "/offerta"]]],
] as const;

export function Footer() {
  return <footer className="relative border-t-2 border-[color-mix(in_srgb,var(--gold)_40%,transparent)] bg-bg-sunken"><Container className="py-14"><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]"><div><Brand /><p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">{BRAND.descriptor} — g&apos;oyadan ishlaydigan mahsulotgacha, amaliy yo&apos;l.</p><p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-subtle">Naqsh — ustalar qoldiradigan iz. O&apos;z mahsulotingizni yarating, iz qoldiring.</p><a href="https://t.me/m/ODAfK_QIMjky" target="_blank" rel="noreferrer" className="link-underline mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand"><Send className="size-4" aria-hidden="true" />Telegramda yozing</a></div>{columns.map(([title, items]) => <div key={title}><h2 className="font-semibold text-ink">{title}</h2><ul className="mt-4 space-y-3">{items.map(([label, href]) => <li key={label}><Link href={href} className="link-underline inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-ink-muted hover:text-ink">{label}</Link></li>)}</ul></div>)}</div><div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} {BRAND.name}. Barcha huquqlar himoyalangan.</p><a href="https://academy.mirzo.uz" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 hover:text-brand">academy.mirzo.uz <ArrowUpRight className="size-3" aria-hidden="true" /></a></div></Container></footer>;
}
