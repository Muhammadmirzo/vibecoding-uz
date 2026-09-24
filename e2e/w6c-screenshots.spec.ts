import { expect, test, type Page } from "@playwright/test";

/**
 * W6C visual review sweep (NOT a gate — responsive/visibility are the gate).
 * Captures scrolled viewport frames (not full-page) at 390 + 1440, light +
 * dark, named e2e/screenshots/w6c-<route>-<width>-<theme>-<n>.png.
 * Screenshots dir is gitignored; review locally, then delete the spec run.
 */

interface Shot {
  route: string;
  name: string;
  /** scroll fractions of (scrollHeight - viewport) to capture */
  frames: number[];
}

const SHOTS: Shot[] = [
  { route: "/", name: "home", frames: [0, 0.5] },
  { route: "/kurs/vibe-coding-express", name: "kurs", frames: [0, 0.3, 0.6, 0.9] },
  { route: "/kurs/ai-asoslari", name: "kurs-ai", frames: [0, 0.5] },
  { route: "/diagnostika", name: "diagnostika", frames: [0, 0.6] },
  { route: "/bepul-dars", name: "bepul-dars", frames: [0, 0.4, 0.8] },
  { route: "/xizmatlar", name: "xizmatlar", frames: [0, 0.4, 0.8] },
  { route: "/portfolio", name: "portfolio", frames: [0, 0.5, 0.9] },
  { route: "/blog", name: "blog", frames: [0, 0.6] },
  { route: "/blog/vibe-coding-nima-va-u-qanday-ishlaydi", name: "blog-post", frames: [0, 0.35, 0.7] },
  { route: "/resurslar", name: "resurslar", frames: [0, 0.7] },
  { route: "/atamalar", name: "atamalar", frames: [0, 0.6] },
  { route: "/ekspertlar", name: "ekspertlar", frames: [0, 0.6] },
  { route: "/meetlar", name: "meetlar", frames: [0, 0.6] },
  { route: "/maxfiylik", name: "maxfiylik", frames: [0, 0.6] },
  { route: "/offerta", name: "offerta", frames: [0] },
  { route: "/pul-qaytarish", name: "pul-qaytarish", frames: [0, 0.6] },
  { route: "/shahodatnoma/DEMO2026", name: "shahodatnoma", frames: [0, 0.8] },
  { route: "/kabinet", name: "kabinet", frames: [0, 0.7] },
  { route: "/kabinet/baholar", name: "kabinet-baholar", frames: [0] },
  { route: "/kabinet/to-lovlar", name: "kabinet-tolovlar", frames: [0] },
  { route: "/kabinet/referral", name: "kabinet-referral", frames: [0] },
  { route: "/kabinet/sozlamalar", name: "kabinet-sozlamalar", frames: [0] },
  { route: "/kabinet/sertifikat", name: "kabinet-sertifikat", frames: [0] },
  { route: "/404-qa-check", name: "not-found", frames: [0] },
  { route: "/design-system", name: "design-system", frames: [0, 0.9] },
];

async function capture(page: Page, shot: Shot, width: number, theme: "light" | "dark"): Promise<void> {
  await page.setViewportSize({ width, height: 850 });
  await page.goto(shot.route, { waitUntil: "networkidle" });
  // Settle ambient + staggered entrances before framing.
  await page.waitForTimeout(1200);
  const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  for (let i = 0; i < shot.frames.length; i++) {
    const y = Math.max(0, Math.round(max * shot.frames[i]));
    await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" as ScrollBehavior }), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `e2e/screenshots/w6c-${shot.name}-${width}-${theme}-${i}.png`, caret: "initial" });
  }
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.scrollingElement?.scrollWidth ?? 0,
    innerWidth: window.innerWidth,
  }));
  expect(overflow.scrollWidth, `${theme} ${shot.route} overflows at ${width}px`).toBeLessThanOrEqual(overflow.innerWidth + 1);
}

for (const shot of SHOTS) {
  test.describe(`w6c ${shot.name}`, () => {
    for (const width of [390, 1440] as const) {
      for (const theme of ["light", "dark"] as const) {
        test(`${width}px ${theme}`, async ({ page }) => {
          if (theme === "dark") {
            await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
          }
          await capture(page, shot, width, theme);
        });
      }
    }
  });
}
