"use client";

import { useState } from "react";
import { Container, Section } from "@/components/ui";

const weeks = [
  ["1–2-hafta", "G'oyani va muammoni aniqlashtirish", "Vazifa, o'quvchi va natijani yozma shakllantirasiz."],
  ["3–4-hafta", "Birinchi foydali versiya", "Claude Code bilan interfeys va asosiy oqimni qurasiz."],
  ["5–6-hafta", "Ma'lumotlar va integratsiyalar", "Supabase, autentifikatsiya va Telegram integratsiyasini qo'shasiz."],
  ["7–8-hafta", "Test, taqiDimot va natija", "Xatolarni tuzatib, haqiqiy foydalanuvchiga taqdim etasiz."],
] as const;

export function Roadmap() {
  const [active, setActive] = useState(0);
  return <Section pattern={false} className="bg-bg-sunken"><Container><div className="max-w-2xl"><p className="mb-4 text-sm font-semibold text-brand">Kurs haritasi</p><h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">8 hafta — ketma-ket, amaliy, ko'rinadigan.</h2></div><div className="mt-12 grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div className="space-y-2" role="tablist" aria-label="Kurs haftalari">{weeks.map(([period, title], index) => <button key={period} type="button" role="tab" aria-selected={active === index} onClick={() => setActive(index)} className={`w-full rounded-xl border p-4 text-left transition-colors ${active === index ? "border-accent bg-accent-soft" : "border-border bg-bg-elevated"}`}><span className="block font-mono text-xs text-brand">{period}</span><span className="mt-1 block font-semibold text-ink">{title}</span></button>)}</div><div className="rounded-2xl border border-border bg-bg-elevated p-8" role="tabpanel"><p className="font-mono text-sm text-accent">{weeks[active][0]}</p><h3 className="mt-4 font-display text-2xl font-semibold text-ink">{weeks[active][1]}</h3><p className="mt-4 text-lg leading-relaxed text-ink-muted">{weeks[active][2]}</p><p className="mt-8 border-t border-border pt-5 text-sm text-ink-subtle">Har bosqichda natijani ko'rasiz, feedback olasiz va keyingi qadamga o'tasiz.</p></div></div></Container></Section>;
}
