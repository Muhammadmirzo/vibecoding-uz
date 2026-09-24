import { defineConfig, devices } from "@playwright/test";

// E2E_PORT lets parallel worktrees run their own dev server without colliding.
const port = process.env.E2E_PORT ?? "3100";
const sessionSecret = process.env.SESSION_SECRET || "naqsh-playwright-local-only";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `SESSION_SECRET=${JSON.stringify(sessionSecret)} __NEXT_DISABLE_MEMORY_WATCHER=1 npx next dev -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
