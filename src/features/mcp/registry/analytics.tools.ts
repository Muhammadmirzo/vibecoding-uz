import { z } from "zod";
import { drizzleAnalyticsRepository } from "@/features/analytics/server/analytics.repository";
import { getAnalyticsReport } from "@/features/analytics/server/analytics.service";
import { dateRangeInputSchema, dateRangeShape } from "../contracts";
import { result, toolError, type ToolDefinition, type ToolContext } from "./types";
import { svgFor, toToolResult, visualForAnalytics } from "./visual";

const metrics = z.enum(["visitors", "sessions", "page_views", "leads", "signups", "paying_customers", "revenue_uzs"]);
function range(value: unknown) { const parsed = dateRangeInputSchema.parse(value); return { from: new Date(parsed.from), to: new Date(parsed.to), granularity: parsed.granularity, compare: true }; }
function makeAnalytics(name: string, title: string, report: string, ui: "line" | "bar" | "funnel" | "table" | "kpi" | "dashboard", description: string): ToolDefinition { return { name, title, description, scope: "analytics:read", readOnly: true, destructive: false, ui, inputShape: dateRangeShape, handler: async (input, _context: ToolContext) => { try { const data = await getAnalyticsReport(drizzleAnalyticsRepository, report, range(input)); const payload = visualForAnalytics(report, data, range(input)); return { result: toToolResult(payload), title, imageSvg: svgFor(payload, title) }; } catch (error) { return toolError(error, title); } } }; }

export const analyticsTools: ToolDefinition[] = [
  makeAnalytics("analytics_overview", "Umumiy analitika", "overview", "dashboard", "Tashrif, lead, ro'yxat va tushum KPI'lari."),
  makeAnalytics("analytics_timeseries", "Vaqt seriyasi", "timeseries", "line", "Kunlik yoki haftalik trend. Metric argumenti bilan tanlanadi."),
  makeAnalytics("analytics_acquisition", "Trafik manbalari", "acquisition", "bar", "UTM, referrer va landing page manbalari."),
  makeAnalytics("analytics_behaviour", "Sayt xulqi", "behaviour", "table", "Kirish, chiqish va sahifada faollik."),
  makeAnalytics("analytics_funnel", "Savdo vodonasi", "funnel", "funnel", "Tashrifdan to'lovgacha konversiya bosqichlari."),
  makeAnalytics("analytics_realtime", "Real vaqt", "realtime", "kpi", "Oxirgi 5 daqiqadagi faol tashrifchilar."),
];

export const analyticsTimeseriesTool: ToolDefinition = { name: "analytics_timeseries", title: "Vaqt seriyasi", description: "Kunlik yoki haftalik trend. Metric argumenti bilan tanlanadi.", scope: "analytics:read", readOnly: true, destructive: false, ui: "line", inputShape: { ...dateRangeShape, metric: metrics.default("visitors") }, handler: async (input) => { try { const value = dateRangeInputSchema.parse(input); const selected = metrics.parse(input && typeof input === "object" && "metric" in input ? input.metric : "visitors"); const data = await getAnalyticsReport(drizzleAnalyticsRepository, "timeseries", { from: new Date(value.from), to: new Date(value.to), granularity: value.granularity, metric: selected, compare: true }); const payload = visualForAnalytics("timeseries", data, { from: new Date(value.from), to: new Date(value.to), granularity: value.granularity, compare: true }); return { result: toToolResult(payload), title: "Vaqt seriyasi", imageSvg: svgFor(payload, "Vaqt seriyasi") }; } catch (error) { return toolError(error, "Vaqt seriyasi"); } } };
