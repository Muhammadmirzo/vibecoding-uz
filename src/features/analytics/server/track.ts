/** Stable server analytics hook. W8A owns persistence; W7 calls this safely. */
export interface ServerAnalyticsEvent {
  type: string;
  path?: string;
  userId?: string | null;
  valueUzs?: number | null;
  props?: Record<string, string | number | boolean | null>;
}
export async function trackServerEvent(_event: ServerAnalyticsEvent): Promise<void> {
  // Intentionally no-op until the analytics repository is merged.
}
