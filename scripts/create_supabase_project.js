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

  const createUrl = 'https://supabase.com/dashboard/new/nkvdrukabyslivgynddr';
  console.log(`Navigating to Create Project page: ${createUrl}`);
  await page.goto(createUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });

  console.log("Waiting for inputs to appear...");
  await page.waitForTimeout(8000);

  await page.screenshot({ path: '/tmp/supabase_create_page_loaded.png', fullPage: true });

  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log("Loaded Create Page Text:\n", bodyText.substring(0, 1500));

  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input, select, button')).map(el => ({
      tagName: el.tagName,
      type: el.type || '',
      name: el.name || '',
      placeholder: el.placeholder || '',
      text: el.innerText.trim().replace(/\n/g, ' '),
      id: el.id,
      className: el.className
    }));
  });

  console.log("Loaded Form controls:\n", JSON.stringify(inputs, null, 2));

  await context.close();
}

run().catch(console.error);
