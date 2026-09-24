import Link from "next/link";
import { ArrowUpRight, Send } from "lucide-react";
import { Container } from "@/components/ui";
import { Brand } from "./Brand";

const columns = [
  ["Kurslar", [["Vibe Coding Express", "/kurs/vibe-coding-express"], ["AI Asoslari", "/kurs/ai-asoslari"], ["Diagnostika", "/diagnostika"], ["Bepul dars", "/bepul-dars"]]],
  ["Resurslar", [["Blog", "/blog"], ["Portfolio", "/portfolio"], ["Bepul resurslar", "/resurslar"], ["Meetlar", "/meetlar"]]],
  ["Kompaniya", [["Xizmatlar", "/xizmatlar"], ["Biz haqimizda", "/xizmatlar"], ["Aloqa", "mailto:hello@academy.mirzo.uz"]]],
  ["Huquqiy", [["Pul qaytarish", "/pul-qaytarish"], ["Maxfiylik", "/maxfiylik"], ["Oferta", "/offerta"]]],
] as const;

export function Footer() {
  return <footer className="border-t border-border bg-bg-sunken"><Container className="py-14"><div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)]"><div><Brand /><p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">AI bilan g&apos;oyadan ishlaydigan mahsulotgacha — amaliy yo&apos;l.</p><a href="https://t.me/m/ODAfK_QIMjky" target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand hover:underline"><Send className="size-4" aria-hidden="true" />Telegramda yozing</a></div>{columns.map(([title, items]) => <div key={title}><h2 className="font-semibold text-ink">{title}</h2><ul className="mt-4 space-y-3">{items.map(([label, href]) => <li key={label}><Link href={href} className="inline-flex min-h-11 min-w-11 items-center justify-center text-sm text-ink-muted hover:text-brand">{label}</Link></li>)}</ul></div>)}</div><div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} VibeCoding.uz. Barcha huquqlar himoyalangan.</p><a href="https://academy.mirzo.uz" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1 hover:text-brand">academy.mirzo.uz <ArrowUpRight className="size-3" aria-hidden="true" /></a></div></Container></footer>;
}
