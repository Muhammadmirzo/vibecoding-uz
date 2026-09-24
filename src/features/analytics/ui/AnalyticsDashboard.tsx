"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { LineAreaChart } from "./charts/LineAreaChart";
import { FunnelChart } from "./charts/FunnelChart";
import { BarChart } from "./charts/BarChart";
import { Sparkline } from "./charts/Sparkline";
import { overviewSchema, type OverviewResponse } from "../domain/report-schemas";
import { timeseriesSchema, type TimeseriesResponse } from "../domain/report-schemas";
import { acquisitionSchema, type AcquisitionResponse } from "../domain/report-schemas";
import { behaviourSchema, type BehaviourResponse } from "../domain/report-schemas";
import { funnelSchema, type FunnelResponse } from "../domain/report-schemas";
import { studentsSchema, type StudentsResponse } from "../domain/report-schemas";
import { salesSchema, type SalesResponse } from "../domain/report-schemas";
import { dimensionsSchema, type DimensionsResponse } from "../domain/report-schemas";
import { realtimeSchema, type RealtimeResponse } from "../domain/report-schemas";

const presets = { today: "Bugun", "7d": "7 kun", "30d": "30 kun", "90d": "90 kun" } as const;
type Preset = keyof typeof presets;
type DashboardData = { overview?: OverviewResponse; timeseries?: TimeseriesResponse; acquisition?: AcquisitionResponse; behaviour?: BehaviourResponse; funnel?: FunnelResponse; students?: StudentsResponse; sales?: SalesResponse; devices?: DimensionsResponse; countries?: DimensionsResponse; realtime?: RealtimeResponse };

