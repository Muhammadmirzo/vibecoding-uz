import { DEFAULT_MOTION, parseMotionSettings, type MotionSettings } from "../domain/settings";

/**
 * Server-side reader for the motion configuration.
 *
 * W3B will back this with the `site_settings` "motion" row (jsonb,
 * Zod-validated, cached). Until then — and whenever the DB is down —
 * it fail-safes to DEFAULT_MOTION so pages never 500 on motion config.
 */
export async function getMotionSettings(): Promise<MotionSettings> {
  try {
    // W3B hook point: read + parse the stored row here.
    // const stored = await readSiteSetting("motion");
    // return parseMotionSettings(stored);
    return parseMotionSettings(DEFAULT_MOTION);
  } catch {
    return DEFAULT_MOTION;
  }
}
