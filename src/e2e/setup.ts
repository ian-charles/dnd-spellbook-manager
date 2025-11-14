import puppeteer, { Browser, Page } from 'puppeteer';

let browser: Browser;
let page: Page;

export const TEST_URL = 'http://localhost:5173';
export const TEST_TIMEOUT = 30000;

export async function setupBrowser() {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  return { browser, page };
}

export async function closeBrowser() {
  if (page) await page.close();
  if (browser) await browser.close();
}

export function getBrowser() {
  return browser;
}

export function getPage() {
  return page;
}

export async function waitForSpellsToLoad(page: Page) {
  // Wait for the spell table to be present
  await page.waitForSelector('.spell-table', { timeout: 10000 });
  // Wait a bit for React to finish rendering
  await page.waitForFunction(
    () => {
      const rows = document.querySelectorAll('.spell-row');
      return rows.length > 0;
    },
    { timeout: 10000 }
  );
}

/**
 * Helper to wait for a duration (replacement for deprecated page.waitForTimeout)
 */
export async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
