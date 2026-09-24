/**
 * Pure broadcast-audience policy (no I/O).
 * Maps a broadcast target audience to the counter the service must call.
 * The `fallback` kind preserves the legacy route behavior (estimate 15).
 */

export type AudienceKind =
  | { kind: "all_users" }
  | { kind: "active_students" }
  | { kind: "cohort_students"; cohortId: string }
  | { kind: "leads_new" }
  | { kind: "leads_consultation" }
  | { kind: "fallback" };

export const FALLBACK_RECIPIENT_COUNT = 15;

export function resolveAudience(targetAudience: string, cohortId?: string | null): AudienceKind {
  switch (targetAudience) {
    case "all_users":
      return { kind: "all_users" };
    case "active_students":
      return { kind: "active_students" };
    case "cohort_students":
      return cohortId ? { kind: "cohort_students", cohortId } : { kind: "fallback" };
    case "leads_new":
      return { kind: "leads_new" };
    case "leads_consultation":
      return { kind: "leads_consultation" };
    default:
      return { kind: "fallback" };
  }
}
