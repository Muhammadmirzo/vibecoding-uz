import Link from "next/link";
import { ArrowRight, Clock, DollarSign, MapPin, Send } from "lucide-react";
import { JOB_DEPARTMENTS, JobOpeningItem, STATIC_JOB_OPENINGS } from "@/features/jobs/jobsData";

interface JobOpeningsProps {
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
  onApply: (job: JobOpeningItem) => void;
}

export function JobOpenings({
  selectedDepartment,
  onDepartmentChange,
  onApply,
}: JobOpeningsProps) {
  const filteredJobs = selectedDepartment === "Barchasi"
    ? STATIC_JOB_OPENINGS
    : STATIC_JOB_OPENINGS.filter((job) => job.department === selectedDepartment);

  return (
    <section className="space-y-4" aria-labelledby="openings-heading">
      <h2 id="openings-heading" className="sr-only">Ochiq vakansiyalar</h2>
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-4" aria-label="Bo'lim bo'yicha filtrlash">
        {JOB_DEPARTMENTS.map((department) => {
          const isSelected = selectedDepartment === department;
          return (
            <button
              key={department}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onDepartmentChange(department)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold transition-all md:text-sm ${
                isSelected
                  ? "bg-accent text-white shadow-sm"
                  : "border border-border bg-cream-warm text-ink-muted hover:bg-cream-deep hover:text-ink"
              }`}
            >
              {department}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 text-xs font-mono text-ink-muted sm:flex-row sm:justify-between">
        <span>Bo&apos;sh o&apos;rinlar soni: <strong className="text-accent">{filteredJobs.length} ta</strong></span>
        <span>Arijalar Telegram orqali qabul qilinadi</span>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-cream-warm px-6 py-14 text-center">
          <h3 className="text-lg font-bold text-ink">Bu bo&apos;limda vakansiya yo&apos;q</h3>
          <p className="mt-2 text-sm text-ink-muted">Boshqa bo&apos;limlardagi ochiq imkoniyatlarni ko&apos;ring.</p>
          <button type="button" onClick={() => onDepartmentChange("Barchasi")} className="btn-secondary mt-5 h-11 rounded-lg px-6 text-sm font-semibold">
            Boshqa bo&apos;limlarni ko&apos;ring
          </button>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredJobs.map((job) => (
            <article key={job.id} className="group flex flex-col justify-between gap-6 rounded-2xl border border-border-strong bg-cream-warm p-6 transition-all hover:border-accent-line hover:shadow-md md:p-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border bg-cream px-3 py-1 font-mono text-[11px] font-bold text-accent">{job.department}</span>
                  <span className="flex items-center gap-1 rounded-full border border-border bg-cream px-2.5 py-0.5 font-mono text-[11px] text-ink-subtle"><Clock className="h-3 w-3 text-accent" />{job.type}</span>
                  <span className="flex items-center gap-1 rounded-full border border-border bg-cream px-2.5 py-0.5 font-mono text-[11px] text-ink-subtle"><MapPin className="h-3 w-3 text-accent" />{job.location}</span>
                </div>
                <Link href={`/ish/${job.slug}`} className="block transition-colors group-hover:text-accent">
                  <h3 className="text-xl font-bold text-ink md:text-2xl">{job.title}</h3>
                </Link>
                <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted md:text-sm">{job.descriptionMd}</p>
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-accent"><DollarSign className="h-4 w-4" />{job.salary}</div>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:flex-col">
                <div className="text-center text-xs font-semibold text-ink-muted lg:text-left">
                  <span className="block">{job.title}</span><span className="font-normal">{job.department}</span>
                </div>
                <button type="button" onClick={() => onApply(job)} aria-label={`${job.title} — ${job.department} bo‘limiga ariza topshirish`} className="btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-xs font-semibold">
                  <Send className="h-3.5 w-3.5" /> Ariza topshirish
                </button>
                <Link href={`/ish/${job.slug}`} className="btn-secondary inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg px-5 text-xs font-semibold">
                  Batafsil ko&apos;rish <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
