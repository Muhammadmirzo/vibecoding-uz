"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Award, BookOpen, CirclePlay, FileCheck, MessageCircle } from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";

type DashboardUser = { fullName: string | null };
type Payment = { enrollmentId: string | null; status: string };
type State = { loading: boolean; error: string | null; payments: Payment[]; user: DashboardUser | null };

export default function KabinetDashboardPage() {
  const [state, setState] = useState<State>({ loading: true, error: null, payments: [], user: null });
  const hasEnrollment = state.payments.some((p) => p.status === "paid" && p.enrollmentId);

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

  return (
    <div className="min-h-screen bg-cream px-5 pb-16 pt-24 md:px-8">
      <KabinetNav />
      <main className="mx-auto w-full max-w-[1100px] space-y-8">
        <header className="rounded-2xl border border-border-strong bg-cream-warm p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-extrabold text-ink md:text-4xl">Xush kelibsiz{state.user?.fullName ? `, ${state.user.fullName}` : ""}!</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">Kabinetingizdagi faol a'zolarik va darslar shu yerdan ko'rsatiladi.</p>
        </header>
        {state.loading && <p className="rounded-xl border border-border bg-cream-warm p-6 text-sm text-ink-muted">A'zolarik ma'lumotlari yuklanmoqda...</p>}
        {state.error && <div role="alert" className="rounded-xl border border-danger-line bg-danger-soft p-6 text-sm text-danger">A'zolarikni yuklashda xatolik: {state.error}</div>}
        {!state.loading && !state.error && !hasEnrollment && <EmptyEnrollment />}
        {!state.loading && !state.error && hasEnrollment && <EnrollmentCard />}
        {!state.loading && !state.error && <SupportCard />}
      </main>
    </div>
  );
}

function EmptyEnrollment() {
  return <section className="rounded-2xl border border-border-strong bg-cream-warm p-8 text-center shadow-sm">
    <BookOpen className="mx-auto mb-4 h-8 w-8 text-accent" />
    <h2 className="text-xl font-bold text-ink">Hali faol kursga a'zo emasiz</h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">Kursga a'zolik va to'lov tasdiqlanganida, darslar shu sahifada ochiladi.</p>
    <Link href="/#kurs-tanlash" className="btn-primary mt-6 inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold">Kurslarni ko'rish <ArrowRight className="h-4 w-4" /></Link>
  </section>;
}

function EnrollmentCard() {
  return <section className="rounded-2xl border border-border-strong bg-cream-warm p-6 shadow-sm">
    <div className="flex items-center gap-3"><BookOpen className="h-5 w-5 text-accent" /><div><p className="text-xs font-mono text-accent">FAOL A'ZOLIK</p><h2 className="text-lg font-bold text-ink">Kursingiz</h2></div></div>
    <p className="mt-3 text-sm text-ink-muted">A'zolarik to'lov tasdiqlangan. Darslar ro'yxati va progressi API'dan olinadi.</p>
    <Link href="/kabinet/kurs/vibe-coding-express" className="btn-secondary mt-5 inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold">Kursga o'tish <CirclePlay className="h-4 w-4" /></Link>
  </section>;
}

function SupportCard() {
  return <section className="grid gap-6 md:grid-cols-3">
    <div className="rounded-xl border border-border-strong bg-cream-warm p-6"><FileCheck className="mb-3 h-5 w-5 text-accent" /><h3 className="font-bold text-ink">Amaliy vazifalar</h3><p className="mt-2 text-xs leading-relaxed text-ink-muted">Topshiriqlar faol kurs ichida ko'rsatiladi.</p></div>
    <div className="rounded-xl border border-border-strong bg-cream-warm p-6"><MessageCircle className="mb-3 h-5 w-5 text-telegram" /><h3 className="font-bold text-ink">Mentor bilan bog'lanish</h3><p className="mt-2 text-xs leading-relaxed text-ink-muted">Savollaringiz uchun Telegram orqali murojaat qiling.</p></div>
    <div className="rounded-xl border border-border-strong bg-cream-warm p-6"><Award className="mb-3 h-5 w-5 text-accent" /><h3 className="font-bold text-ink">Sertifikat</h3><p className="mt-2 text-xs leading-relaxed text-ink-muted">Sertifikat holati topshiriqlar yakunlangach ochiladi.</p></div>
  </section>;
}
