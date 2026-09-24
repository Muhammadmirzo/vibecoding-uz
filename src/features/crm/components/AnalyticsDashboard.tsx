"use client";

import { BarChart3, Filter, TrendingUp } from "lucide-react";
import { useAnalytics } from "./Analytics/useAnalytics";
import { StatCards } from "./Analytics/StatCards";
import { RevenueChart } from "./Analytics/RevenueChart";
import { SourceBreakdown } from "./Analytics/SourceBreakdown";

export function AnalyticsDashboard() {
  const { analytics, loading, period, setPeriod } = useAnalytics();
  if (loading || !analytics) return <div className="text-center py-16 text-ink-muted text-sm">Analitika ma'lumotlari yuklanmoqda...</div>;
  const { summary, funnel, revenueByProvider, sources } = analytics;
  return <div className="space-y-8">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-sunken p-5 rounded-xl border border-border"><div><h2 className="text-xl font-bold text-ink flex items-center"><BarChart3 className="w-6 h-6 mr-2 text-accent" />Platforma Analitikasi va Voronka (CRM Analytics)</h2><p className="text-sm text-ink-muted mt-1">Mijozlar voronkasi drop-off ko'rsatkichlari va moliyaviy daromad statistikasi.</p></div><div className="flex items-center space-x-2"><Filter className="w-4 h-4 text-ink-muted" /><select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 bg-bg-elevated border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent"><option value="7d">Oxirgi 7 kun</option><option value="30d">Oxirgi 30 kun</option><option value="90d">Oxirgi 90 kun</option><option value="all">Barchasi (All Time)</option></select></div></div>
    <StatCards summary={summary} />
    <div className="bg-bg-elevated border border-border rounded-xl p-6 shadow-sm space-y-6"><div className="border-b border-border pb-4"><h3 className="text-lg font-bold text-ink flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-accent" />Mijozlar Voronkasi va Drop-off Analizi (Funnel Conversion)</h3><p className="text-xs text-ink-muted mt-1">Har bir bosqichdagi konversiya darajasi va yo'qotilgan (drop-off) leadlar soni.</p></div><div className="space-y-4">{funnel.map((step, idx) => { const widthPct = Math.max(10, Math.min(100, (step.count / Math.max(1, summary.totalLeads)) * 100)); return <div key={step.stage} className="space-y-2"><div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-semibold text-ink gap-1"><div className="flex items-center space-x-2"><span className="w-6 h-6 rounded-full bg-accent-soft text-accent text-xs flex items-center justify-center font-bold">{idx + 1}</span><span>{step.stage}</span></div><div className="flex items-center space-x-4 text-xs font-normal text-ink-muted"><span>Leadlar: <strong className="text-ink">{step.count} ta</strong></span><span>Konversiya: <strong className="text-accent">{step.conversionRate}</strong></span>{idx > 0 && <span className="text-danger font-medium">Drop-off: -{step.dropOffCount} ta ({step.dropOffRate})</span>}</div></div><div className="w-full bg-bg-sunken h-7 rounded-lg overflow-hidden relative border border-border flex items-center px-3"><div className={`h-full absolute left-0 top-0 transition-[width] duration-500 ${idx === 0 ? "bg-brand/20" : idx === 1 ? "bg-gold/20" : idx === 2 ? "bg-brand/20" : "bg-success/20"}`} style={{ width: `${widthPct}%` }} /><span className="relative z-10 text-xs font-bold text-ink">{step.count} ta lead ({step.conversionRate})</span></div></div>; })}</div></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><RevenueChart revenue={revenueByProvider} total={summary.totalRevenueUzS} /><SourceBreakdown sources={sources} /></div>
  </div>;
}
