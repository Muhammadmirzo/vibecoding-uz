import * as React from "react";
import { Button } from "./Button";
import { Container, Eyebrow } from "./Layout";
import { GirihPattern } from "./GirihPattern";
import { revealProps } from "@/features/motion/ui/Reveal";

export function NextStepCTA({ title = "G'oyangizni keyingi qadamga olib chiqing", subtitle = "Avval 2 daqiqalik diagnostikani o'ting — sizga mos yo'nalishni ko'rsatamiz." }: { title?: string; subtitle?: string }) {
  return <section className="relative overflow-hidden bg-brand-surface py-16 text-on-brand-surface sm:py-24"><GirihPattern className="absolute inset-0 h-full w-full text-on-brand-surface opacity-[0.055]" /><Container className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end"><div className="max-w-2xl" {...revealProps()}><Eyebrow className="mb-4 text-gold">Keyingi qadam</Eyebrow><h2 className="text-balance font-display text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)] font-semibold leading-[1.16] tracking-[-0.035em]">{title}</h2><p className="mt-4 text-lg text-on-brand-surface/75">{subtitle}</p></div><div className="flex flex-wrap gap-3" {...revealProps(1)}><Button href="/diagnostika" data-track="next_diagnostic" size="lg">Bepul diagnostika</Button><Button href="/bepul-dars" data-track="next_free_lesson" size="lg" variant="onBrand">Bepul darsga yozilish</Button></div></Container></section>;
}
