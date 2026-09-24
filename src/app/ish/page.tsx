"use client";

import * as React from "react";
import { Briefcase, Send, Sparkles } from "lucide-react";
import { JobOpeningItem } from "@/features/jobs/jobsData";
import { ApplyJobModal } from "@/features/jobs/components/ApplyJobModal";
import { JobBenefits } from "./JobBenefits";
import { JobOpenings } from "./JobOpenings";
import { NextStepCTA } from "@/components/ui/NextStepCTA";

const GENERAL_APPLICATION: JobOpeningItem = {
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
};

export default function JobsPage() {
  const [selectedDepartment, setSelectedDepartment] = React.useState("Barchasi");
  const [activeModalJob, setActiveModalJob] = React.useState<JobOpeningItem | null>(null);

  return (
    <div className="min-h-screen bg-bg pb-20 pt-28">
      <div className="mx-auto w-full max-w-[1360px] space-y-12 px-5 md:px-8 lg:px-10">
        <header className="mx-auto max-w-[760px] space-y-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3.5 py-1.5 font-mono text-[12px] font-bold uppercase tracking-wider text-accent">
            <Briefcase className="h-4 w-4" /> Karyera va Hamkorlik
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-5xl">
            Naqsh jamoasiga <span className="font-display">qo'shiling</span>
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted md:text-base">
            Biz O&apos;zbekistonda yangi avlod dasturchilari va tadbirkorlarini AI vositalari orqali tarbiyalayapmiz. Biz bilan birga ta&apos;lim va texnologiya sohasini o&apos;zgartiring.
          </p>
        </header>

        <JobBenefits />

        <JobOpenings
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          onApply={setActiveModalJob}
        />

        <section className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-border bg-bg-elevated p-8 shadow-sm md:flex-row md:p-10">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <span className="flex items-center justify-center gap-1.5 font-mono text-xs font-bold uppercase text-accent md:justify-start">
              <Sparkles className="h-3.5 w-3.5" /> Ochiq Taklif
            </span>
            <h2 className="text-xl font-extrabold text-ink md:text-2xl">Mos vakansiya topmadingizmi?</h2>
            <p className="text-xs text-ink-muted md:text-sm">
              Rezyumeingizni yuboring. Biz doim iqtidorli AI muhandislari, mentorlar va marketologlar bilan tanishishdan mamnunmiz.
            </p>
          </div>
          <button type="button" onClick={() => setActiveModalJob(GENERAL_APPLICATION)} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-border-strong bg-bg-elevated px-8 text-xs font-semibold text-ink hover:bg-bg-sunken">
            <Send className="h-4 w-4 text-accent" /> Rezyume Yuborish
          </button>
        </section>
      </div>

      {activeModalJob && (
        <ApplyJobModal isOpen onClose={() => setActiveModalJob(null)} job={activeModalJob} />
      )}
      <NextStepCTA title="Ish o‘rnini topishdan oldin o‘z malakangizni oshirishni boshlang" />
    </div>
  );
}
