import { expect, test, type Page } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

const adminId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const sessionId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const conversationId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const visitorMessageId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const adminMessageId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const secret = process.env.SESSION_SECRET || "naqsh-playwright-local-only";
const now = () => new Date().toISOString();

const settings = {
  enabled: true, welcomeText: "Salom! Naqsh jamoasiga xabar yozing — yordam beramiz.",
  officeHours: { start: 0, end: 24, tz: "Asia/Tashkent" }, replyTimeMinutes: 10,
  offlineText: "Hozir oflaynmiz — raqamingizni qoldiring", aiDefaultMode: "off", aiProvider: "anthropic",
  aiModel: "claude-sonnet-5", aiDailyReplyCap: 40, aiPersona: "Samimiy yordamchi", telegramNotify: false,
  quickReplies: ["Kurs tanlashda yordam", "To'lov savoli", "Bepul dars"],
};
const conversation = {
  id: conversationId, displayName: "Playwright mehmon", status: "pending", aiMode: "off", assignedAdminId: null,
  userId: null, leadId: null, lastMessageAt: now(), unreadForAdmin: 1, unreadForVisitor: 0, sourcePath: "/",
  device: "Chromium", contactPhone: null, contactTelegram: null, createdAt: now(),
};
let messages: Array<Record<string, unknown>> = [];
let signToken: typeof import("@/lib/auth/session/token").signSessionToken;
let cleanupAdmin: () => Promise<void> = async () => undefined;

async function mockChat(page: Page) {
  await page.route("**/api/v1/chat/open", (route) => route.fulfill({ json: { data: { tracked: true } } }));
  await page.route("**/api/v1/chat/read", (route) => route.fulfill({ json: { data: { read: true } } }));
  await page.route("**/api/v1/chat", (route) => route.fulfill({ json: { data: { conversation, settings } } }));
  await page.route("**/api/v1/chat/messages", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ json: { data: { conversation, messages, nextCursor: messages.at(-1)?.createdAt || null } } });
    }
    const input = route.request().postDataJSON() as { clientId: string; body: string };
    const message = { id: visitorMessageId, conversationId, clientId: input.clientId, sender: "visitor", body: input.body, createdAt: now(), readAt: null, isDraft: false };
    messages = [...messages, message];
    return route.fulfill({ status: 201, json: { data: { message, conversation, settings } } });
  });
  await page.route("**/api/v1/admin/chat/read", (route) => route.fulfill({ json: { data: { read: true } } }));
  await page.route("**/api/v1/admin/chat/messages", async (route) => {
    const input = route.request().postDataJSON() as { body: string; clientId: string };
    const message = { id: adminMessageId, conversationId, clientId: input.clientId, sender: "admin", body: input.body, createdAt: now(), readAt: null, isDraft: false };
    messages = [...messages, message];
    return route.fulfill({ json: { data: { message } } });
  });
  await page.route("**/api/v1/admin/chat/conversations*", async (route) => {
    const url = new URL(route.request().url());
    if (url.searchParams.has("id")) return route.fulfill({ json: { data: { conversation, messages } } });
    return route.fulfill({ json: { data: { conversations: [conversation] } } });
  });
}

test.beforeAll(async () => {
  loadEnvConfig(process.cwd());
  const [{ db }, { sessions, users }, token] = await Promise.all([
    import("@/db"), import("@/db/schema/users"), import("@/lib/auth/session/token"),
  ]);
  signToken = token.signSessionToken;
  await db.insert(users).values({
    id: adminId, phone: "+998999000001", email: "playwright-chat@naqsh.test",
    fullName: "Playwright Admin", role: "admin",
  }).onConflictDoNothing();
  await db.insert(sessions).values({ id: sessionId, userId: adminId, expiresAt: new Date(Date.now() + 60 * 60_000) }).onConflictDoNothing();
  cleanupAdmin = async () => { await db.delete(users).where((await import("drizzle-orm")).eq(users.id, adminId)); };
});

test.afterAll(async () => { await cleanupAdmin().catch(() => undefined); });

test("visitor message reaches admin inbox and admin reply returns to widget", async ({ browser }) => {
  messages = [];
  const visitorContext = await browser.newContext();
  const visitor = await visitorContext.newPage();
  await mockChat(visitor);
  await visitor.goto("/");
  await visitor.locator("[data-chat-launcher]").click();
  await expect(visitor.getByRole("dialog", { name: "Naqsh bilan suhbat" })).toBeVisible();
  await visitor.getByLabel("Chat xabari").fill("Kurs tanlashda yordam kerak");
  await visitor.getByLabel("Xabarni yuborish").click();
  await expect(visitor.getByText("Kurs tanlashda yordam kerak")).toBeVisible();

  const adminContext = await browser.newContext();
  const token = await signToken({ userId: adminId, role: "admin", sessionId, expiresAt: Date.now() + 60 * 60_000 }, secret);
  await adminContext.addCookies([{ name: "session_token", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
  const admin = await adminContext.newPage();
  await mockChat(admin);
  await admin.goto("/admin/chat");
  await admin.getByRole("button", { name: /Playwright mehmon/ }).click();
  await expect(admin.getByText("Kurs tanlashda yordam kerak")).toBeVisible();
  await admin.getByLabel("Admin javobi").fill("Albatta, kurs tanlashda yordam beramiz.");
  await admin.getByLabel("Javobni yuborish").click();
  await expect(admin.getByText("Albatta, kurs tanlashda yordam beramiz.")).toBeVisible();
  expect(messages.some((message) => message.body === "Albatta, kurs tanlashda yordam beramiz.")).toBe(true);

  await visitor.bringToFront();
  await visitor.getByLabel("Chatni yopish").click();
  await visitor.locator("[data-chat-launcher]").click();
  await expect(visitor.getByText("Albatta, kurs tanlashda yordam beramiz.")).toBeVisible({ timeout: 10_000 });
  await visitorContext.close();
  await adminContext.close();
});
