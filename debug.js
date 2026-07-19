const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ executablePath: 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe', headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log(`BROWSER_REQUEST_FAILED: ${request.url()} - ${request.failure()?.errorText}`)
  );

  console.log('Navigating to localhost:5173...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    console.log('Navigation error (might just be timeout):', e.message);
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
