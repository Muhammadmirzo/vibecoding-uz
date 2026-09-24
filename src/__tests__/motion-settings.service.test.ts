import { beforeEach, describe, expect, it, vi } from "vitest";

const { read, write } = vi.hoisted(() => ({ read: vi.fn(), write: vi.fn() }));
vi.mock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn, revalidateTag: vi.fn() }));
vi.mock( "@/features/motion/server/motion-settings.repository", () => ({ motionSettingsRepository: { read, write } }));

import { DEFAULT_MOTION } from "@/features/motion/domain/settings";
import { parseStored, refreshMotionSettings } from  "@/features/motion/server/motion-settings.service";

describe("motion settings service", () => {
  beforeEach(() => { read.mockReset(); write.mockReset(); });
  it("returns valid stored settings", async () => {
    read.mockResolvedValue({ level: "subtle", heroIntro: false, scrollReveal: true, pointerEffects: true, ambient: true, pageTransitions: true });
    await expect(refreshMotionSettings()).resolves.toMatchObject({ level: "subtle", heroIntro: false });
  });
  it("drops invalid stored JSON to defaults", () => {
    expect(parseStored({ level: "subtle", extra: true })).toEqual(DEFAULT_MOTION);
  });
  it("returns defaults when the database throws", async () => {
    read.mockRejectedValue(new Error("database offline"));
    await expect(refreshMotionSettings()).resolves.toEqual(DEFAULT_MOTION);
  });
});
