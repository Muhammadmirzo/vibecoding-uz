const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function run() {
  const targetDir = '/tmp/chrome-fast-profile/Default';
  console.log("Preparing fast Chrome profile copy...");
  execSync(`rm -rf /tmp/chrome-fast-profile && mkdir -p ${targetDir}`);

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
  const context = await chromium.launchPersistentContext('/tmp/chrome-fast-profile', {
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--headless=new']
  });

  const page = await context.newPage();

  const ref = 'gvfzomtdswzlxstjvwiv';
  console.log(`Navigating to Database settings for ${ref}...`);
  await page.goto(`https://supabase.com/dashboard/project/${ref}/settings/database`, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(4000);

  // Click on "Connect" button
  console.log("Clicking Connect button...");
  const connectBtn = page.locator('button:has-text("Connect")');
  if (await connectBtn.count() > 0) {
    await connectBtn.first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/supabase_connect_modal.png', fullPage: true });

    const modalText = await page.evaluate(() => document.body.innerText);
    console.log("Modal / Page Text after Connect:\n", modalText);
  } else {
    console.log("Connect button not found");
  }

  await context.close();
}

run().catch(console.error);
