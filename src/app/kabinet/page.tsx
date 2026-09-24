"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, CirclePlay, CreditCard, Gift, Settings } from "lucide-react";
import { Button } from "@/components/ui";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { KabinetPageHeader, KabinetSkeleton, KabinetState } from "@/features/lms/components/KabinetPage";

type DashboardUser = { fullName: string | null };
type Payment = { enrollmentId: string | null; status: string };
type State = { loading: boolean; error: string | null; payments: Payment[]; user: DashboardUser | null };

const initialState: State = { loading: true, error: null, payments: [], user: null };

export default function KabinetDashboardPage() {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/me", { cache: "no-store" }).then(async (res) => {
        const data: { user?: DashboardUser; error?: string } = await res.json();
        if (!res.ok) throw new Error(data.error || "Foydalanuvchi ma'lumotini yuklab bo'lmadi");
        return data.user || null;
      }),
      fetch("/api/me/payments", { cache: "no-store" }).then(async (res) => {
        const data: { payments?: Payment[]; error?: string } = await res.json();
        if (!res.ok) throw new Error(data.error || "Ma'lumotni yuklab bo'lmadi");
        return data.payments || [];
      }),
    ])
      .then(([user, payments]) => {
        if (active) setState({ loading: false, error: null, payments, user });
      })
      .catch((error: unknown) => {
        if (active) setState({ loading: false, error: error instanceof Error ? error.message : "Xatolik yuz berdi", payments: [], user: null });
      });
    return () => { active = false; };
  }, []);

  const hasEnrollment = state.payments.some((payment) => payment.status === "paid" && payment.enrollmentId);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <KabinetNav />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-5 pb-28 pt-24 md:px-8 md:pt-28 lg:pl-80 lg:pr-8">
        <KabinetPageHeader
          title={state.user?.fullName ? `Xush kelibsiz, ${state.user.fullName}` : "Xush kelibsiz"}
          description="Faol a&apos;zolarik, to&apos;lovlar va kurs bo&apos;limlariga shu yerdan o&apos;ting."
        />

        {state.loading ? <KabinetSkeleton label="Kabinet ma&apos;lumotlari yuklanmoqda" /> : null}
        {!state.loading && state.error ? <KabinetState tone="error" title="Kabinetni yuklab bo&apos;lmadi" description={state.error} /> : null}
        {!state.loading && !state.error && !hasEnrollment ? (
          <KabinetState
            title="Faol kurs a&apos;zoligingiz yo&apos;q"
            description="Kursga a&apos;zolik va to&apos;lov tasdiqlanganida, darslar shu sahifada ochiladi."
            action={{ label: "Kurslarni ko&apos;rish", href: "/#kurs-tanlash" }}
          />
        ) : null}
        {!state.loading && !state.error && hasEnrollment ? <ActiveCourse /> : null}
        {!state.loading && !state.error ? <QuickLinks /> : null}
      </main>
    </div>
  );
}

function ActiveCourse() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm">
      <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <p className="text-sm font-semibold text-success">Faol a&apos;zolik</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-ink">Vibe Coding Express</h2>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">Kursga kirishda keyingi dars va topshiriqlar tizimdagi haqiqiy ma&apos;lumotlar asosida ko&apos;rsatiladi.</p>
        </div>
        <Button href="/kabinet/kurs/vibe-coding-express" className="w-full md:w-auto">
          <CirclePlay className="h-5 w-5" aria-hidden="true" /> Kursga o&apos;tish
        </Button>
      </div>
    </section>
  );
}

function QuickLinks() {
  const links = [
    { href: "/kabinet/to-lovlar", label: "To&apos;lovlar", text: "To&apos;lov tarixi va cheklar", icon: CreditCard },
    { href: "/kabinet/referral", label: "Bonus", text: "Taklif havolangizni ulashing", icon: Gift },
    { href: "/kabinet/sozlamalar", label: "Profil", text: "Ma&apos;lumotlarni boshqaring", icon: Settings },
  ];
  return (
    <section aria-labelledby="cabinet-links-title">
      <h2 id="cabinet-links-title" className="font-display text-lg font-semibold text-ink">Kabinet bo&apos;limlari</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex min-h-28 items-center gap-4 rounded-xl border border-border bg-bg-elevated p-5 transition-colors hover:border-brand">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span><span className="block font-semibold text-ink">{item.label}</span><span className="mt-1 block text-sm text-ink-muted">{item.text}</span></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
