import { unstable_cache, revalidateTag } from "next/cache";
import { motionSettingsRepository } from "./motion-settings.repository";
import { DEFAULT_MOTION, motionSettingsSchema, type MotionSettings } from "../domain/settings";

const MOTION_CACHE_KEY = "motion-settings";
// A warm Data Cache hit returns in ~1 ms; only a cold miss touches the DB.
// Never let a slow/down DB hold the root layout longer than this.
const READ_TIMEOUT_MS = 300;

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

/** Reads the cached settings (DB on cache miss); never throws. */
export async function refreshMotionSettings(): Promise<MotionSettings> {
  try {
    return await readCached();
  } catch {
    return DEFAULT_MOTION;
  }
}

/**
 * Shared-cache read (consistent across serverless instances — an admin
 * "off" applies everywhere after revalidateTag), bounded by READ_TIMEOUT_MS.
 */
export async function getMotionSettings(): Promise<MotionSettings> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      refreshMotionSettings(),
      new Promise<MotionSettings>((resolve) => {
        timer = setTimeout(() => resolve(DEFAULT_MOTION), READ_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function updateMotionSettings(
  input: MotionSettings,
  context: { userId: string; ip: string },
): Promise<MotionSettings> {
  const settings = motionSettingsSchema.parse(input);
  await motionSettingsRepository.write(settings, context);
  revalidateTag(MOTION_CACHE_KEY);
  return settings;
}

export { MOTION_CACHE_KEY, parseStored };
