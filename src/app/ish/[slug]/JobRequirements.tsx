import { CheckCircle2, Sparkles } from "lucide-react";
import type { JobOpeningItem } from "@/features/jobs/jobsData";

export function JobRequirements({ job }: { job: JobOpeningItem }) {
  return (
    <>
      <section className="bg-bg-elevated border border-border-strong rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-ink">Nomzodga qo'yiladigan talablar</h2>
        <ul className="space-y-3">
          {job.requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-ink-muted leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="bg-bg-elevated border border-border-strong rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-ink flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" /> Biz taklif qilamiz
        </h2>
        <ul className="space-y-3">
          {job.benefits.map((ben, i) => (
            <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-ink-muted leading-relaxed">
              <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2"></div>
              <span>{ben}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
