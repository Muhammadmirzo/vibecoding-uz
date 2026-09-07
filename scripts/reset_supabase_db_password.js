const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  const targetDir = `/tmp/chrome-pwd-profile-${Date.now()}/Default`;
  console.log("Preparing fast Chrome profile copy...");
  execSync(`mkdir -p ${targetDir}`);

  const srcDir = '/home/mirzo/.config/google-chrome/Default';
  const filesToCopy = ['Cookies', 'Preferences', 'Network', 'Local Storage', 'Session Storage'];

  for (const f of filesToCopy) {
    const src = path.join(srcDir, f);
    if (fs.existsSync(src)) {
      execSync(`cp -R "${src}" "${targetDir}/"`);
    }
  }

  let executablePath = '/usr/bin/google-chrome';
  if (!fs.existsSync(executablePath)) executablePath = '/usr/bin/google-chrome-stable';
  if (!fs.existsSync(executablePath)) executablePath = '/usr/bin/chromium';

  console.log("Launching browser...");
  const context = await chromium.launchPersistentContext(path.dirname(targetDir), {
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--headless=new']
  });

  const page = await context.newPage();

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/db-password') || url.includes('/password')) {
      try {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('application/json')) {
          const json = await response.json();
          console.log(`\nAPI Response from [${url}]:\n`, JSON.stringify(json, null, 2));
        }
      } catch (e) {}
    }
  });

  const ref = 'gvfzomtdswzlxstjvwiv';
  const newPassword = 'AcademyMirzo2026SecureDBPass!';

  console.log(`Navigating to DB Settings for ${ref}...`);
  await page.goto(`https://supabase.com/dashboard/project/${ref}/settings/database`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(4000);

  const resetBtn = page.locator('button:has-text("Reset password")');
  if (await resetBtn.count() > 0) {
    console.log("Clicking Reset password button...");
    await resetBtn.first().click();
    await page.waitForTimeout(2000);

    const input = page.locator('input[placeholder*="strong password"], input[placeholder*="Type in"]');
    if (await input.count() > 0) {
      console.log("Found password input! Typing new password...");
      await input.first().fill(newPassword);
      await page.waitForTimeout(1000);

      const confirmBtn = page.locator('button:has-text("Reset password")').last();
      console.log("Clicking confirm button...");
      await confirmBtn.click();
      await page.waitForTimeout(6000);

      await page.screenshot({ path: '/tmp/reset_password_success.png', fullPage: true });
      console.log("SUCCESS! Password updated to:", newPassword);
    } else {
      console.log("Password input not found in modal");
    }
  }

  await context.close();
}

run().catch(console.error);
