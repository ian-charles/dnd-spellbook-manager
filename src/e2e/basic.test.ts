// Basic E2E test to verify setup
// Using vitest globals (describe, it, expect, beforeAll, afterAll are globally available)
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad } from './setup';

describe('Basic E2E Test', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  it('should load the application', async () => {
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });

    const title = await page.title();
    expect(title).toBeTruthy();

    // Wait for app to load
    await page.waitForSelector('.app-header', { timeout: 10000 });

    const headerText = await page.$eval('.app-header h1', el => el.textContent);
    expect(headerText).toContain('Spellbook');
  }, 30000);

  it('should display spell count', async () => {
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);

    const headerText = await page.$eval('.app-header p', el => el.textContent);
    expect(headerText).toContain('Browse 319 spells');
  }, 30000);
});
