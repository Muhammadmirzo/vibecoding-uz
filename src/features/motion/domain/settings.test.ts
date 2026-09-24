import { describe, expect, it } from "vitest";
import {
  DEFAULT_MOTION,
  motionSettingsSchema,
  parseMotionSettings,
  resolveMotionFlags,
} from "./settings";

describe("motionSettingsSchema", () => {
  it("accepts the default settings", () => {
    expect(motionSettingsSchema.safeParse(DEFAULT_MOTION).success).toBe(true);
  });

  it("rejects an unknown level", () => {
    expect(
      motionSettingsSchema.safeParse({ ...DEFAULT_MOTION, level: "cinematic" }).success,
    ).toBe(false);
  });

  it("rejects non-boolean flags", () => {
    expect(
      motionSettingsSchema.safeParse({ ...DEFAULT_MOTION, ambient: "yes" }).success,
    ).toBe(false);
  });
});

describe("parseMotionSettings", () => {
  it("falls back to DEFAULT_MOTION for null/undefined/garbage (DB down)", () => {
    expect(parseMotionSettings(null)).toEqual(DEFAULT_MOTION);
    expect(parseMotionSettings(undefined)).toEqual(DEFAULT_MOTION);
    expect(parseMotionSettings("oops")).toEqual(DEFAULT_MOTION);
    expect(parseMotionSettings({ level: "full" })).toEqual(DEFAULT_MOTION);
  });

  it("keeps a valid stored payload", () => {
    const stored = { ...DEFAULT_MOTION, level: "subtle" as const, ambient: false };
    expect(parseMotionSettings(stored)).toEqual(stored);
  });
});

describe("resolveMotionFlags", () => {
  it("kills everything when off", () => {
    expect(resolveMotionFlags({ ...DEFAULT_MOTION, level: "off" })).toEqual({
      heroIntro: false,
      scrollReveal: false,
      pointerEffects: false,
      ambient: false,
      pageTransitions: false,
    });
  });

  it("keeps reveals + micro-interactions but drops ambient/pointer/parallax when subtle", () => {
    expect(resolveMotionFlags({ ...DEFAULT_MOTION, level: "subtle" })).toEqual({
      heroIntro: true,
      scrollReveal: true,
      pointerEffects: false,
      ambient: false,
      pageTransitions: false,
    });
  });

  it("passes flags through when full", () => {
    expect(resolveMotionFlags(DEFAULT_MOTION)).toEqual({
      heroIntro: true,
      scrollReveal: true,
      pointerEffects: true,
      ambient: true,
      pageTransitions: true,
    });
  });
});
