"use client";

import Link from "next/link";
import {
  BookOpen,
  CirclePlay,
  Award,
  ArrowRight,
  MessageCircle,
  Calendar,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { useAuth } from "@/context/AuthContext";
import { siteConfig } from "@/lib/siteConfig";

export default function KabinetDashboardPage() {
  const { user } = useAuth();
  const userName = user?.fullName ? user.fullName : "Talaba";

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <KabinetNav />
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-cream-warm border border-border-strong rounded-xl md:rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
          <div className="space-y-3 max-w-2xl">
            {/* Hierarchy: Badge -> Sarlavha -> Tavsif */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-accent bg-accent-soft px-3 py-1 rounded-full border border-accent-line flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Kurs boshlanishi: {siteConfig.nextCohortDate}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
              Xush kelibsiz, {userName}!
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              Vibe Coding Express o'quv dasturi, amaliy topshiriqlar va dars materiallari boshqaruv paneli.
            </p>
          </div>

          <Link href="/kabinet/kurs/vibe-coding-express" className="w-full md:w-auto shrink-0">
            <button className="btn-primary h-12 px-6 rounded-lg text-xs md:text-sm font-semibold inline-flex items-center justify-center gap-2 w-full md:w-auto shadow-sm">
              <CirclePlay className="w-4 h-4" />
              <span>Darslarni Ko'rish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Dashboard Grid - 4 Breakpoint Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Card 1: Active Course Card */}
          <div className="sm:col-span-2 lg:col-span-2 bg-cream-warm border border-border-strong rounded-xl md:rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              {/* Badge -> Sarlavha -> Tavsif */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-accent bg-accent-soft px-2.5 py-1 rounded-full border border-accent-line">
                  Faol Kurs
                </span>
                <span className="text-xs font-mono font-semibold text-ink-subtle">
                  8 hafta
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-lg font-bold text-ink">
                <BookOpen className="w-5 h-5 text-accent shrink-0" />
                <h2>Vibe Coding Express</h2>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                Sun'iy intellekt va zamonaviy no-code/low-code vositalari yordamida tezkor dasturlash, arxitektura qurish va real loyihalarni ishga tushirish kursi.
              </p>
            </div>

            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="text-xs font-mono text-ink-subtle flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Barcha dars videolari ochiq</span>
              </div>
              <Link href="/kabinet/kurs/vibe-coding-express">
                <button className="btn-secondary h-10 px-4 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                  <span>Dars modullariga o'tish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Card 2: Homework / Tasks Card */}
          <div className="bg-cream-warm border border-border-strong rounded-xl md:rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              {/* Badge -> Sarlavha -> Tavsif */}
              <span className="inline-block text-xs font-mono font-bold text-accent bg-accent-soft px-2.5 py-1 rounded-full border border-accent-line">
                Amaliy Vazifalar
              </span>

              <div className="flex items-center gap-2 text-base font-bold text-ink">
                <FileCheck className="w-5 h-5 text-accent shrink-0" />
                <h2>Uy Vazifalari</h2>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                Uy vazifalari Telegram bot orqali tekshiriladi. Har bir modul topshiriqlari bot va mentorlar tomonidan baholanadi.
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <Link href="/kabinet/kurs/vibe-coding-express" className="block">
                <button className="btn-secondary h-10 px-4 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full">
                  <span>Modul vazifalariga o'tish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* Card 3: Mentor Telegram CTA Card */}
          <div className="bg-cream-warm border border-border-strong rounded-xl md:rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              {/* Badge -> Sarlavha -> Tavsif */}
              <span className="inline-block text-xs font-mono font-bold text-telegram bg-telegram-soft px-2.5 py-1 rounded-full border border-telegram/20">
                Jonli Muloqot
              </span>

              <div className="flex items-center gap-2 text-base font-bold text-ink">
                <MessageCircle className="w-5 h-5 text-telegram shrink-0" />
                <h2>Mentor Bilan Bog'lanish</h2>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                O'quv jarayonida yuzaga kelgan barcha savollaringizga mentor o'zi javob beradi.
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <a
                href="https://t.me/m/ODAfK_QIMjky"
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <button className="btn-primary h-10 px-4 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full bg-telegram hover:bg-telegram/90">
                  <MessageCircle className="w-4 h-4" />
                  <span>Telegramda Yozish</span>
                </button>
              </a>
            </div>
          </div>

          {/* Card 4: Certificate Info Card */}
          <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4 bg-cream-warm border border-border-strong rounded-xl md:rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent border border-accent-line flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                {/* Badge -> Sarlavha -> Tavsif */}
                <div className="text-xs font-mono font-bold text-ink-subtle uppercase tracking-wider">
                  Sertifikat Holati
                </div>
                <h3 className="text-sm font-bold text-ink">
                  Bitiruv Sertifikati
                </h3>
                <p className="text-xs text-ink-muted">
                  Barcha modullar va topshiriqlar muvaffaqiyatli yakunlangach, rasmiy sertifikat avtomatik taqdim etiladi.
                </p>
              </div>
            </div>

            <Link href="/kabinet/sertifikat" className="w-full sm:w-auto shrink-0">
              <button className="btn-secondary h-9 px-4 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                <span>Sertifikat sahifasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
