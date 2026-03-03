const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to a common desktop size
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Navigate to the page
  await page.goto('http://localhost:3000/chat', { waitUntil: 'networkidle' });
  
  // Take screenshot
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  
  console.log('Screenshot saved to screenshot.png');
  
  await browser.close();
})();
