import { z } from "zod";

export const analyticsGranularitySchema = z.enum(["day", "week"]);
export const analyticsMetricSchema = z.enum([
  "visitors", "sessions", "page_views", "leads", "signups", "paying_customers", "revenue_uzs",
]);
export const analyticsReportSchema = z.enum([
  "overview", "timeseries", "acquisition", "behaviour", "funnel", "students", "sales", "devices", "countries", "realtime",
]);

export const analyticsRangeSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  granularity: analyticsGranularitySchema.optional(),
  metric: analyticsMetricSchema.optional(),
  compare: z.boolean().default(true),
}).superRefine((value, context) => {
  if (value.from > value.to) context.addIssue({ code: "custom", message: "Boshlanish sanasi tugash sanasidan keyin bo'lishi mumkin emas" });
  if (value.to.getTime() - value.from.getTime() > 366 * 86_400_000) {
    context.addIssue({ code: "custom", message: "Analitika diapazoni bir yildan oshmasligi kerak" });
  }
});

export type AnalyticsRange = z.infer<typeof analyticsRangeSchema>;
export type AnalyticsReport = z.infer<typeof analyticsReportSchema>;
export type AnalyticsMetric = z.infer<typeof analyticsMetricSchema>;

export interface MetricDelta { current: number; previous: number; deltaPercent: number | null }
export interface OverviewData {
  visitors: MetricDelta; sessions: MetricDelta; pageViews: MetricDelta; leads: MetricDelta;
  signups: MetricDelta; payingCustomers: MetricDelta; revenueUzs: MetricDelta;
  visitToLeadRate: MetricDelta; leadToSignupRate: MetricDelta; checkoutToPaidRate: MetricDelta;
}
export interface OverviewReport extends OverviewData { summary: string }

export interface TimeseriesPoint { timestamp: string; value: number }
export interface TimeseriesReport { metric: AnalyticsMetric; granularity: "day" | "week"; points: TimeseriesPoint[]; summary: string }

export interface SourceRow { source: string; visitors: number; leads: number; conversionRate: number }
export interface CampaignRow { campaign: string; visitors: number; leads: number; revenueUzs: number }
export interface LandingRow { path: string; visitors: number; leads: number; conversionRate: number }
export interface AcquisitionReport { sources: SourceRow[]; campaigns: CampaignRow[]; landingPages: LandingRow[]; summary: string }

export interface PageRow { path: string; views: number; visitors: number; exits: number; exitRate: number; averageEngagedMs: number; averageScrollDepth: number }
export interface BehaviourReport { topPages: PageRow[]; entryPages: PageRow[]; exitPages: PageRow[]; averageEngagedMs: number; averageScrollDepth: number; summary: string }

export interface FunnelStep { key: string; label: string; count: number; conversionFromPrevious: number; conversionFromVisit: number }
export interface FunnelReport { steps: FunnelStep[]; summary: string }

export interface CourseLearningRow { courseId: string; courseTitle: string; started: number; completed: number; completionRate: number; dropOffLesson: string | null; dropOffCount: number }
export interface StudentsReport {
  activeStudents: number; newEnrollments: number; courses: CourseLearningRow[];
  homeworkSubmissionRate: number; cohortAttendanceRate: number; attendanceDefinition: string; summary: string;
}
export interface SalesRow { date: string; revenueUzs: number; orders: number }
export interface CourseSalesRow { courseId: string; courseTitle: string; revenueUzs: number; orders: number }
export interface SalesReport {
  revenueByDay: SalesRow[]; revenueByCourse: CourseSalesRow[]; averageOrderUzs: number;
  refundsCount: number; refundsUzs: number; topReferrers: SourceRow[]; summary: string;
}
export interface DimensionRow { name: string; count: number }
export interface DimensionsReport { dimension: "device" | "country"; rows: DimensionRow[]; summary: string }
export interface RealtimeReport { activeVisitors: number; windowMinutes: 5; summary: string }
