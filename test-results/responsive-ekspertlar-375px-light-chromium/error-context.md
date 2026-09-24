# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.ts >> ekspertlar >> 375px light
- Location: e2e/responsive.spec.ts:99:13

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3100/ekspertlar
Call log:
  - navigating to "http://localhost:3100/ekspertlar", waiting until "networkidle"

```

# Test source

```ts
  1   | import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";
  2   | 
  3   | const widths = [375, 390, 768, 1024, 1280, 1440] as const;
  4   | const routes = [
  5   |   { path: "/", name: "home" },
  6   |   { path: "/diagnostika", name: "diagnostika" },
  7   |   { path: "/bepul-dars", name: "bepul-dars" },
  8   |   { path: "/kurs/vibe-coding-express", name: "kurs-vibe-coding-express" },
  9   |   { path: "/kurs/ai-asoslari", name: "kurs-ai-asoslari" },
  10  |   { path: "/xizmatlar", name: "xizmatlar" },
  11  |   { path: "/blog", name: "blog" },
  12  |   { path: "/blog/vibe-coding-nima-va-u-qanday-ishlaydi", name: "blog-first-post" },
  13  |   { path: "/portfolio", name: "portfolio" },
  14  |   { path: "/testimoniyalar", name: "testimoniyalar" },
  15  |   { path: "/ekspertlar", name: "ekspertlar" },
  16  |   { path: "/meetlar", name: "meetlar" },
  17  |   { path: "/resurslar", name: "resurslar" },
  18  |   { path: "/atamalar", name: "atamalar" },
  19  |   { path: "/ish", name: "ish" },
  20  |   { path: "/pul-qaytarish", name: "pul-qaytarish" },
  21  |   { path: "/maxfiylik", name: "maxfiylik" },
  22  |   { path: "/offerta", name: "offerta" },
  23  |   { path: "/404-qa-check", name: "404" },
  24  |   { path: "/design-system", name: "design-system" },
  25  | ] as const;
  26  | 
  27  | const darkThemeRoutes = new Set(["/", "/kurs/vibe-coding-express"]);
  28  | 
  29  | async function assertResponsivePage(
  30  |   page: Page,
  31  |   route: string,
  32  |   name: string,
  33  |   width: number,
  34  |   theme: "light" | "dark",
  35  | ): Promise<void> {
  36  |   const errors: string[] = [];
  37  |   const onConsole = (message: ConsoleMessage): void => {
  38  |     if (message.type() !== "error") return;
  39  |     const text = message.text();
  40  |     const source = message.location().url;
  41  |     // Public pages intentionally perform an unauthenticated global auth probe.
  42  |     const expectedAuthProbe = text.startsWith("Failed fast-path /api/me check:") ||
  43  |       (text.includes("401 (Unauthorized)") && source.includes("/api/me")) ||
  44  |       (text.includes("404 (Not Found)") && source.includes("/api/me"));
  45  |     const intentionalNotFound = route.startsWith("/404-") && text.includes("404 (Not Found)");
  46  |     if (!expectedAuthProbe && !intentionalNotFound) errors.push(text);
  47  |   };
  48  | 
  49  |   page.on("console", onConsole);
  50  |   page.on("pageerror", (error) => errors.push(error.message));
  51  |   await page.setViewportSize({ width, height: width <= 768 ? 900 : 960 });
  52  | 
> 53  |   await page.goto(route, { waitUntil: "networkidle" });
      |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3100/ekspertlar
  54  |   await expect(page.locator("h1")).toHaveCount(1);
  55  |   await expect(page.locator("main")).toHaveCount(1);
  56  | 
  57  |   const overflow = await page.evaluate(() => {
  58  |     const scrollingElement = document.scrollingElement;
  59  |     return {
  60  |       scrollWidth: scrollingElement?.scrollWidth ?? 0,
  61  |       innerWidth: window.innerWidth,
  62  |     };
  63  |   });
  64  |   expect(overflow.scrollWidth, `${theme} ${route} overflows at ${width}px`).toBeLessThanOrEqual(overflow.innerWidth);
  65  | 
  66  |   if (width <= 768) {
  67  |     const undersized = await page.locator("button:visible, a:visible:not(p a):not(li a), footer a:visible").evaluateAll((elements) =>
  68  |       elements
  69  |         .map((element) => {
  70  |           const node = element as HTMLElement;
  71  |           const rect = node.getBoundingClientRect();
  72  |           if (node.getAttribute("aria-label")?.toLowerCase().includes("next.js dev tools")) return null;
  73  |           return {
  74  |             label: node.getAttribute("aria-label") ?? node.textContent?.trim().replace(/\s+/g, " ").slice(0, 80) ?? node.tagName,
  75  |             width: Math.round(rect.width),
  76  |             height: Math.round(rect.height),
  77  |           };
  78  |         })
  79  |         .filter((item): item is { label: string; width: number; height: number } => item !== null)
  80  |         .filter(({ width, height }) => width < 40 || height < 40),
  81  |     );
  82  |     expect(undersized, `${theme} ${route} has undersized tap targets at ${width}px`).toEqual([]);
  83  |   }
  84  | 
  85  |   const suffix = theme === "dark" ? "-dark" : "";
  86  |   await page.screenshot({
  87  |     path: `e2e/screenshots/${name}-${width}${suffix}.png`,
  88  |     fullPage: true,
  89  |     caret: "initial",
  90  |   });
  91  |   expect(errors, `${theme} ${route} logged browser errors at ${width}px`).toEqual([]);
  92  |   page.off("console", onConsole);
  93  | }
  94  | 
  95  | for (const route of routes) {
  96  |   test.describe(route.name, () => {
  97  |     for (const width of widths) {
  98  |       for (const theme of darkThemeRoutes.has(route.path) ? (["light", "dark"] as const) : (["light"] as const)) {
  99  |         test(`${width}px ${theme}`, async ({ page }) => {
  100 |           if (theme === "dark") {
  101 |             await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
  102 |           }
  103 |           await assertResponsivePage(page, route.path, route.name, width, theme);
  104 |         });
  105 |       }
  106 |     }
  107 |   });
  108 | }
  109 | 
```