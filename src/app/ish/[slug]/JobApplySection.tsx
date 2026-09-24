"use client";

import { CheckCircle2 } from "lucide-react";
import type { JobOpeningItem } from "@/features/jobs/jobsData";
import { useApplyForm } from "@/features/jobs/components/apply/ApplyForm";
import { InlineApplyFields } from "@/features/jobs/components/apply/InlineApplyFields";

export function JobApplySection({ job }: { job: JobOpeningItem }) {
  const form = useApplyForm(job, false, "Tarmoq xatoligi. Qayta urinib ko'ring.");

  return (
    <div className="lg:col-span-5 lg:sticky lg:top-24">
      <div className="bg-bg-elevated border-2 border-border rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-accent uppercase">Tezkor Ariza</span>
          <h3 className="text-2xl font-bold text-ink">Vakansiyaga topshirish</h3>
          <p className="text-xs text-ink-muted">Telefon raqamingiz va rezyumeingizni qoldiring. 24 soat ichida bog'lanamiz.</p>
        </div>
        {form.success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-ink">Arizangiz qabul qilindi!</h4>
            <p className="text-xs text-ink-muted leading-relaxed">
              Hurmatli <strong className="text-ink">{form.fullName}</strong>, ma'lumotlaringiz HR jamoamizga muvaffaqiyatli yetkazildi. Tez orada sizga qo'ng'iroq qilamiz.
            </p>
            <button onClick={form.resetForAnotherApplication} className="min-h-11 border border-border-strong bg-bg-elevated px-6 rounded-lg text-xs font-semibold text-ink hover:bg-bg-sunken">Boshqa ariza topshirish</button>
          </div>
        ) : (
          <InlineApplyFields form={form} />
        )}
      </div>
    </div>
  );
}
