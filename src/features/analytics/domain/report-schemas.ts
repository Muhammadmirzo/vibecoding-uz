import { z } from "zod";

const metric = z.object({ current: z.number(), previous: z.number(), deltaPercent: z.number().nullable() });
const source = z.object({ source: z.string(), visitors: z.number(), leads: z.number(), conversionRate: z.number() });
const campaign = z.object({ campaign: z.string(), visitors: z.number(), leads: z.number(), revenueUzs: z.number() });
const landing = z.object({ path: z.string(), visitors: z.number(), leads: z.number(), conversionRate: z.number() });
const page = z.object({ path: z.string(), views: z.number(), visitors: z.number(), exits: z.number(), exitRate: z.number(), averageEngagedMs: z.number(), averageScrollDepth: z.number() });
const funnelStep = z.object({ key: z.string(), label: z.string(), count: z.number(), conversionFromPrevious: z.number(), conversionFromVisit: z.number() });

export const overviewSchema = z.object({ visitors: metric, sessions: metric, pageViews: metric, leads: metric, signups: metric, payingCustomers: metric, revenueUzs: metric, visitToLeadRate: metric, leadToSignupRate: metric, checkoutToPaidRate: metric, summary: z.string() });
export const timeseriesSchema = z.object({ metric: z.enum(["visitors", "sessions", "page_views", "leads", "signups", "paying_customers", "revenue_uzs"]), granularity: z.enum(["day", "week"]), points: z.array(z.object({ timestamp: z.string(), value: z.number() })), summary: z.string() });
export const acquisitionSchema = z.object({ sources: z.array(source), campaigns: z.array(campaign), landingPages: z.array(landing), summary: z.string() });
export const behaviourSchema = z.object({ topPages: z.array(page), entryPages: z.array(page), exitPages: z.array(page), averageEngagedMs: z.number(), averageScrollDepth: z.number(), summary: z.string() });
export const funnelSchema = z.object({ steps: z.array(funnelStep), summary: z.string() });
const course = z.object({ courseId: z.string(), courseTitle: z.string(), started: z.number(), completed: z.number(), completionRate: z.number(), dropOffLesson: z.string().nullable(), dropOffCount: z.number() });
export const studentsSchema = z.object({ activeStudents: z.number(), newEnrollments: z.number(), courses: z.array(course), homeworkSubmissionRate: z.number(), cohortAttendanceRate: z.number(), attendanceDefinition: z.string(), summary: z.string() });
const salesDay = z.object({ date: z.string(), revenueUzs: z.number(), orders: z.number() });
const courseSales = z.object({ courseId: z.string(), courseTitle: z.string(), revenueUzs: z.number(), orders: z.number() });
export const salesSchema = z.object({ revenueByDay: z.array(salesDay), revenueByCourse: z.array(courseSales), averageOrderUzs: z.number(), refundsCount: z.number(), refundsUzs: z.number(), topReferrers: z.array(source), summary: z.string() });
export const dimensionsSchema = z.object({ dimension: z.enum(["device", "country"]), rows: z.array(z.object({ name: z.string(), count: z.number() })), summary: z.string() });
export const realtimeSchema = z.object({ activeVisitors: z.number(), windowMinutes: z.literal(5), summary: z.string() });

export type OverviewResponse = z.infer<typeof overviewSchema>;
export type TimeseriesResponse = z.infer<typeof timeseriesSchema>;
export type AcquisitionResponse = z.infer<typeof acquisitionSchema>;
export type BehaviourResponse = z.infer<typeof behaviourSchema>;
export type FunnelResponse = z.infer<typeof funnelSchema>;
export type StudentsResponse = z.infer<typeof studentsSchema>;
export type SalesResponse = z.infer<typeof salesSchema>;
export type DimensionsResponse = z.infer<typeof dimensionsSchema>;
export type RealtimeResponse = z.infer<typeof realtimeSchema>;
