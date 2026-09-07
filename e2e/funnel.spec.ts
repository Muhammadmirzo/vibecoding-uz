import { test, expect } from "@playwright/test";

test.describe("Full Conversion Funnel (Quiz -> Lead -> Course Checkout)", () => {
  test("completes 9-question diagnostic quiz and transitions to lead capture and course checkout", async ({
    page,
  }) => {
    // Step 1: Open Diagnostic Quiz page
    await page.goto("/diagnostika");
    await expect(page).toHaveTitle(/Diagnostika/i);

    // Verify Quiz Title
    const heading = page.locator("h1");
    await expect(heading).toContainText("Qaysi kurs maqsadingizga");

    // Answer questions 1 through 9
    for (let q = 1; q <= 9; q++) {
      // Expect question progress text
      await expect(page.getByText(new RegExp(`Savol ${q} / 9`, "i"))).toBeVisible();

      // Click first option available for the current question
      const firstOption = page.locator(".cursor-pointer").first();
      await expect(firstOption).toBeVisible();
      await firstOption.click();

      // Click "Keyingisi" button to proceed
      const nextBtn = page.getByRole("button", { name: "Keyingisi" });
      await expect(nextBtn).toBeEnabled();
      await nextBtn.click();
    }

    // Step 2: Lead Capture Form
    await expect(page.getByText("Natijani olish uchun ma'lumotlarni kiriting")).toBeVisible();

    // Fill Name & Phone fields
    await page.getByPlaceholder("Ismingizni kiriting").fill("Alijon Valiyev");
    await page.getByPlaceholder("+998 90 123 45 67").fill("+998901234567");

    // Submit Lead Form
    const submitBtn = page.getByRole("button", { name: "Natijani ko'rish" });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Step 3: Diagnostic Recommendation Result
    await expect(page.getByText("Diagnostika natijasi")).toBeVisible();
    await expect(page.getByText(/Sizga mos kurs:/i)).toBeVisible();

    // Click CTA to view recommended course
    const viewCourseBtn = page.getByRole("button", { name: "Tavsiya etilgan kursni ko'rish" });
    await expect(viewCourseBtn).toBeVisible();
    await viewCourseBtn.click();

    // Step 4: Course Sales Page & Checkout Card
    await page.waitForURL(/\/kurs\/(vibe-coding-express|ai-asoslari)/);
    await expect(page.locator("h1")).toBeVisible();

    // Verify Guarantee & Pricing Card
    await expect(page.getByText(/7 kunlik 100% Pul qaytarish kafolati|100% Pul qaytarish kafolati/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Joyni band qilish/i })).toBeVisible();
  });

  test("direct course detail page displays curriculum and pricing breakdown", async ({ page }) => {
    await page.goto("/kurs/vibe-coding-express");

    await expect(page.locator("h1")).toContainText("Vibe Coding Express");
    await expect(page.getByText("O'quv Dasturi Modullari")).toBeVisible();

    // Check pricing & guarantee badge
    await expect(page.getByText("2 990 000 so'm")).toBeVisible();
    await expect(page.getByText("3 990 000 so'm")).toBeVisible();
    await expect(page.getByText("Click va Payme orqali xavfsiz to'lov")).toBeVisible();
  });

  test("free lesson preview page accessibility", async ({ page }) => {
    await page.goto("/bepul-dars");
    await expect(page.locator("h1")).toBeVisible();
  });
});
