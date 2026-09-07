"use client";

import { useState, useEffect } from "react";
import { AnalyticsData } from "../types";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Filter,
  ArrowRight,
  PieChart,
  ShoppingBag,
  Clock,
  Layers,
  ArrowDown,
  CheckCircle,
} from "lucide-react";

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      if (!res.ok) throw new Error("Analitika ma'lumotlarini yuklab bo'lmadi");
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error("fetchAnalytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const formatMoney = (val?: number) => {
    if (val === undefined || val === null) return "0 so'm";
    return new Intl.NumberFormat("uz-UZ").format(val) + " so'm";
  };

  if (loading || !analytics) {
    return (
      <div className="text-center py-16 text-ink-muted text-sm">
        Analitika ma'lumotlari yuklanmoqda...
      </div>
    );
  }

  const { summary, funnel, revenueByProvider, sources } = analytics;

  return (
    <div className="space-y-8">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-warm p-5 rounded-xl border border-border">
        <div>
          <h2 className="text-xl font-bold text-ink flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-accent" />
            Platforma Analitikasi va Voronka (CRM Analytics)
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Mijozlar voronkasi drop-off ko'rsatkichlari va moliyaviy daromad statistikasi.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-ink-muted" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-cream border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-accent"
          >
            <option value="7d">Oxirgi 7 kun</option>
            <option value="30d">Oxirgi 30 kun</option>
            <option value="90d">Oxirgi 90 kun</option>
            <option value="all">Barchasi (All Time)</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-cream border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Jami Leadlar</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {summary.totalLeads} ta
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            To'langan: {summary.paidCount} ta lead
          </div>
        </div>

        <div className="bg-cream border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Jami Daromad (Revenue)</span>
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent">
            {formatMoney(summary.totalRevenueUzS)}
          </div>
          <div className="text-xs text-ink-subtle">
            O'rtacha Chek (AOV): {formatMoney(summary.averageOrderValueUzS)}
          </div>
        </div>

        <div className="bg-cream border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Guruhlar To'lishi</span>
            <PieChart className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {summary.overallFillRate}
          </div>
          <div className="text-xs text-ink-subtle">
            Aktiv Talabalar: {summary.activeStudentsCount} nafar
          </div>
        </div>

        <div className="bg-cream border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Uy Vazifasi Navbati</span>
            <Clock className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {summary.pendingHomeworkCount} ta
          </div>
          <div className="text-xs text-ink-subtle">
            Tekshirilgan: {summary.reviewedHomeworkCount} ta topshiriq
          </div>
        </div>
      </div>

      {/* Funnel Drop-off Section */}
      <div className="bg-cream border border-border rounded-xl p-6 shadow-sm space-y-6">
        <div className="border-b border-border pb-4">
          <h3 className="text-lg font-bold text-ink flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-accent" />
            Mijozlar Voronkasi va Drop-off Analizi (Funnel Conversion)
          </h3>
          <p className="text-xs text-ink-muted mt-1">
            Har bir bosqichdagi konversiya darajasi va yo'qotilgan (drop-off) leadlar soni.
          </p>
        </div>

        <div className="space-y-4">
          {funnel.map((step, idx) => {
            const widthPct = Math.max(10, Math.min(100, (step.count / Math.max(1, summary.totalLeads)) * 100));

            return (
              <div key={step.stage} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-semibold text-ink gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-accent-soft text-accent text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{step.stage}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-normal text-ink-muted">
                    <span>
                      Leadlar: <strong className="text-ink">{step.count} ta</strong>
                    </span>
                    <span>
                      Konversiya: <strong className="text-accent">{step.conversionRate}</strong>
                    </span>
                    {idx > 0 && (
                      <span className="text-red-500 font-medium">
                        Drop-off: -{step.dropOffCount} ta ({step.dropOffRate})
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-cream-warm h-7 rounded-lg overflow-hidden relative border border-border flex items-center px-3">
                  <div
                    className={`h-full absolute left-0 top-0 transition-all duration-500 ${
                      idx === 0
                        ? "bg-blue-500/20"
                        : idx === 1
                        ? "bg-amber-500/20"
                        : idx === 2
                        ? "bg-purple-500/20"
                        : "bg-emerald-500/20"
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                  <span className="relative z-10 text-xs font-bold text-ink">
                    {step.count} ta lead ({step.conversionRate})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue & Lead Sources Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Payment Provider */}
        <div className="bg-cream border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-base text-ink flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2 text-accent" />
              To'lov Tizimlari Tushumi (Revenue by Provider)
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-ink">
                <span>Payme</span>
                <span className="font-bold text-accent">
                  {formatMoney(revenueByProvider.payme)}
                </span>
              </div>
              <div className="w-full bg-cream-warm h-2 rounded-full overflow-hidden border border-border">
                <div
                  className="bg-accent h-full"
                  style={{
                    width: `${
                      summary.totalRevenueUzS > 0
                        ? (revenueByProvider.payme / summary.totalRevenueUzS) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-ink">
                <span>Click</span>
                <span className="font-bold text-accent">
                  {formatMoney(revenueByProvider.click)}
                </span>
              </div>
              <div className="w-full bg-cream-warm h-2 rounded-full overflow-hidden border border-border">
                <div
                  className="bg-blue-500 h-full"
                  style={{
                    width: `${
                      summary.totalRevenueUzS > 0
                        ? (revenueByProvider.click / summary.totalRevenueUzS) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-ink">
                <span>Manual Invoys (Bank / Naqd)</span>
                <span className="font-bold text-accent">
                  {formatMoney(revenueByProvider.manual)}
                </span>
              </div>
              <div className="w-full bg-cream-warm h-2 rounded-full overflow-hidden border border-border">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${
                      summary.totalRevenueUzS > 0
                        ? (revenueByProvider.manual / summary.totalRevenueUzS) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Sources Distribution */}
        <div className="bg-cream border border-border rounded-xl p-6 shadow-sm space-y-4">
          <div className="border-b border-border pb-3">
            <h3 className="font-bold text-base text-ink flex items-center">
              <Layers className="w-4 h-4 mr-2 text-accent" />
              Leadlar Manbasi Taqsimoti (Lead Sources)
            </h3>
          </div>

          <div className="space-y-3">
            {sources.map((src) => (
              <div key={src.name} className="flex items-center justify-between text-xs p-2.5 bg-cream-warm rounded-lg border border-border">
                <span className="font-semibold text-ink capitalize">
                  {src.name === "quiz"
                    ? "Diagnostika Quiz"
                    : src.name === "free_lesson"
                    ? "Bepul dars"
                    : src.name === "form"
                    ? "Sayt formasi"
                    : src.name === "telegram"
                    ? "Telegram bot"
                    : src.name}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-ink-muted">{src.count} ta lead</span>
                  <span className="font-bold text-accent px-2 py-0.5 rounded bg-cream border border-border">
                    {src.percentage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
