import type { AcquisitionReport, AnalyticsRange, BehaviourReport, FunnelReport } from "../domain/report-types";
import { analyticsCacheKey, cachedAnalytics } from "./analytics-cache";
import type { AnalyticsRepository } from "./analytics.repository";

export async function getAcquisition(repository: AnalyticsRepository, range: AnalyticsRange): Promise<AcquisitionReport> {
  return cachedAnalytics(analyticsCacheKey("acquisition", range), async () => {
    const [sources, campaigns, landingPages] = await Promise.all([
      repository.sources(range), repository.campaigns(range), repository.landingPages(range),
    ]);
    const leader = sources[0];
    return { sources, campaigns, landingPages, summary: leader ? `Eng ko'p tashrif ${leader.source} manbasidan keldi va ${leader.visitors} tashrifchi kiritdi.` : "Hozircha manba ma'lumotlari yetarli emas." };
  });
}

export async function getBehaviour(repository: AnalyticsRepository, range: AnalyticsRange): Promise<BehaviourReport> {
  return cachedAnalytics(analyticsCacheKey("behaviour", range), async () => {
    const data = await repository.behaviour(range);
    const exit = data.exitPages[0];
    return {
      ...data,
      summary: `O'rtacha faol vaqt ${Math.round(data.averageEngagedMs / 1000)} soniya, o'rtacha scroll ${Math.round(data.averageScrollDepth)}% bo'ldi${exit ? `; eng ko'p tashlab ketilgan sahifa ${exit.path}.` : "."}`,
    };
  });
}

export async function getFunnel(repository: AnalyticsRepository, range: AnalyticsRange): Promise<FunnelReport> {
  return cachedAnalytics(analyticsCacheKey("funnel", range), async () => {
    const raw = await repository.funnel(range);
    const visit = raw[0]?.count ?? 0;
    const steps = raw.map((step, index) => ({
      ...step,
      conversionFromPrevious: index === 0 ? 100 : raw[index - 1].count > 0 ? (step.count / raw[index - 1].count) * 100 : 0,
      conversionFromVisit: visit > 0 ? (step.count / visit) * 100 : 0,
    }));
    const paid = steps[steps.length - 1]?.count ?? 0;
    return { steps, summary: `${visit} tashrifdan ${paid} to'lovgacha yetib bordi${visit ? ` (${((paid / visit) * 100).toFixed(1)}%).` : "."}` };
  });
}
