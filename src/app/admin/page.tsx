import Link from "next/link";
import { ArrowRight, BarChart3, CheckSquare, GraduationCap, Kanban, ShieldCheck } from "lucide-react";

const modules = [
  { href: "/admin/leads", title: "Leadlar va CRM", description: "Yangi mijozlarni kuzatib borish va ishlab chiqarish bosqichini boshqaring.", icon: Kanban },
  { href: "/admin/cohorts", title: "Guruhlar va qabul", description: "Guruhlar, o'rinlar, muddatlar va qabul narxlarini boshqaring.", icon: GraduationCap },
  { href: "/admin/homework", title: "Uy vazifalari", description: "Topshiriqlarni tekshirish navbatini mezonlar va feedback bilan yuriting.", icon: CheckSquare },
  { href: "/admin/analytics", title: "Analitika", description: "Mavjud API ma&apos;lumotlari asosida konversiya va to&apos;lovlar ko&apos;rsatkichlarini ko&apos;ring.", icon: BarChart3 },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-bg-elevated p-6 shadow-sm sm:p-8">
        <div className="absolute -end-16 -top-20 h-52 w-52 rounded-full bg-accent-soft opacity-60" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand"><ShieldCheck className="h-4 w-4" />Admin panel</span>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Boshqaruv markazi</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted sm:text-base">Mijozlar oqimi, kurs guruhlari, topshiriqlar va platforma bo&apos;yicha mavjud ma&apos;lumotlarni bir joydan boshqaring.</p>
        </div>
      </section>

      <section aria-labelledby="modules-title">
        <div className="mb-4"><h2 id="modules-title" className="font-display text-lg font-semibold text-ink">Tezkor bo&apos;limlar</h2><p className="mt-1 text-sm text-ink-muted">Kundalik ishlarni to&apos;g&apos;ri bo&apos;limdan davom ettiring.</p></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href} className="group flex min-h-44 flex-col justify-between rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <div><span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand"><Icon className="h-5 w-5" /></span><h3 className="mt-4 font-semibold text-ink">{module.title}</h3><p className="mt-1 text-sm leading-6 text-ink-muted">{module.description}</p></div>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand">Bo&apos;limga o&apos;tish <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
