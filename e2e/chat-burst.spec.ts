import { expect, test } from "@playwright/test";

// Fully mocked (no DB): a visitor fires several messages while the first send is still in
// flight, and the admin answers each one separately. Regression for messages being dropped
// or wiped from the composer, and for replies that did not show which message they answer.
const conversationId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const now = () => new Date().toISOString();
const settings = {
  enabled: true, welcomeText: "Salom!", officeHours: { start: 0, end: 24, tz: "Asia/Tashkent" }, replyTimeMinutes: 10,
  offlineText: "Oflayn", aiDefaultMode: "off", aiProvider: "anthropic", aiModel: "claude-sonnet-5", aiDailyReplyCap: 40,
  aiPersona: "Yordamchi", telegramNotify: false, quickReplies: [],
};
const conversation = {
  id: conversationId, displayName: "Mehmon", status: "pending", aiMode: "off", assignedAdminId: null, userId: null,
  leadId: null, lastMessageAt: now(), unreadForAdmin: 0, unreadForVisitor: 0, sourcePath: "/", device: "Chromium",
  contactPhone: null, contactTelegram: null, createdAt: now(),
};

test("burst of visitor messages is delivered in order and replies quote their message", async ({ page }) => {
  const messages: Array<Record<string, unknown>> = [];
  const received: string[] = [];
  let failNext = true;
  await page.route("**/api/v1/chat/open", (route) => route.fulfill({ json: { data: { tracked: true } } }));
  await page.route("**/api/v1/chat/read", (route) => route.fulfill({ json: { data: { read: true } } }));
  await page.route("**/api/v1/chat", (route) => route.fulfill({ json: { data: { conversation, settings } } }));
  await page.route("**/api/v1/chat/messages*", async (route) => {
    if (route.request().method() === "GET") {
      return route.fulfill({ json: { data: { conversation, messages, nextCursor: null } } });
    }
    const input = route.request().postDataJSON() as { clientId: string; body: string };
    if (!received.length) await new Promise((resolve) => setTimeout(resolve, 1_500)); // slow first send
    if (input.body === "Uchinchi" && failNext) {
      failNext = false;
      return route.fulfill({ status: 503, json: { error: { code: "down" } } });
    }
    received.push(input.body);
    const message = {
      id: crypto.randomUUID(), conversationId, clientId: input.clientId, sender: "visitor", body: input.body,
      createdAt: now(), readAt: null, isDraft: false, replyTo: null,
    };
    messages.push(message);
    return route.fulfill({ status: 201, json: { data: { message, conversation, settings } } });
  });

  await page.goto("/");
  await page.getByLabel("Naqsh bilan suhbatlashish").click();
  const composer = page.getByLabel("Chat xabari");
  for (const text of ["Birinchi", "Ikkinchi", "Uchinchi"]) {
    await composer.fill(text);
    await composer.press("Enter");
    await expect(composer).toHaveValue("");
  }
  // All three are visible immediately, while the first is still in flight.
  await expect(page.getByText("Yuborilmoqda…")).toHaveCount(3);

  // The third fails once: it is kept, flagged, and re-sent automatically — nothing is lost.
  await expect(page.getByText("Yuborilmadi", { exact: true })).toBeVisible();
  await expect.poll(() => received, { timeout: 10_000 }).toEqual(["Birinchi", "Ikkinchi", "Uchinchi"]);
  await expect(page.getByText("Yuborilmoqda…")).toHaveCount(0);

  // Admin answers the first and third messages separately (e.g. by Telegram reply).
  const [first, , third] = messages as Array<{ id: string; body: string }>;
  for (const [parent, body] of [[third, "Uchinchiga javob"], [first, "Birinchiga javob"]] as const) {
    messages.push({
      id: crypto.randomUUID(), conversationId, clientId: `telegram-${body}`, sender: "admin", body, createdAt: now(),
      readAt: null, isDraft: false, replyTo: { id: parent.id, sender: "visitor", body: parent.body },
    });
  }
  const answerToFirst = page.locator(".chat-message", { hasText: "Birinchiga javob" });
  await expect(answerToFirst.getByRole("button", { name: "Javob: Birinchi" })).toBeVisible({ timeout: 10_000 });
  await expect(page.locator(".chat-message", { hasText: "Uchinchiga javob" }).getByRole("button", { name: "Javob: Uchinchi" })).toBeVisible();
});
