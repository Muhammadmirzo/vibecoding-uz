import * as React from "react";
import { Button } from "./Button";
import { Container } from "./Layout";
import { GirihPattern } from "./GirihPattern";

export function NextStepCTA({ title = "G'oyangizni keyingi qadamga olib chiqing", subtitle = "Avval 2 daqiqalik diagnostikani o'ting — sizga mos yo'nalishni ko'rsatamiz." }: { title?: string; subtitle?: string }) {
  return <section className="relative overflow-hidden bg-brand py-20 text-white"><GirihPattern className="absolute inset-0 h-full w-full text-white opacity-[.08]" /><Container className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end"><div className="max-w-2xl"><p className="mb-4 text-sm font-semibold text-gold">Keyingi qadam</p><h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{title}</h2><p className="mt-4 text-lg text-white/75">{subtitle}</p></div><div className="flex flex-wrap gap-3"><Button href="/diagnostika" size="lg">Bepul diagnostika</Button><Button href="/bepul-dars" size="lg" variant="outline" className="border-white/40 text-white hover:border-white hover:bg-white/10">Bepul darsga yozilish</Button></div></Container></section>;
}
