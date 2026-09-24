import { unstable_cache, revalidateTag } from "next/cache";
import { motionSettingsRepository } from "./motion-settings.repository";
import { DEFAULT_MOTION, motionSettingsSchema, type MotionSettings } from "../domain/settings";

const MOTION_CACHE_KEY = "motion-settings";
const READ_TIMEOUT_MS = 800;

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

export async function getMotionSettings(): Promise<MotionSettings> {
  try {
    return await Promise.race([
      readCached(),
      new Promise<MotionSettings>((resolve) => setTimeout(() => resolve(DEFAULT_MOTION), READ_TIMEOUT_MS)),
    ]);
  } catch {
    return DEFAULT_MOTION;
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
