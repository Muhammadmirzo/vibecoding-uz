import { createHash, randomUUID } from "node:crypto";
import type { AnalyticsEventInput } from "../contracts";
import type { AnalyticsEventRepository } from "./event.repository";

const BOT_MARKERS = [
  "bot", "crawler", "spider", "slurp", "headless", "phantomjs", "puppeteer",
  "playwright", "selenium", "curl", "wget", "python-requests", "httpclient",
] as const;

export function isAnalyticsBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  const normalized = userAgent.toLowerCase();
  return BOT_MARKERS.some((marker) => normalized.includes(marker));
}

export function hashVisitorToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface IngestionContext {
  visitorToken: string;
  country: string | null;
}

export interface IngestionDependencies {
  repository: AnalyticsEventRepository;
  now?: () => Date;
}

export async function ingestAnalyticsBatch(
  events: AnalyticsEventInput[],
  context: IngestionContext,
  dependencies: IngestionDependencies,
): Promise<number> {
  const visitorHash = hashVisitorToken(context.visitorToken);
  const rows = events.map((event) => ({
    occurredAt: new Date(event.occurredAt),
    eventId: event.eventId,
    visitorHash,
    sessionId: event.sessionId,
    userId: event.userId ?? null,
    type: event.type,
    path: event.path,
    referrerHost: event.referrerHost ?? null,
    utmSource: event.utmSource ?? null,
    utmMedium: event.utmMedium ?? null,
    utmCampaign: event.utmCampaign ?? null,
    utmTerm: event.utmTerm ?? null,
    utmContent: event.utmContent ?? null,
    device: event.device,
    browserFamily: event.browserFamily,
    country: context.country,
    props: event.props,
    valueUzs: event.valueUzs ?? null,
  }));
  return dependencies.repository.insertMany(rows);
}

export function createVisitorToken(): string {
  return randomUUID();
}
