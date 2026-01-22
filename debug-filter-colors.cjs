const puppeteer = require('puppeteer');

async function debugFilterColors() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    slowMo: 250
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Wait for class filter buttons to appear
  await page.waitForSelector('.filter-btn[data-class]', { timeout: 10000 });

  // Get computed styles for each class button
  const buttonStyles = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('.filter-btn[data-class]'));
    return buttons.map(btn => {
      const dataClass = btn.getAttribute('data-class');
      const styles = window.getComputedStyle(btn);
      return {
        class: dataClass,
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.color,
        hasDataClass: btn.hasAttribute('data-class')
      };
    });
  });

  console.log('Class Filter Button Styles:');
  console.log(JSON.stringify(buttonStyles, null, 2));

  // Check if CSS file is loaded
  const cssLoaded = await page.evaluate(() => {
    const stylesheets = Array.from(document.styleSheets);
    return stylesheets.some(sheet => {
      try {
        return sheet.href && sheet.href.includes('SpellFilters');
      } catch (e) {
        return false;
      }
    });
  });

  console.log('\nSpellFilters.css loaded:', cssLoaded);

  // Keep browser open for manual inspection
  console.log('\nBrowser open - press Ctrl+C when done');
  await new Promise(resolve => setTimeout(resolve, 600000)); // 10 min

  await browser.close();
}

debugFilterColors().catch(console.error);
