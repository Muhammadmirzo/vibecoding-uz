import Link from "next/link";
import { ArrowLeft, ChevronRight, Clock, MapPin, DollarSign, Calendar } from "lucide-react";
import type { JobOpeningItem } from "@/features/jobs/jobsData";

export function JobDetailHeader({ job }: { job: JobOpeningItem }) {
  return (
    <>
      <nav className="flex items-center gap-2 text-xs font-mono text-ink-subtle">
        <Link href="/" className="hover:text-accent transition-colors">Bosh sahifa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/ish" className="hover:text-accent transition-colors">Bo'sh ish o'rinlari</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-semibold truncate max-w-xs md:max-w-md">{job.title}</span>
      </nav>
      <div>
        <Link href="/ish" className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-ink-muted hover:text-accent transition-colors">
          <ArrowLeft className="w-4 h-4" /> Barcha vakansiyalarga qaytish
        </Link>
      </div>
      <div className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-10 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-accent-soft text-accent border border-accent-line">{job.department}</span>
          <span className="px-3 py-1 rounded-full text-xs font-mono text-ink-subtle bg-cream border border-border flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-accent" /> {job.type}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono text-ink-subtle bg-cream border border-border flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" /> {job.location}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-mono text-ink-subtle bg-cream border border-border flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-accent" /> E'lon qilindi: {job.postedDate}
          </span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold text-ink tracking-tight">{job.title}</h1>
          <div className="text-xl md:text-2xl font-mono font-bold text-accent flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            <span>{job.salary}</span>
          </div>
        </div>
      </div>
    </>
  );
}
