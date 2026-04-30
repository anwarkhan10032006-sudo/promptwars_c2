const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  
  await page.click('#main-epic-btn');
  console.log('Clicked main epic btn');
  
  await new Promise(r => setTimeout(r, 1500));
  
  await browser.close();
})();
