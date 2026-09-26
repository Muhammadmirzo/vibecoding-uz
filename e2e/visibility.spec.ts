import { expect, test } from "@playwright/test";

/**
 * Regression for "Real loyihalar section stays white/invisible": the responsive
 * suite only checked overflow/console/tap targets, and its full-page
 * screenshots never scroll, so hidden scroll-reveal content looked like
 * "not triggered yet". This spec scrolls like a user and asserts every reveal
 * block that reached the viewport is actually visible, and that headings never
 * fall back to a serif (Times) font.
 */
const PAGES = [
  "/",
  "/kurs/vibe-coding-express",
  "/kurs/ai-asoslari",
  "/bepul-dars",
  "/diagnostika",
  "/xizmatlar",
  "/portfolio",
  "/blog",
  "/blog/vibe-coding-nima-va-u-qanday-ishlaydi",
  "/kurs",
  "/resurslar",
  "/atamalar",
  "/meetlar",
  "/pul-qaytarish",
  "/maxfiylik",
  "/offerta",
  "/shahodatnoma/DEMO2026",
  "/kabinet",
];
const WIDTHS = [390, 1440];

for (const path of PAGES) {
  for (const width of WIDTHS) {
    test(`${path} @${width}px: scrolled content is visible`, async ({ page }) => {
      await page.setViewportSize({ width, height: 850 });
      await page.goto(path, { waitUntil: "networkidle" });

      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 500) {
        await page.mouse.wheel(0, 500);
        await page.waitForTimeout(80);
      }
      // Let the longest staggered transition finish.
      await page.waitForTimeout(1600);

      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("[data-reveal]")]
          .filter((el) => el.getBoundingClientRect().top < window.innerHeight)
          .filter((el) => Number(getComputedStyle(el).opacity) < 0.99)
          .map((el) => el.textContent?.trim().slice(0, 60) ?? el.className),
      );
      expect(hidden, "reveal blocks still hidden after scrolling past them").toEqual([]);

      const headingFonts = await page.evaluate(() =>
        [...document.querySelectorAll("h1, h2")].slice(0, 5).map((el) => getComputedStyle(el).fontFamily),
      );
      for (const font of headingFonts) expect(font).toMatch(/sans-serif/);
    });
  }
}
