"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, CirclePlay, CreditCard, Gift, Settings } from "lucide-react";
import { Button } from "@/components/ui";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { KabinetPageHeader, KabinetSkeleton, KabinetState } from "@/features/lms/components/KabinetPage";
import { fetchWithTimeout } from "@/lib/http/fetch";

type DashboardUser = { fullName: string | null };
type Payment = { enrollmentId: string | null; status: string };
type State = { loading: boolean; error: string | null; payments: Payment[]; user: DashboardUser | null };

const initialState: State = { loading: true, error: null, payments: [], user: null };

export default function KabinetDashboardPage() {
  const [state, setState] = useState<State>(initialState);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    Promise.all([
      fetchWithTimeout("Kabinet", "/api/me", { cache: "no-store", signal: controller.signal }, 10_000).then(async (res) => {
        const data: { user?: DashboardUser; error?: string; message?: string } = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Texnik xizmat vaqtincha ishlamayapti");
        return data.user || null;
      }),
      fetchWithTimeout("Kabinet", "/api/me/payments", { cache: "no-store", signal: controller.signal }, 10_000).then(async (res) => {
        const data: { payments?: Payment[]; error?: string; message?: string } = await res.json();
        if (!res.ok) throw new Error(data.message || data.error || "Texnik xizmat vaqtincha ishlamayapti");
        return data.payments || [];
      }),
    ])
      .then(([user, payments]) => {
        if (active) setState({ loading: false, error: null, payments, user });
      })
      .catch((error: unknown) => {
        if (active) setState({ loading: false, error: error instanceof Error ? error.message : "Xatolik yuz berdi", payments: [], user: null });
      });
    return () => { active = false; controller.abort(); };
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
        {!state.loading && state.error ? (
          <div className="space-y-4">
            <KabinetState tone="error" title="Texnik xizmat vaqtincha ishlamayapti" description={state.error} />
            <div className="text-center"><Button onClick={() => window.location.reload()}>Qayta urinish</Button></div>
          </div>
        ) : null}
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
    <section className="card-glow relative overflow-hidden rounded-2xl border border-border bg-bg-elevated shadow-sm">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_85%_20%,var(--accent-soft),transparent_70%),radial-gradient(ellipse_40%_60%_at_10%_90%,var(--brand-soft),transparent_70%)]" />
      </div>
      <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Faol a&apos;zolik
          </p>
          <h2 className="mt-3 font-display text-xl font-semibold text-ink md:text-2xl">Vibe Coding Express</h2>
          <p className="mt-2 max-w-xl text-base leading-relaxed text-ink-muted">Qayerda to&apos;xtagan bo&apos;lsangiz — shu yerdan davom eting. Keyingi dars va topshiriqlar tizimdagi haqiqiy ma&apos;lumotlar asosida ko&apos;rsatiladi.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button href="/kabinet/kurs/vibe-coding-express" size="lg" className="w-full md:w-auto">
            <CirclePlay className="h-5 w-5" aria-hidden="true" /> Davom etish
          </Button>
          <Button href="/kabinet/baholar" variant="ghost" size="sm" className="w-full md:w-auto">
            Baholarimni ko&apos;rish
          </Button>
        </div>
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
            <Link key={item.href} href={item.href} className="card-glow flex min-h-28 items-center gap-4 rounded-xl border border-border bg-bg-elevated p-5 transition hover:-translate-y-0.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span><span className="block font-semibold text-ink">{item.label}</span><span className="mt-1 block text-sm text-ink-muted">{item.text}</span></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
