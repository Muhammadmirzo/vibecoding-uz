import type { AnalyticsDevice, AnalyticsEventInput } from "../contracts";
import { privacyTrackingDisabled, sendAnalyticsPayload } from "./tracker-runtime";

const SESSION_KEY = "vibe_analytics_session";
const UTM_KEY = "vibe_analytics_utm";

type Utms = Partial<Record<"utm_source" | "utm_medium" | "utm_campaign" | "utm_term" | "utm_content", string>>;
type DraftType = "page_view" | "page_leave" | "cta_click";
type EventDraft = { type: DraftType; path: string; props: Record<string, unknown> };

let sessionId = "";
let utms: Utms = {};
let engagedMs = 0;
let visibleAt = 0;
let maxScroll = 0;
let leaveSent = false;


function storageGet(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}

function storageSet(key: string, value: string): void {
  try { sessionStorage.setItem(key, value); } catch { /* Storage may be disabled. */ }
}

function captureUtms(): void {
  const current = new URLSearchParams(location.search);
  const captured: Utms = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const) {
    const value = current.get(key);
    if (value) captured[key] = value.slice(0, 256);
  }
  if (Object.keys(captured).length) storageSet(UTM_KEY, JSON.stringify(captured));
  else utms = JSON.parse(storageGet(UTM_KEY) ?? "{}") as Utms;
}

function readSession(): string {
  const stored = storageGet(SESSION_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { id: string; lastActivity: number };
      if (typeof parsed.id === "string" && Date.now() - parsed.lastActivity < 1_800_000) { storageSet(SESSION_KEY, JSON.stringify({ id: parsed.id, lastActivity: Date.now() })); return parsed.id; }
    } catch { /* Replace malformed storage. */ }
  }
  const id = crypto.randomUUID();
  storageSet(SESSION_KEY, JSON.stringify({ id, lastActivity: Date.now() }));
  return id;
}

function browserFamily(): string {
  const ua = navigator.userAgent;
  if (/Edg\//.test(ua)) return "Edge";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Safari\//.test(ua)) return "Safari";
  return "Other";
}

function referrerHost(): string | null {
  try { return new URL(document.referrer).host; } catch { return null; }
}

function makeEvent(draft: EventDraft): AnalyticsEventInput {
  const width = Math.max(screen.width, navigator.maxTouchPoints * 640);
  const device: AnalyticsDevice = width < 768 ? "mobile" : width < 1_024 ? "tablet" : "desktop";
  const base = {
    eventId: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    sessionId,
    path: draft.path.slice(0, 2_048),
    referrerHost: referrerHost(),
    ...utms,
    device,
    browserFamily: browserFamily(),
  };
  switch (draft.type) {
    case "page_leave": return { ...base, type: draft.type, props: { engagedMs, scrollDepth: maxScroll } };
    case "cta_click": return { ...base, type: draft.type, props: draft.props as { id: string } };
    case "page_view": return { ...base, type: draft.type, props: {} };
  }
}

function send(events: EventDraft[], beacon = false): void {
  const payload = JSON.stringify({ events: events.map(makeEvent) });
  sendAnalyticsPayload(payload, beacon ? navigator.sendBeacon.bind(navigator) : null);
}

function enqueue(type: DraftType, props: Record<string, unknown>): void {
  sessionId = readSession();
  send([{ type, path: location.pathname, props }]);
}

function trackScroll(): void {
  const height = document.documentElement.scrollHeight - innerHeight;
  maxScroll = Math.max(maxScroll, height > 0 ? Math.round((scrollY / height) * 100) : 100);
}

function pauseEngagement(): void {
  if (!visibleAt) return;
  engagedMs += Date.now() - visibleAt;
  visibleAt = 0;
}

function leavePage(useBeacon: boolean): void {
  if (leaveSent) return;
  pauseEngagement();
  leaveSent = true;
  send([{ type: "page_leave", path: location.pathname, props: {} }], useBeacon);
}

function viewPage(): void {
  engagedMs = 0;
  maxScroll = 0;
  leaveSent = false;
  enqueue("page_view", {});
}

function onVisibility(): void {
  if (document.visibilityState === "hidden") leavePage(true);
  else { visibleAt = Date.now(); leaveSent = false; }
}

function onClick(event: MouseEvent): void {
  if (!(event.target instanceof Element)) return;
  const cta = event.target.closest<HTMLElement>("[data-track]");
  if (cta?.dataset.track) enqueue("cta_click", { id: cta.dataset.track });
}

function patchHistory(): void {
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method];
    history[method] = function analyticsHistory(...args: Parameters<History["pushState"]>) {
      const result = original.apply(this, args);
      leavePage(true);
      viewPage();
      return result;
    };
  }
}

export function startAnalyticsTracker(): void {
  if (privacyTrackingDisabled({ doNotTrack: navigator.doNotTrack, globalPrivacyControl: Reflect.get(navigator, "globalPrivacyControl") === true })) return;
  captureUtms();
  sessionId = readSession();
  visibleAt = Date.now();
  patchHistory();
  viewPage();
  addEventListener("scroll", trackScroll, { passive: true });
  addEventListener("click", onClick, { passive: true });
  addEventListener("popstate", () => { leavePage(true); viewPage(); });
  addEventListener("pagehide", () => leavePage(true), { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
}
