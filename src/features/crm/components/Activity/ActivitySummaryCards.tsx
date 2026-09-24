"use client";
import { CheckCircle2, Clock, ShieldAlert, TrendingUp } from "lucide-react";
import type { ActivityKpis } from "./types";
export function ActivitySummaryCards({ kpis }: { kpis: ActivityKpis }) { return (<>
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-bg-sunken border border-border space-y-1 shadow-sm">
          <div className="text-xs font-mono font-medium text-ink-muted uppercase">Jami Talabalar</div>
          <div className="text-2xl font-extrabold text-ink">{kpis.totalStudents}</div>
          <div className="text-[11px] text-ink-subtle font-mono">Barcha aktiv guruhlar</div>
        </div>

        <div className="p-4 rounded-xl bg-bg-sunken border border-border space-y-1 shadow-sm">
          <div className="text-xs font-mono font-medium text-success uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            Faol Talabalar
          </div>
          <div className="text-2xl font-extrabold text-ink">{kpis.activeStudents}</div>
          <div className="text-[11px] text-success font-medium">muntazam dars qilmoqda</div>
        </div>

        <div className="p-4 rounded-xl bg-bg-sunken border border-border space-y-1 shadow-sm">
          <div className="text-xs font-mono font-medium text-gold uppercase flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-gold" />
            Xavf Ostida
          </div>
          <div className="text-2xl font-extrabold text-ink">{kpis.atRiskStudents}</div>
          <div className="text-[11px] text-gold font-medium">&gt;3 kun passiv bo&apos;lganlar</div>
        </div>

        <div className="p-4 rounded-xl bg-bg-sunken border border-border space-y-1 shadow-sm">
          <div className="text-xs font-mono font-medium text-ink-muted uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            O'rtacha Progress
          </div>
          <div className="text-2xl font-extrabold text-accent">{kpis.avgProgressPercent}%</div>
          <div className="text-[11px] text-ink-subtle font-mono">LMS darslar tamomlanishi</div>
        </div>

        <div className="p-4 rounded-xl bg-bg-sunken border border-border space-y-1 shadow-sm col-span-2 sm:col-span-1">
          <div className="text-xs font-mono font-medium text-ink-muted uppercase flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-accent" />
            Kutayotgan Vazifalar
          </div>
          <div className="text-2xl font-extrabold text-ink">{kpis.pendingHomeworkCount}</div>
          <div className="text-[11px] text-ink-subtle font-mono">Tekshirilishi zarur</div>
        </div>
      </div>
</>
); }
