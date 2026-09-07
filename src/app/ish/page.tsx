"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  Laptop,
  Flame,
  Award,
  Send,
} from "lucide-react";
import {
  JOB_DEPARTMENTS,
  STATIC_JOB_OPENINGS,
  JobOpeningItem,
} from "@/features/jobs/jobsData";
import { ApplyJobModal } from "@/features/jobs/components/ApplyJobModal";

export default function JobsPage() {
  const [selectedDept, setSelectedDept] = React.useState<string>("Barchasi");
  const [activeModalJob, setActiveModalJob] = React.useState<JobOpeningItem | null>(null);

  const filteredJobs = React.useMemo(() => {
    if (selectedDept === "Barchasi") return STATIC_JOB_OPENINGS;
    return STATIC_JOB_OPENINGS.filter((job) => job.department === selectedDept);
  }, [selectedDept]);

  return (
    <div className="pt-28 pb-20 min-h-screen bg-cream">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10 space-y-12">
        
        {/* Hero Section */}
        <div className="text-center max-w-[760px] mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-accent-line bg-cream-warm text-[12px] tracking-wider text-accent uppercase font-mono font-bold">
            <Briefcase className="w-4 h-4" /> Karyera va Hamkorlik
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight">
            Mirzo Academy jamoasiga{" "}
            <span className="accent-serif">qo'shiling</span>
          </h1>
          <p className="text-sm md:text-base text-ink-muted leading-relaxed">
            Biz O'zbekistonda yangi avlod dasturchilari va tadbirkorlarini AI vositalari orqali tarbiyalayapmiz. Biz bilan birga ta'lim va texnologiya sohasini o'zgartiring.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-ink">Erkin Tartib & Remote</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Masofadan yoki Toshkentdagi qulay kovorking ofisimizdan gibrid tartibda ishlash.
            </p>
          </div>

          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-ink">Bepul AI Obunalari</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Claude Code Max, Cursor Pro, ChatGPT Plus va Midjourney hisoblari kompaniya hisobidan.
            </p>
          </div>

          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-ink">Bozoriy Maosh & Bonus</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Raqobatbardosh maosh va har bir muvaffaqiyatli kurs kohortasi uchun alohida bonuslar.
            </p>
          </div>

          <div className="bg-cream-warm border border-border-strong rounded-xl p-5 space-y-2">
            <div className="w-10 h-10 rounded-lg bg-accent-soft text-accent flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-ink">Tezkor O'sish</h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Real-world arxitektura va xalqaro startaplar ekotizimida bevosita ishtirok etish.
            </p>
          </div>
        </div>

        {/* Department Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-border pb-4">
          {JOB_DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-accent text-white shadow-sm"
                    : "bg-cream-warm text-ink-muted border border-border hover:text-ink hover:bg-cream-deep"
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Job Listings List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-ink-muted">
            <span>Bo'sh o'rinlar soni: <strong className="text-accent">{filteredJobs.length} ta</strong></span>
            <span>Barcha nomzodlarga 24 soatda javob beriladi</span>
          </div>

          <div className="grid gap-5">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 hover:border-accent-line hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-cream text-accent border border-border">
                      {job.department}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-ink-subtle bg-cream border border-border flex items-center gap-1">
                      <Clock className="w-3 h-3 text-accent" /> {job.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-ink-subtle bg-cream border border-border flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent" /> {job.location}
                    </span>
                  </div>

                  <Link href={`/ish/${job.slug}`} className="block group-hover:text-accent transition-colors">
                    <h2 className="text-xl md:text-2xl font-bold text-ink">
                      {job.title}
                    </h2>
                  </Link>

                  <p className="text-xs md:text-sm text-ink-muted leading-relaxed line-clamp-2">
                    {job.descriptionMd}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    onClick={() => setActiveModalJob(job)}
                    className="btn-primary h-11 px-6 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ariza topshirish</span>
                  </button>

                  <Link href={`/ish/${job.slug}`}>
                    <button className="btn-secondary h-11 px-5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 w-full">
                      <span>Batafsil ko'rish</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spontaneous Application Banner */}
        <div className="bg-cream-warm border border-accent-line rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-xs font-mono font-bold text-accent uppercase flex items-center justify-center md:justify-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Ochiq Taklif
            </span>
            <h3 className="text-xl md:text-2xl font-extrabold text-ink">
              Mos vakansiya topmadingizmi?
            </h3>
            <p className="text-xs md:text-sm text-ink-muted">
              Rezyumeingizni yuboring. Biz doim iqtidorli AI muhandislari, mentorlar va marketologlar bilan tanishishdan mamnunmiz.
            </p>
          </div>

          <button
            onClick={() =>
              setActiveModalJob({
                id: "general-inquiry",
                slug: "umumiy-ariza",
                title: "Ochiq Rezyume / Umumiy Ariza",
                department: "Barcha Yo'nalishlar",
                location: "Masofaviy",
                type: "Moslashuvchan",
                salary: "Kelishuv asosida",
                experience: "Ixtiyoriy",
                descriptionMd: "Umumiy hamkorlik va yangi ochiladigan vakansiyalar uchun.",
                responsibilities: [],
                requirements: [],
                benefits: [],
                status: "active",
                postedDate: "2026-09-07",
              })
            }
            className="btn-secondary h-12 px-8 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-2 shrink-0"
          >
            <Send className="w-4 h-4 text-accent" />
            <span>Rezyume Yuborish</span>
          </button>
        </div>

      </div>

      {/* Interactive Apply Phone Flow Modal */}
      {activeModalJob && (
        <ApplyJobModal
          isOpen={!!activeModalJob}
          onClose={() => setActiveModalJob(null)}
          job={activeModalJob}
        />
      )}
    </div>
  );
}
