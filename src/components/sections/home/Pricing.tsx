import { Check, ShieldCheck } from "lucide-react";
import { Button, Card, Container, Eyebrow, Section } from "@/components/ui";
import { Reveal } from "@/features/motion/ui/Reveal";
import { Spotlight } from "@/features/motion/ui/Spotlight";
import { siteConfig } from "@/lib/siteConfig";

const courses = [
  { slug: "vibe-coding-express", title: "Vibe Coding Express", description: "Ilova, bot yoki MVP qurish uchun 8 haftalik amaliy yo'l.", bullets: ["Claude Code bilan ishlash", "8 haftalik jonli sessiyalar", "Yayilash va foydalanish"] },
  { slug: "ai-asoslari", title: "AI Asoslari", description: "AI vositalarini kundalik ish va mahsulot yaratishga qo'llash.", bullets: ["Prompt-injinering", "AI bilan tekshirilgan oqim", "Amaliy topshiriqlar"] },
] as const;

export function Pricing() {
  return <Section pattern={false} className="girih-transition bg-bg-sunken" id="kurs-tanlash"><Container><div className="max-w-2xl"><Eyebrow className="mb-4 text-brand">Kurs tanlash</Eyebrow><h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Sizning maqsadingizga mos yo'l.</h2></div><div className="mt-12 grid gap-6 lg:grid-cols-2">{courses.map((course, index) => { const price = siteConfig.courses[course.slug]; return <Reveal key={course.slug} index={index}><Spotlight className="h-full"><Card className={`card-glow h-full ${index === 0 ? "border-2 border-accent" : ""}`}><div className="flex items-start justify-between gap-4"><div><h3 className="font-display text-2xl font-semibold text-ink">{course.title}</h3><p className="mt-3 text-ink-muted">{course.description}</p></div>{index === 0 && <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">Tavsiya</span>}</div><ul className="my-7 space-y-3">{course.bullets.map((bullet) => <li key={bullet} className="flex gap-2 text-sm text-ink"><Check className="size-4 shrink-0 text-success" aria-hidden="true" />{bullet}</li>)}</ul><div className="border-t border-border pt-6"><p className="font-display text-3xl font-semibold text-ink">{price.price}</p><p className="mt-1 text-sm text-ink-muted">yoki {price.installment}</p><Button href={`/kurs/${course.slug}`} data-track="pricing_course" className="mt-6 w-full">{course.title}ni ko'rish</Button></div></Card></Spotlight></Reveal>; })}</div><div className="mt-8 flex items-start gap-3 rounded-xl border border-gold/30 bg-gold-soft p-5 text-sm text-ink"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" /><p><strong>{siteConfig.guaranteeText}.</strong> {siteConfig.guaranteeSummary} <a href={siteConfig.guaranteeTermsUrl} className="font-semibold text-brand underline">Shartlar</a></p></div></Container></Section>;
}
