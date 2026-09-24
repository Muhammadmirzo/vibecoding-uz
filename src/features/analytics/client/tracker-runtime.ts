export function privacyTrackingDisabled(navigatorValue: { doNotTrack: string | null; globalPrivacyControl?: boolean }): boolean {
  return navigatorValue.doNotTrack === "1" || navigatorValue.globalPrivacyControl === true;
}

export function sendAnalyticsPayload(payload: string, beacon: ((url: string, data: Blob) => boolean) | null): void {
  if (beacon) {
    beacon("/api/v1/events", new Blob([payload], { type: "text/plain" }));
    return;
  }
  void fetch("/api/v1/events", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  });
}
