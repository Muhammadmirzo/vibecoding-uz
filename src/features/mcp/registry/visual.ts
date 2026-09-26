import type { ToolResultData } from "../contracts";
import type { AnalyticsRange } from "@/features/analytics/domain/report-types";

function record(value: unknown): Record<string, unknown> { return value && typeof value === "object" && !Array.isArray(value) ? Object.fromEntries(Object.entries(value)) : {}; }
export interface VisualPayload { summary: string; data: unknown; markdown: string; chartSpec: Record<string, unknown> | null; nextCursor: string | null }
type Point = { label: string; value: number };

function points(rows: unknown[], labelKey: string, valueKey: string): Point[] { return rows.slice(0, 50).map((row) => { const item = record(row); const raw = item[valueKey]; return { label: String(item[labelKey] ?? ""), value: typeof raw === "number" ? raw : Number(raw ?? 0) }; }); }
function markdown(title: string, rows: Point[]): string { return [`**${title}**`, "", "| Davr | Qiymat |", "| --- | ---: |", ...rows.map((row) => `| ${row.label.replaceAll("|", "\\|")} | ${row.value.toLocaleString("uz-UZ")} |`)].join("\n"); }
function vega(type: "line" | "bar", rows: Point[]): Record<string, unknown> { return { $schema: "https://vega.github.io/schema/vega-lite/v5.json", description: "Naqsh analitikasi", data: { values: rows }, mark: type === "line" ? { type: "line", point: true, color: "steelblue" } : { type: "bar", color: "teal" }, encoding: { x: { field: "label", type: "nominal", title: "Davr" }, y: { field: "value", type: "quantitative", title: "Qiymat" } }, width: "container", height: 260, autosize: { type: "fit", contains: "padding" } }; }
function kpiSpec(data: Record<string, unknown>): Record<string, unknown> { return { $schema: "https://vega.github.io/schema/vega-lite/v5.json", data: { values: Object.entries(data).map(([label, value]) => ({ label, value: typeof value === "number" ? value : Number(value ?? 0) })) }, mark: { type: "bar" }, encoding: { x: { field: "label", type: "nominal" }, y: { field: "value", type: "quantitative" } } }; }
function tableSpec(data: unknown): Record<string, unknown> { return { $schema: "https://vega.github.io/schema/vega-lite/v5.json", data: { values: Array.isArray(data) ? data : [] }, mark: { type: "table" }, encoding: { columns: Object.keys(record(data)).map((key) => ({ field: key, type: "nominal" })) } }; }

export function visualForAnalytics(report: string, data: unknown, range: AnalyticsRange): VisualPayload {
  const object = record(data);
  const summary = String(object.summary ?? "Analitika ma'lumotlari tayyor.");
  const result: VisualPayload = { summary, data, markdown: "", chartSpec: null, nextCursor: null };
  if (report === "timeseries" && Array.isArray(object.points)) {
    const rows = points(object.points, "timestamp", "value"); result.markdown = markdown("Vaqt seriyasi", rows); result.chartSpec = vega("line", rows);
  } else if (report === "acquisition" && Array.isArray(object.sources)) {
    const rows = points(object.sources, "source", "visitors"); result.markdown = markdown("Trafik manbalari", rows); result.chartSpec = vega("bar", rows);
  } else if (report === "funnel" && Array.isArray(object.steps)) {
    const rows = points(object.steps, "label", "count"); result.markdown = markdown("Savdo vodonasi", rows); result.chartSpec = vega("bar", rows);
  } else if (report === "behaviour") {
    const rows = Array.isArray(object.exitPages) ? points(object.exitPages, "path", "exits") : []; result.markdown = markdown("Chiqish sahifalari", rows); result.chartSpec = tableSpec(object.exitPages);
  } else { result.chartSpec = kpiSpec({ visitors: numberOf(object.visitors), leads: numberOf(object.leads), revenueUzs: numberOf(object.revenueUzs), activeVisitors: numberOf(object.activeVisitors) }); result.markdown = `**${summary}**\n\n- ${range.from.toISOString().slice(0, 10)} — ${range.to.toISOString().slice(0, 10)}`; }
  return result;
}
function numberOf(value: unknown): number { return typeof value === "number" ? value : Number((value && typeof value === "object" ? record(value).current : value) ?? 0); }
export function toToolResult(payload: VisualPayload): ToolResultData { return { summary: payload.summary, data: payload.data, markdown: payload.markdown, chartSpec: payload.chartSpec, nextCursor: payload.nextCursor }; }
export function svgFor(payload: VisualPayload, title: string): string { const data = record(payload.data); const values = Array.isArray(data.points) ? points(data.points, "timestamp", "value") : Array.isArray(data.steps) ? points(data.steps, "label", "count") : []; const max = Math.max(1, ...values.map((item) => item.value)); const bars = values.slice(0, 24).map((item, index, all) => { const width = 640 / Math.max(1, all.length); const height = item.value / max * 180; return `<rect x="${index * width + 3}" y="${210 - height}" width="${Math.max(2, width - 6)}" height="${height}" fill="currentColor" opacity="0.72"><title>${escapeXml(item.label)}: ${item.value}</title></rect>`; }).join(""); return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 240" role="img" aria-label="${escapeXml(title)}"><rect width="640" height="240" rx="16" fill="none" stroke="currentColor" opacity=".2"/>${bars}<text x="20" y="28" fill="currentColor" font-family="system-ui" font-size="15">${escapeXml(title)}</text></svg>`; }
function escapeXml(value: string): string { return value.replace(/[<>&]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[char] ?? char); }
