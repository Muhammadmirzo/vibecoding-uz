import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CirclePlay, CheckCircle2, Flame, Award, Clock, ArrowRight } from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";

export const metadata: Metadata = {
  title: "Talaba Kabineti | Mirzo Academy",
  description: "Barcha o'quv modullari, vazifalar, baholar va sertifikat holatini boshqarish.",
};

export default function KabinetDashboardPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <KabinetNav />
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[var(--shadow-md)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-3 py-1 rounded-full">
                Guruh: Oktyabr 2026
              </span>
              <span className="text-xs font-mono font-bold text-[#27C93F] bg-[#27C93F]/15 px-3 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> 3 Hafta Streak
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-ink)]">
              Xush kelibsiz, Jamshid! 👋
            </h1>
            <p className="text-xs text-[var(--color-ink-muted)]">
              Vibe Coding Express mentori guruhida umumiy ilgarilash ko'rsatgichingiz: <strong>45%</strong>
            </p>
          </div>

          <Link href="/kabinet/kurs/vibe-coding-express/dars/lesson-04">
            <button className="btn-primary h-12 px-6 rounded-[var(--radius-md)] text-xs font-semibold inline-flex items-center gap-2 w-full md:w-auto">
              <CirclePlay className="w-4 h-4" /> Keyingi Darsni Boshlash
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Active Course Card */}
          <div className="md:col-span-2 bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg text-[var(--color-ink)]">
                <BookOpen className="w-5 h-5 text-[var(--color-accent)]" /> Vibe Coding Express (8 hafta)
              </div>
              <span className="text-xs font-mono text-[var(--color-accent)] font-bold">4 / 8 Modul</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--color-ink-muted)]">
                <span>Kurs o'zlashtirilishi</span>
                <span>45%</span>
              </div>
              <div className="w-full h-2.5 bg-[var(--color-cream-deep)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--color-accent)] w-[45%] rounded-full"></div>
              </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-2 pt-2">
              <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-cream)] border border-[var(--color-border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 font-semibold text-[var(--color-ink)]">
                  <CheckCircle2 className="w-4 h-4 text-[#27C93F]" />
                  <span>3-Dars: Tailind CSS & UI Komponentlar</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--color-ink-subtle)]">Bajarildi</span>
              </div>

              <div className="p-3.5 rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] border border-[var(--color-accent-line)] flex items-center justify-between text-xs font-bold text-[var(--color-ink)]">
                <div className="flex items-center gap-2.5">
                  <CirclePlay className="w-4 h-4 text-[var(--color-accent)]" />
                  <span>4-Dars: PostgreSQL & Drizzle ORM sxemasini qurish</span>
                </div>
                <span className="text-[11px] font-mono text-[var(--color-accent)]">Davom etish →</span>
              </div>
            </div>
          </div>

          {/* Deadlines & Notice Card */}
          <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-6 space-y-4">
            <div className="font-bold text-base text-[var(--color-ink)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--color-accent)]" /> Uy Vazifalari Muddatlari
            </div>

            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-cream)] border border-[var(--color-border)] space-y-2">
              <div className="text-xs font-bold text-[var(--color-ink)]">
                4-Modul Uy Vazifasi: PostgreSQL schema definition
              </div>
              <div className="text-[11px] font-mono text-[var(--color-accent)]">
                Deadline: Ertaga, 23:59 ga qadar
              </div>
              <Link href="/kabinet/uy-ishi/assignment-04">
                <button className="btn-secondary h-8 px-3 rounded-md text-[11px] font-semibold w-full mt-2">
                  Topshirish →
                </button>
              </Link>
            </div>

            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-cream)] border border-[var(--color-border)] space-y-1">
              <div className="text-xs font-bold text-[var(--color-ink)] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[var(--color-accent)]" /> Sertifikat Holati
              </div>
              <div className="text-xs text-[var(--color-ink-muted)]">
                Barcha modullar tugagach (min. 8.0 ball) sertifikat avtomatik yaratiladi.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
