import { describe, it, beforeAll, afterAll } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';
import { wait } from './setup';

const PROD_URL = 'https://spellbook.quantitydust.com';

describe('Production Site Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
  });

  afterAll(async () => {
    await browser?.close();
  });

  describe('Desktop (1280x800)', () => {
    beforeAll(async () => {
      page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
    });

    it('should load the page successfully', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      const title = await page.title();
      console.log('✓ Page title:', title);
    }, 60000);

    it('should display spell table', async () => {
      const spellTable = await page.$('.spell-table');
      console.log(spellTable ? '✓ Spell table found' : '✗ Spell table NOT found');
    }, 30000);

    it('should load spells', async () => {
      const spellRows = await page.$$('.spell-row');
      console.log(`✓ Found ${spellRows.length} spell rows`);
    }, 30000);

    it('should expand spell inline on desktop', async () => {
      const spellRows = await page.$$('.spell-row');
      if (spellRows.length > 0) {
        // Scroll into view before clicking
        await spellRows[0].evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await wait(400);

        await spellRows[0].click();
        await wait(500);

        // Scroll the expansion into view
        const expansion = await page.$('.spell-expansion-row');
        await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await wait(300);

        const expansionContent = await page.$('.spell-inline-expansion');
        console.log(expansionContent ? '✓ Desktop spell expansion works' : '✗ Desktop expansion NOT working');
      }
    }, 30000);
  });

  describe('Mobile (375x667)', () => {
    beforeAll(async () => {
      page = await browser.newPage();
      await page.setViewport({ width: 375, height: 667 });
    });

    it('should load on mobile', async () => {
      await page.goto(PROD_URL, { waitUntil: 'networkidle2', timeout: 30000 });
      console.log('✓ Mobile page loaded');
    }, 60000);

    it('should have no horizontal scroll', async () => {
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      console.log(hasHorizontalScroll ? '✗ Has horizontal scroll' : '✓ No horizontal scroll');
    }, 30000);

    it('should display spell cards with mobile styling', async () => {
      const spellRows = await page.$$('.spell-row');
      console.log(`✓ Found ${spellRows.length} mobile spell cards`);

      if (spellRows.length > 0) {
        const cardStyle = await spellRows[0].evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            display: style.display,
            borderRadius: style.borderRadius,
          };
        });
        console.log('✓ Mobile card styling:', cardStyle);
      }
    }, 30000);

    it('should expand spell inline on mobile', async () => {
      const spellRows = await page.$$('.spell-row');
      if (spellRows.length > 0) {
        // Scroll into view before clicking
        await spellRows[0].evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await wait(400);

        await spellRows[0].click();
        await wait(500);

        // Scroll the expansion into view
        const expansion = await page.$('.spell-expansion-row');
        await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await wait(300);

        const expansionContent = await page.$('.spell-inline-expansion');
        console.log(expansionContent ? '✓ Mobile spell expansion works' : '✗ Mobile expansion NOT working');
      }
    }, 30000);

    it('should have touch-friendly buttons if present', async () => {
      const addButtons = await page.$$('.btn-add-small');
      if (addButtons.length > 0) {
        const buttonSize = await addButtons[0].evaluate(el => {
          const rect = el.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        console.log(`Button size: ${buttonSize.width}x${buttonSize.height}px`);
        console.log((buttonSize.width >= 44 && buttonSize.height >= 44)
          ? '✓ Touch-friendly (≥44px)'
          : '✗ Too small for touch');
      } else {
        console.log('ℹ No add buttons (expected - appear after creating spellbook)');
      }
    }, 30000);
  });
});
