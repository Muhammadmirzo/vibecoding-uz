import { z } from "zod";

/**
 * Naqsh motion settings contract (PLAN §3).
 *
 * `level` is the global master switch. Individual flags let the admin
 * (W3B) toggle choreography slices without touching the master level:
 * - `subtle` = reveals + micro-interactions only (no ambient/pointer/parallax),
 *   enforced in CSS + hooks regardless of the flags below.
 * - `prefers-reduced-motion: reduce` always wins (forces `off` in CSS).
 */

export const motionLevelSchema = z.enum(["off", "subtle", "full"]);
export type MotionLevel = z.infer<typeof motionLevelSchema>;

export const motionSettingsSchema = z.object({
  level: motionLevelSchema,
  heroIntro: z.boolean(),
  scrollReveal: z.boolean(),
  pointerEffects: z.boolean(),
  ambient: z.boolean(),
  pageTransitions: z.boolean(),
});

export type MotionSettings = z.infer<typeof motionSettingsSchema>;

export const DEFAULT_MOTION: MotionSettings = {
  level: "full",
  heroIntro: true,
  scrollReveal: true,
  pointerEffects: true,
  ambient: true,
  pageTransitions: true,
};

/**
 * Parse unknown input (e.g. the `site_settings` "motion" row) with a
 * fail-safe to DEFAULT_MOTION when the DB is down or the payload is bad.
 * Never throws.
 */
export function parseMotionSettings(value: unknown): MotionSettings {
  const parsed = motionSettingsSchema.safeParse(value);
  if (!parsed.success) return DEFAULT_MOTION;
  return parsed.data;
}

export interface EffectiveMotionFlags {
  heroIntro: boolean;
  scrollReveal: boolean;
  pointerEffects: boolean;
  ambient: boolean;
  pageTransitions: boolean;
}

/**
 * Resolve the master level + flags into the effective behaviour.
 * Pure — unit-tested, no I/O.
 */
export function resolveMotionFlags(settings: MotionSettings): EffectiveMotionFlags {
  if (settings.level === "off") {
    return { heroIntro: false, scrollReveal: false, pointerEffects: false, ambient: false, pageTransitions: false };
  }
  if (settings.level === "subtle") {
    return {
      heroIntro: settings.heroIntro,
      scrollReveal: settings.scrollReveal,
      pointerEffects: false,
      ambient: false,
      pageTransitions: false,
    };
  }
  return {
    heroIntro: settings.heroIntro,
    scrollReveal: settings.scrollReveal,
    pointerEffects: settings.pointerEffects,
    ambient: settings.ambient,
    pageTransitions: settings.pageTransitions,
  };
}
