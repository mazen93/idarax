const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE LOG ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', exception => {
    console.log(`PAGE EXCEPTION: ${exception}`);
  });

  try {
    console.log("Navigating to login...");
    await page.goto('http://localhost:3000/en/login', { waitUntil: 'networkidle' });
    
    // We need to login as demo@restaurant.com
    await page.fill('input[type="email"]', 'demo@restaurant.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    console.log("Navigating to settings...");
    await page.goto('http://localhost:3000/en/dashboard/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log("Done checking");

  } catch (e) {
    console.log("Script error", e);
  }
  await browser.close();
})();
