import * as React from "react";
import { Button } from "./Button";
import { Container } from "./Layout";
import { GirihPattern } from "./GirihPattern";

export function NextStepCTA({ title = "G'oyangizni keyingi qadamga olib chiqing", subtitle = "Avval 2 daqiqalik diagnostikani o'ting — sizga mos yo'nalishni ko'rsatamiz." }: { title?: string; subtitle?: string }) {
  return <section className="relative overflow-hidden bg-brand py-16 text-white sm:py-24"><GirihPattern className="absolute inset-0 h-full w-full text-white opacity-[0.055]" /><Container className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end"><div className="max-w-2xl"><p className="mb-4 text-sm font-semibold text-gold">Keyingi qadam</p><h2 className="text-balance font-display text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)] font-semibold leading-[1.16] tracking-[-0.035em]">{title}</h2><p className="mt-4 text-lg text-white/75">{subtitle}</p></div><div className="flex flex-wrap gap-3"><Button href="/diagnostika" size="lg">Bepul diagnostika</Button><Button href="/bepul-dars" size="lg" variant="outline" className="border-white/40 text-white hover:border-white hover:bg-white/10">Bepul darsga yozilish</Button></div></Container></section>;
}
