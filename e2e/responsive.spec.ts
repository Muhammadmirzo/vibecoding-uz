import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

const widths = [375, 390, 768, 1024, 1280, 1440] as const;
const routes = [
  { path: "/", name: "home" },
  { path: "/diagnostika", name: "diagnostika" },
  { path: "/bepul-dars", name: "bepul-dars" },
  { path: "/kurs/vibe-coding-express", name: "kurs-vibe-coding-express" },
  { path: "/kurs/ai-asoslari", name: "kurs-ai-asoslari" },
  { path: "/xizmatlar", name: "xizmatlar" },
  { path: "/blog", name: "blog" },
  { path: "/blog/vibe-coding-nima-va-u-qanday-ishlaydi", name: "blog-first-post" },
  { path: "/portfolio", name: "portfolio" },
  { path: "/testimoniyalar", name: "testimoniyalar" },
  { path: "/ekspertlar", name: "ekspertlar" },
  { path: "/meetlar", name: "meetlar" },
  { path: "/resurslar", name: "resurslar" },
  { path: "/atamalar", name: "atamalar" },
  { path: "/ish", name: "ish" },
  { path: "/pul-qaytarish", name: "pul-qaytarish" },
  { path: "/maxfiylik", name: "maxfiylik" },
  { path: "/offerta", name: "offerta" },
  { path: "/404-qa-check", name: "404" },
  { path: "/design-system", name: "design-system" },
] as const;

const darkThemeRoutes = new Set(["/", "/kurs/vibe-coding-express"]);

async function assertResponsivePage(
  page: Page,
  route: string,
  name: string,
  width: number,
  theme: "light" | "dark",
): Promise<void> {
  const errors: string[] = [];
  const onConsole = (message: ConsoleMessage): void => {
    if (message.type() !== "error") return;
    const text = message.text();
    const source = message.location().url;
    // Public pages intentionally perform an unauthenticated global auth probe.
    const expectedAuthProbe = text.startsWith("Failed fast-path /api/me check:") ||
      (text.includes("401 (Unauthorized)") && source.includes("/api/me")) ||
      (text.includes("404 (Not Found)") && source.includes("/api/me"));
    const intentionalNotFound = route.startsWith("/404-") && text.includes("404 (Not Found)");
    const transientHmrParse = text === "Invalid or unexpected token" || text === "Unexpected end of input";
    if (!expectedAuthProbe && !intentionalNotFound && !transientHmrParse) errors.push(text);
  };

  page.on("console", onConsole);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width, height: width <= 768 ? 900 : 960 });

  await page.goto(route, { waitUntil: "networkidle" });
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);

  const overflow = await page.evaluate(() => {
    const scrollingElement = document.scrollingElement;
    return {
      scrollWidth: scrollingElement?.scrollWidth ?? 0,
      innerWidth: window.innerWidth,
    };
  });
  expect(overflow.scrollWidth, `${theme} ${route} overflows at ${width}px`).toBeLessThanOrEqual(overflow.innerWidth);

  if (width <= 768) {
    const undersized = await page.locator("button:visible, a:visible:not(p a):not(li a), footer a:visible").evaluateAll((elements) =>
      elements
        .map((element) => {
          const node = element as HTMLElement;
          const rect = node.getBoundingClientRect();
          if (node.getAttribute("aria-label")?.toLowerCase().includes("next.js dev tools")) return null;
          return {
            label: node.getAttribute("aria-label") ?? node.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ?? node.tagName,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        })
        .filter((item): item is { label: string; width: number; height: number } => item !== null)
        .filter(({ width, height }) => width < 40 || height < 40),
    );
    expect(undersized, `${theme} ${route} has undersized tap targets at ${width}px`).toEqual([]);
  }

  const suffix = theme === "dark" ? "-dark" : "";
  await page.screenshot({
    path: `e2e/screenshots/${name}-${width}${suffix}.png`,
    fullPage: true,
    caret: "initial",
  });
  expect(errors, `${theme} ${route} logged browser errors at ${width}px`).toEqual([]);
  page.off("console", onConsole);
}

for (const route of routes) {
  test.describe(route.name, () => {
    for (const width of widths) {
      for (const theme of darkThemeRoutes.has(route.path) ? (["light", "dark"] as const) : (["light"] as const)) {
        test(`${width}px ${theme}`, async ({ page }) => {
          if (theme === "dark") {
            await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
          }
          await assertResponsivePage(page, route.path, route.name, width, theme);
        });
      }
    }
  });
}
