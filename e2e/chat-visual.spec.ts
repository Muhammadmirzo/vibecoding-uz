import { expect, test, type Page } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

const adminId = "11111111-1111-4111-8111-111111111111";
const sessionId = "22222222-2222-4222-8222-222222222222";
const conversationId = "33333333-3333-4333-8333-333333333333";
const secret = process.env.SESSION_SECRET || "naqsh-playwright-local-only";
const now = () => new Date().toISOString();
const baseSettings = {
  enabled: true, welcomeText: "Salom! Naqsh jamoasiga xabar yozing — yordam beramiz.",
  officeHours: { start: 0, end: 24, tz: "Asia/Tashkent" }, replyTimeMinutes: 10,
  offlineText: "Hozir oflaynmiz — raqamingizni qoldiring, Telegram orqali javob beramiz", aiDefaultMode: "assist",
  aiProvider: "anthropic", aiModel: "claude-sonnet-5", aiDailyReplyCap: 40, aiPersona: "Samimiy yordamchi",
  telegramNotify: false, quickReplies: ["Kurs tanlashda yordam", "To'lov savoli", "Bepul dars"],
};
const conversation = {
  id: conversationId, displayName: "Aziza Karimova", status: "pending", aiMode: "assist", assignedAdminId: null,
  userId: null, leadId: "44444444-4444-4444-8444-444444444444", lastMessageAt: now(), unreadForAdmin: 2,
  unreadForVisitor: 1, sourcePath: "/kurs/vibe-coding-express", device: "iPhone · Safari", contactPhone: "+998 90 123 45 67",
  contactTelegram: null, createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
};
let offline = false;
let signToken: typeof import("@/lib/auth/session/token").signSessionToken;
let cleanupAdmin: () => Promise<void> = async () => undefined;
let messages: Array<Record<string, unknown>> = [
  { id: "55555555-5555-4555-8555-555555555555", conversationId, clientId: "visitor-1", sender: "visitor", body: "Vibe Coding Express kursi menga mos bo'ladimi?", createdAt: new Date(Date.now() - 4 * 60_000).toISOString(), readAt: new Date(Date.now() - 3 * 60_000).toISOString(), isDraft: false },
  { id: "66666666-6666-4666-8666-666666666666", conversationId, clientId: "draft-1", sender: "ai", body: "Sizga AI vositalari bilan mahsulot qurish yo'nalishi mos. Kurs tarkibi va narxi saytda ko'rsatilgan.", createdAt: new Date(Date.now() - 2 * 60_000).toISOString(), readAt: null, isDraft: true },
  { id: "77777777-7777-4777-8777-777777777777", conversationId, clientId: "admin-1", sender: "admin", body: "Salom! Dasturchi bilmay boshlash mumkin. Qayerdan boshlashni birga tanlab olaymiz.", createdAt: new Date(Date.now() - 60_000).toISOString(), readAt: null, isDraft: false },
];

async function mockApis(page: Page) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tashkent", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
  const settings = { ...baseSettings, officeHours: offline ? { start: (hour + 2) % 24, end: (hour + 3) % 24, tz: "Asia/Tashkent" as const } : baseSettings.officeHours };
  await page.route("**/api/v1/chat/open", (route) => route.fulfill({ json: { data: { tracked: true } } }));
  await page.route("**/api/v1/chat/read", (route) => route.fulfill({ json: { data: { read: true } } }));
  await page.route("**/api/v1/chat", (route) => route.fulfill({ json: { data: { conversation, settings } } }));
  await page.route("**/api/v1/chat/messages", async (route) => route.fulfill({ json: { data: { conversation, messages: messages.filter((message) => message.isDraft !== true), nextCursor: messages.at(-1)?.createdAt || null } } }));
  await page.route("**/api/v1/admin/chat/read", (route) => route.fulfill({ json: { data: { read: true } } }));
  await page.route("**/api/v1/admin/chat/messages", (route) => route.fulfill({ json: { data: { message: messages.at(-1) } } }));
  await page.route("**/api/v1/admin/chat/conversations*", (route) => {
    const url = new URL(route.request().url());
    return route.fulfill({ json: { data: url.searchParams.has("id") ? { conversation, messages } : { conversations: [conversation] } } });
  });
}

