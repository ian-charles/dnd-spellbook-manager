import puppeteer, { Browser, Page } from 'puppeteer';
import { TEST_URL, TIMEOUTS, VIEWPORTS } from './config';

let browser: Browser;
let page: Page;

// Re-export for backwards compatibility
export { TEST_URL };
export const TEST_TIMEOUT = TIMEOUTS.LONG;

export async function setupBrowser() {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  page = await browser.newPage();
  await page.setViewport(VIEWPORTS.DESKTOP);
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
  await page.waitForSelector('.spell-table', { timeout: TIMEOUTS.MEDIUM });
  // Wait a bit for React to finish rendering
  await page.waitForFunction(
    () => {
      const rows = document.querySelectorAll('.spell-row');
      return rows.length > 0;
    },
    { timeout: TIMEOUTS.MEDIUM }
  );
}


/**
 * Clear spellbook data from IndexedDB without affecting spell data.
 * Spell data is loaded from static JSON and doesn't need to be cleared/reloaded.
 * This significantly speeds up tests by avoiding the spell data reload.
 */
export async function clearSpellbookData(page: Page) {
  await page.evaluate(async () => {
    const dbName = 'DndSpellbookDB';

    return new Promise<void>((resolve) => {
      // Open the database (this will create it if it doesn't exist)
      const request = indexedDB.open(dbName, 1);

      request.onupgradeneeded = () => {
        // Database is being created for the first time, nothing to clear
        const db = request.result;

        // Create the spellbooks store if it doesn't exist
        if (!db.objectStoreNames.contains('spellbooks')) {
          db.createObjectStore('spellbooks', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        const db = request.result;

        // Check if spellbooks table exists
        if (!db.objectStoreNames.contains('spellbooks')) {
          db.close();
          resolve();
          return;
        }

        try {
          const transaction = db.transaction(['spellbooks'], 'readwrite');
          const store = transaction.objectStore('spellbooks');
          const clearRequest = store.clear();

          clearRequest.onsuccess = () => {
            db.close();
            resolve();
          };

          clearRequest.onerror = () => {
            db.close();
            resolve(); // Don't fail, just resolve
          };

          transaction.onerror = () => {
            db.close();
            resolve();
          };
        } catch (error) {
          db.close();
          resolve();
        }
      };

      request.onerror = () => {
        // Database access error, that's fine
        resolve();
      };
    });
  });
}
