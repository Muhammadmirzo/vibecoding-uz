import { Briefcase, CheckCircle2 } from "lucide-react";
import type { JobOpeningItem } from "@/features/jobs/jobsData";

export function JobDescription({ job }: { job: JobOpeningItem }) {
  return (
    <>
      <section className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-ink flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-accent" /> Vakansiya haqida
        </h2>
        <p className="text-sm text-ink-muted leading-relaxed">{job.descriptionMd}</p>
        <div className="p-3.5 rounded-lg bg-cream border border-border text-xs font-mono text-ink-subtle">
          Kerakli tajriba: <strong className="text-ink">{job.experience}</strong>
        </div>
      </section>
      <section className="bg-cream-warm border border-border-strong rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-ink">Sizning asosiy vazifalaringiz</h2>
        <ul className="space-y-3">
          {job.responsibilities.map((resp, i) => (
            <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-ink-muted leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>{resp}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