test.beforeAll(async () => {
  loadEnvConfig(process.cwd());
  const [{ db }, { sessions, users }, token] = await Promise.all([
    import("@/db"), import("@/db/schema/users"), import("@/lib/auth/session/token"),
  ]);
  signToken = token.signSessionToken;
  await db.insert(users).values({ id: adminId, phone: "+998999000002", email: "playwright-visual@naqsh.test", fullName: "Visual Admin", role: "admin" }).onConflictDoNothing();
  await db.insert(sessions).values({ id: sessionId, userId: adminId, expiresAt: new Date(Date.now() + 60 * 60_000) }).onConflictDoNothing();
  cleanupAdmin = async () => { await db.delete(users).where((await import("drizzle-orm")).eq(users.id, adminId)); };
});
test.afterAll(async () => { await cleanupAdmin().catch(() => undefined); });

for (const width of [390, 1440]) {
  for (const dark of [false, true]) {
    test(`widget and inbox visual review at ${width}px ${dark ? "dark" : "light"}`, async ({ browser }) => {
      offline = false;
      const visitorContext = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 } });
      const visitor = await visitorContext.newPage();
      await mockApis(visitor);
      await visitor.addInitScript((enabled) => document.documentElement.classList.toggle("dark", enabled), dark);
      await visitor.goto("/");
      await visitor.addStyleTag({ content: "nextjs-portal{display:none!important}" });
      await visitor.locator("[data-chat-launcher]").waitFor();
      await visitor.screenshot({ path: `e2e/screenshots/chat-closed-${width}-${dark ? "dark" : "light"}.png`, fullPage: false });
      await visitor.locator("[data-chat-launcher]").click();
      await expect(visitor.getByRole("dialog", { name: "Naqsh bilan suhbat" })).toBeVisible();
      await visitor.screenshot({ path: `e2e/screenshots/chat-open-${width}-${dark ? "dark" : "light"}.png`, fullPage: false });
      await visitor.screenshot({ path: `e2e/screenshots/chat-conversation-${width}-${dark ? "dark" : "light"}.png`, fullPage: false });
      await visitorContext.close();

      offline = true;
      const offlineContext = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 } });
      const offlinePage = await offlineContext.newPage();
      await mockApis(offlinePage);
      await offlinePage.addInitScript((enabled) => document.documentElement.classList.toggle("dark", enabled), dark);
      await offlinePage.goto("/");
      await offlinePage.addStyleTag({ content: "nextjs-portal{display:none!important}" });
      await offlinePage.locator("[data-chat-launcher]").click();
      await expect(offlinePage.getByText("Hozir oflaynmiz", { exact: true }).first()).toBeVisible();
      await offlinePage.screenshot({ path: `e2e/screenshots/chat-offline-${width}-${dark ? "dark" : "light"}.png`, fullPage: false });
      await offlineContext.close();

      const adminContext = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 1000 } });
      const token = await signToken({ userId: adminId, role: "admin", sessionId, expiresAt: Date.now() + 60 * 60_000 }, secret);
      await adminContext.addCookies([{ name: "session_token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
      const admin = await adminContext.newPage();
      await mockApis(admin);
      await admin.addInitScript((enabled) => document.documentElement.classList.toggle("dark", enabled), dark);
      await admin.goto("/admin/chat");
      await admin.addStyleTag({ content: "nextjs-portal{display:none!important}" });
      await admin.getByRole("button", { name: /Aziza Karimova/ }).click();
      await expect(admin.getByRole("heading", { name: "Chat inbox" })).toBeVisible();
      await admin.screenshot({ path: `e2e/screenshots/admin-chat-${width}-${dark ? "dark" : "light"}.png`, fullPage: false });
      await adminContext.close();
    });
  }
}
