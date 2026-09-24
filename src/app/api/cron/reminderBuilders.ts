/**
 * Backwards-compatible re-exports. Pure drip-unlock math now lives in
 * `src/features/crm/server/reminders.service.ts`.
 */
export {
  DAY_MS, findRecentDripUnlocks, resolveUnlockDate, wasUnlockedRecently,
} from "@/features/crm/server/reminders.service";
