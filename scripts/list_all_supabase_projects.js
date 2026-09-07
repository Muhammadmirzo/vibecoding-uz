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

  // Intercept API calls to get project list JSON
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/platform/projects') || url.includes('/projects') || url.includes('/organizations')) {
      try {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('application/json')) {
          const json = await response.json();
          console.log(`\nAPI Response from [${url}]:\n`, JSON.stringify(json, null, 2));
        }
      } catch (e) {}
    }
  });

  console.log("Navigating to https://supabase.com/dashboard/projects ...");
  await page.goto('https://supabase.com/dashboard/projects', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForTimeout(6000);

  await page.screenshot({ path: '/tmp/supabase_all_projects.png', fullPage: true });

  await context.close();
}

run().catch(console.error);
