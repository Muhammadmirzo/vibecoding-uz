import { DEFAULT_MOTION, parseMotionSettings, type MotionSettings } from "../domain/settings";

/**
 * Server-side reader for the motion configuration.
 *
 * W3B will back this with the `site_settings` "motion" row (jsonb,
 * Zod-validated, cached). Until then — and whenever the DB is down —
 * it fail-safes to DEFAULT_MOTION so pages never 500 on motion config.
 */
export function getMotionSettings(): MotionSettings {
  // W3B replaces this synchronous default with its cached server reader.
  // Keeping the default synchronous in W3A prevents motion configuration
  // from accidentally opting every page into dynamic rendering.
  return parseMotionSettings(DEFAULT_MOTION);
}
