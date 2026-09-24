import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { Container, Heading, Eyebrow } from "@/components/ui";
import { Card } from "@/components/ui/Surfaces";
import { NextStepCTA } from "@/components/ui/NextStepCTA";

export const metadata: Metadata = { title: `${siteConfig.guaranteeDays} kunlik pul qaytarish kafolati`, description: "Kursga qabul qilishdan keyin pul qaytarish shartlari va tartibi." };

export default function Page() { return <div className="bg-bg text-ink"><section className="border-b border-border"><Container className="py-20 sm:py-28"><Eyebrow>Kafolat siyosati</Eyebrow><Heading as="h1" className="mt-3">Pul qaytarish shartlari</Heading><p className="mt-4 text-ink-muted">Oxirgi yangilanish: 7-sentyabr 2026</p></Container></section><Container className="py-16"><Card className="max-w-3xl space-y-7 text-[17px] leading-relaxed text-ink-muted"><section><Heading as="h2" className="text-2xl">1. Qachon qaytariladi?</Heading><p className="mt-3">{siteConfig.guaranteeText} Kurs kirish havolasi ochilgandan keyin {siteConfig.guaranteeDays} kun ichida, birinchi 2 modulni yakunlab amaliy foyda ko‘rmagan bo‘lsangiz, ariza berishingiz mumkin.</p></section><section><Heading as="h2" className="text-2xl">2. Qaytarish tartibi</Heading><p className="mt-3">Arizangizni Telegram orqali operatsiyalar bo‘limiga yuboring. Ariza ko‘rib chiqilgach, to‘lov usuli va bank hisobingizga qaytarish tartibi tasdiqlanadi.</p></section><section><Heading as="h2" className="text-2xl">3. Qaysi holatlarda qaytarilmaydi?</Heading><ul className="mt-3 list-disc space-y-2 pl-5"><li>Muddat o‘tgan holatlar.</li><li>Kurs qoidalariga zid ravishda topshiriq bajarilmagan holatlar.</li></ul></section><Link href="/offerta" className="inline-flex font-semibold text-brand underline underline-offset-4">Ommaviy ofertani o‘qish</Link></Card></Container><NextStepCTA /></div>; }
