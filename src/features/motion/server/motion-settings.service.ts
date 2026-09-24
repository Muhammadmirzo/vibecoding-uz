import { unstable_cache, revalidateTag } from "next/cache";
import { after } from "next/server";
import { motionSettingsRepository } from "./motion-settings.repository";
import { DEFAULT_MOTION, motionSettingsSchema, type MotionSettings } from "../domain/settings";

const MOTION_CACHE_KEY = "motion-settings";
const REFRESH_INTERVAL_MS = 300_000;
let currentMotionSettings = DEFAULT_MOTION;
let lastRefreshAttempt = 0;

function parseStored(value: unknown): MotionSettings {
  const result = motionSettingsSchema.safeParse(value);
  return result.success ? result.data : DEFAULT_MOTION;
}

const readCached = unstable_cache(
  async () => {
    try {
      return parseStored(await motionSettingsRepository.read());
    } catch {
      return DEFAULT_MOTION;
    }
  },
  [MOTION_CACHE_KEY],
  { tags: [MOTION_CACHE_KEY], revalidate: 300 },
);

/** Refreshes motion settings outside the request's blocking render path. */
export async function refreshMotionSettings(): Promise<MotionSettings> {
  try {
    currentMotionSettings = await readCached();
  } catch {
    currentMotionSettings = DEFAULT_MOTION;
  }
  lastRefreshAttempt = Date.now();
  return currentMotionSettings;
}

/**
 * Returns the last known settings immediately. The shared root layout never
 * waits for the unavailable database; refreshes run in Next's post-response
 * phase and keep the motion controls eventually consistent.
 */
export async function getMotionSettings(): Promise<MotionSettings> {
  if (Date.now() - lastRefreshAttempt >= REFRESH_INTERVAL_MS) {
    lastRefreshAttempt = Date.now();
    try {
      after(() => {
        void refreshMotionSettings();
      });
    } catch {
      // Unit tests and other non-request callers can refresh explicitly.
    }
  }
  return currentMotionSettings;
}

export async function updateMotionSettings(
  input: MotionSettings,
  context: { userId: string; ip: string },
): Promise<MotionSettings> {
  const settings = motionSettingsSchema.parse(input);
  await motionSettingsRepository.write(settings, context);
  currentMotionSettings = settings;
  lastRefreshAttempt = Date.now();
  revalidateTag(MOTION_CACHE_KEY);
  return settings;
}

export { MOTION_CACHE_KEY, parseStored };