function rangeFor(preset: Preset, custom: { from: string; to: string }): { from: string; to: string } {
  if (custom.from && custom.to) return custom;
  const to = new Date(); const from = new Date();
  if (preset === "today") from.setHours(0, 0, 0, 0); else from.setDate(to.getDate() - Number(preset.slice(0, -1)) + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}
function read<T>(schema: z.ZodType<T>, body: unknown): T | undefined { const envelope = z.object({ data: z.unknown() }).safeParse(body); if (!envelope.success) return undefined; const parsed = schema.safeParse(envelope.data.data); return parsed.success ? parsed.data : undefined; }
function Delta({ value }: { value: number | null }) { if (value === null) return <span className="text-xs text-ink-subtle">yangi</span>; const positive = value >= 0; return <span className={`text-xs font-semibold ${positive ? "text-success" : "text-danger"}`}>{positive ? "+" : ""}{value.toFixed(1)}%</span>; }
function Stat({ label, value, delta }: { label: string; value: string; delta: number | null }) { return <div className="rounded-xl border border-border bg-bg-elevated p-4 shadow-sm"><p className="text-sm text-ink-muted">{label}</p><div className="mt-2 flex items-end justify-between gap-2"><strong className="text-2xl text-ink">{value}</strong><Delta value={delta} /></div></div>; }
function Block({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm sm:p-6"><h2 className="font-display text-lg font-semibold text-ink">{title}</h2><div className="mt-4">{children}</div></section>; }

export function AnalyticsDashboard() {
  const [preset, setPreset] = useState<Preset>("30d");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [compare, setCompare] = useState(true);
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const range = useMemo(() => rangeFor(preset, custom), [preset, custom]);
  useEffect(() => {
    let active = true; setLoading(true); setError(false);
    const query = `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}&compare=${compare}`;
    const reports = ["overview", "timeseries", "acquisition", "behaviour", "funnel", "students", "sales", "devices", "countries", "realtime"];
    Promise.all(reports.map(async (report) => { const response = await fetch(`/api/v1/admin/analytics/${report}?${query}`); if (!response.ok) throw new Error(report); const body: unknown = await response.json(); return [report, body] as const; })).then((entries) => { if (!active) return; const next: DashboardData = {}; for (const [report, body] of entries) { if (report === "overview") next.overview = read(overviewSchema, body); if (report === "timeseries") next.timeseries = read(timeseriesSchema, body); if (report === "acquisition") next.acquisition = read(acquisitionSchema, body); if (report === "behaviour") next.behaviour = read(behaviourSchema, body); if (report === "funnel") next.funnel = read(funnelSchema, body); if (report === "students") next.students = read(studentsSchema, body); if (report === "sales") next.sales = read(salesSchema, body); if (report === "devices") next.devices = read(dimensionsSchema, body); if (report === "countries") next.countries = read(dimensionsSchema, body); if (report === "realtime") next.realtime = read(realtimeSchema, body); } setData(next); }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; };
  }, [range, compare]);
  if (loading) return <div className="py-16 text-center text-ink-muted">Analitika ma'lumotlari yuklanmoqda…</div>;
  if (error || !data.overview) return <div className="rounded-2xl border border-border bg-bg-elevated p-8 text-center"><p className="font-semibold text-ink">Ma'lumotni vaqtincha ko‘rsatib bo‘lmaydi.</p><p className="mt-2 text-sm text-ink-muted">Keyinroq qayta urinib ko‘ring.</p></div>;
  const o = data.overview; const ts = data.timeseries; const funnel = data.funnel; const behaviour = data.behaviour; const students = data.students; const sales = data.sales; const acquisition = data.acquisition;
  return <div className="space-y-6"><div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-sunken p-4 sm:flex-row sm:items-end sm:justify-between"><div className="flex flex-wrap gap-2">{Object.entries(presets).map(([key, label]) => <button key={key} type="button" onClick={() => { setPreset(key as Preset); setCustom({ from: "", to: "" }); }} className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${preset === key ? "bg-brand text-white" : "bg-bg-elevated text-ink-muted"}`}>{label}</button>)}</div><div className="flex flex-wrap items-end gap-2"><label className="text-xs text-ink-muted">dan<input type="date" value={custom.from} onChange={(event) => setCustom((value) => ({ ...value, from: event.target.value }))} className="ml-1 rounded-lg border border-border bg-bg-elevated p-2 text-sm text-ink" /></label><label className="text-xs text-ink-muted">gacha<input type="date" value={custom.to} onChange={(event) => setCustom((value) => ({ ...value, to: event.target.value }))} className="ml-1 rounded-lg border border-border bg-bg-elevated p-2 text-sm text-ink" /></label><label className="flex min-h-11 items-center gap-2 text-sm text-ink"><input type="checkbox" checked={compare} onChange={(event) => setCompare(event.target.checked)} />Oldingi davr bilan solishtirish</label></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Tashrifchilar" value={o.visitors.current.toLocaleString("uz-UZ")} delta={o.visitors.deltaPercent} /><Stat label="Sessiya" value={o.sessions.current.toLocaleString("uz-UZ")} delta={o.sessions.deltaPercent} /><Stat label="Leadlar" value={o.leads.current.toLocaleString("uz-UZ")} delta={o.leads.deltaPercent} /><Stat label="Tushum" value={`${o.revenueUzs.current.toLocaleString("uz-UZ")} so‘m`} delta={o.revenueUzs.deltaPercent} /></div><div className="grid gap-6 lg:grid-cols-2"><Block title="Trafik trendi"><LineAreaChart title="Tashrifchilar trendi" data={ts?.points.map((point) => ({ label: new Date(point.timestamp).toLocaleDateString("uz-UZ"), value: point.value })) ?? []} /></Block><Block title="Sotuv vaqt bo‘ylab"><LineAreaChart title="Tushum trendi" data={(sales?.revenueByDay ?? []).map((point) => ({ label: point.date, value: point.revenueUzs }))} /></Block></div><div className="grid gap-6 lg:grid-cols-2"><Block title="Konversiya voronkasi">{funnel ? <FunnelChart title="Konversiya voronkasi" data={funnel.steps.map((step) => ({ label: step.label, value: step.count, percentage: step.conversionFromVisit }))} /> : <EmptyState />}</Block><Block title="Manbalar">{acquisition ? <BarChart title="Manbalar" data={acquisition.sources.slice(0, 8).map((item) => ({ label: item.source, value: item.visitors }))} /> : <EmptyState />}</Block></div><div className="grid gap-6 lg:grid-cols-2"><Block title="Kirish va chiqish sahifalari">{behaviour ? <PageList behaviour={behaviour} /> : <EmptyState />}</Block><Block title="Talabalar va darslar">{students ? <div className="space-y-3 text-sm text-ink-muted"><p><strong className="text-ink">{students.activeStudents}</strong> faol talaba · {students.newEnrollments} yangi enrollment</p><p>Uy vazifasi: {students.homeworkSubmissionRate.toFixed(1)}% · Qatnashuv: {students.cohortAttendanceRate.toFixed(1)}%</p><p className="text-xs">{students.attendanceDefinition}</p>{students.courses.length ? students.courses.map((course) => <div key={course.courseId} className="rounded-lg border border-border p-3"><div className="flex justify-between gap-3"><span className="font-semibold text-ink">{course.courseTitle}</span><span>{course.completionRate.toFixed(1)}%</span></div><p className="mt-1 text-xs">Dars tugashi: {course.dropOffLesson ?? "Ma’lumot yo‘q"}</p></div>) : <EmptyState />}</div> : <EmptyState />}</Block></div><Block title="Realtime"><p className="text-2xl font-semibold text-ink">{data.realtime?.activeVisitors ?? 0}</p><p className="text-sm text-ink-muted">Oxirgi 5 daqiqadagi faol tashrifchilar</p></Block></div>;
}
function EmptyState() { return <p className="rounded-xl border border-dashed border-border p-4 text-sm text-ink-muted">Ma'lumot yig‘ilmoqda — birinchi tashriflar kelishi bilan shu yerda ko‘rinadi.</p>; }
function PageList({ behaviour }: { behaviour: BehaviourResponse }) { return <div className="space-y-2 text-sm"><p><strong className="text-ink">O‘rtacha faol vaqt:</strong> {Math.round(behaviour.averageEngagedMs / 1000)} soniya · scroll {Math.round(behaviour.averageScrollDepth)}%</p>{behaviour.entryPages.slice(0, 3).map((page) => <div key={page.path} className="flex justify-between border-t border-border pt-2"><span className="text-ink">{page.path}</span><span className="text-ink-muted">{page.visitors}</span></div>)}<p className="pt-2 text-xs text-ink-subtle">Eng ko‘p tashlab ketilgan: {behaviour.exitPages[0]?.path ?? "ma’lumot yo‘q"}</p></div>; }
