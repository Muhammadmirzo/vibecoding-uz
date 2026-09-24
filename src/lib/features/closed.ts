/**
 * Closed-features registry (W10 owner decision 2026-09-24).
 *
 * "Closed" means hidden and unreachable but reversible: the code, pages and
 * tests stay in the repo. To reopen any feature, flip its `closed` flag to
 * `false` — nav, sitemap, layouts and API guards all read this one file.
 *
 * - `routes`: public page prefixes that must 404 (see `isClosedRoute`).
 * - `apis`: API prefixes that must 404 (see `isClosedApi`).
 */
export type ClosedFeatureKey = "jobs" | "testimonials" | "spinWheel" | "adminFeatureFlags";

export interface ClosedFeature {
  closed: boolean;
  routes: string[];
  apis: string[];
  note: string;
}

export const CLOSED_FEATURES: Record<ClosedFeatureKey, ClosedFeature> = {
  jobs: {
    closed: true,
    routes: ["/ish"],
    apis: ["/api/ish"],
    note: "Ish o'rinlari sahifalari va ariza API. Kod: src/app/ish, src/app/api/ish, src/features/jobs.",
  },
  testimonials: {
    closed: true,
    routes: ["/testimoniyalar"],
    apis: [],
    note: "Namunaviy fikrlar sahifasi. Kod: src/app/testimoniyalar, src/features/testimonials.",
  },
  spinWheel: {
    closed: true,
    routes: [],
    apis: [],
    note: "SpinWheel orolchasi hech qayerda render qilinmaydi. Fayl saqlanadi: src/components/ui/SpinWheel.tsx.",
  },
  adminFeatureFlags: {
    closed: true,
    routes: [],
    apis: [],
    note: "Sozlamalardagi Funksiyalar tabidagi kalitlar hech qanday funksiyani boshqarmaydi; tab yashirilgan.",
  },
};

export function isClosed(key: ClosedFeatureKey): boolean {
  return CLOSED_FEATURES[key].closed;
}

/** Public page prefixes that are currently closed (for nav, sitemap, search). */
export function closedRoutePrefixes(): string[] {
  return Object.values(CLOSED_FEATURES).flatMap((feature) => (feature.closed ? feature.routes : []));
}

/** API prefixes that are currently closed (for route guards). */
export function closedApiPrefixes(): string[] {
  return Object.values(CLOSED_FEATURES).flatMap((feature) => (feature.closed ? feature.apis : []));
}

function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/** True when a public page path belongs to a closed feature. */
export function isClosedRoute(path: string): boolean {
  return matchesPrefix(path, closedRoutePrefixes());
}

/** True when an API path belongs to a closed feature. */
export function isClosedApi(path: string): boolean {
  return matchesPrefix(path, closedApiPrefixes());
}
