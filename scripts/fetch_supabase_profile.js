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

  const orgUrl = 'https://supabase.com/dashboard/org/nkvdrukabyslivgynddr';
  console.log(`Navigating to Org: ${orgUrl}`);
  await page.goto(orgUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(5000);

  const text = await page.evaluate(() => document.body.innerText);
  console.log("Org Page Text:\n", text);

  const allElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, [role="button"]')).map(el => ({
      tagName: el.tagName,
      text: el.innerText.trim().replace(/\n/g, ' '),
      href: el.getAttribute('href') || '',
      id: el.id
    }));
  });

  console.log("All interactive elements:\n", JSON.stringify(allElements, null, 2));

  await page.screenshot({ path: '/tmp/supabase_org_nkvdrukabyslivgynddr.png', fullPage: true });

  await context.close();
}

run().catch(console.error);
