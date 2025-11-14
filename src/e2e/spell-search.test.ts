// E2E tests for spell search functionality
// Using vitest globals (describe, it, expect, beforeAll, afterAll are globally available)
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad, wait } from './setup';

describe('Spell Search E2E', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  it('should search spells by name', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Type in search box
    await page.type('.search-input', 'fireball');
    await wait(500);

    // Verify results
    const spellNames = await page.$$eval('.spell-name', cells =>
      cells.map(cell => cell.textContent?.toLowerCase() || '')
    );
    expect(spellNames.length).toBeGreaterThan(0);
    expect(spellNames.some(name => name.includes('fireball'))).toBe(true);
  }, 30000);

  it('should search spells case-insensitively', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Type uppercase search
    await page.type('.search-input', 'MAGIC');
    await wait(500);

    // Should find magic-related spells
    const spellNames = await page.$$eval('.spell-name', cells =>
      cells.map(cell => cell.textContent?.toLowerCase() || '')
    );
    expect(spellNames.length).toBeGreaterThan(0);
    expect(spellNames.some(name => name.includes('magic'))).toBe(true);
  }, 30000);

  it('should search spells by class name', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Search for wizard spells
    await page.type('.search-input', 'wizard');
    await wait(500);

    // Verify all results include wizard
    const classesCells = await page.$$eval('.classes-col', cells =>
      cells.map(cell => cell.textContent?.toLowerCase() || '')
    );
    expect(classesCells.every(classes => classes.includes('wizard'))).toBe(true);
  }, 30000);

  it('should search spells by school name', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Search for evocation spells
    await page.type('.search-input', 'evocation');
    await wait(500);

    // Verify all results are evocation school
    const schoolCells = await page.$$eval('.school-col', cells =>
      cells.map(cell => cell.textContent?.toLowerCase() || '')
    );
    expect(schoolCells.every(school => school === 'evocation')).toBe(true);
  }, 30000);

  it('should show no results for non-existent spell', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Search for non-existent spell
    await page.type('.search-input', 'zzzznonexistent');
    await wait(500);

    // Should show empty message
    const emptyMessage = await page.$('.spell-table-empty');
    expect(emptyMessage).toBeTruthy();

    const messageText = await page.$eval('.spell-table-empty', el => el.textContent);
    expect(messageText).toContain('No spells found');
  }, 30000);

  it('should clear search and show all spells', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Search for something
    await page.type('.search-input', 'fireball');
    await wait(500);

    // Clear search
    await page.click('.search-input', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await wait(500);

    // Should show all spells again
    const headerText = await page.$eval('.app-header p', el => el.textContent);
    expect(headerText).toContain('319 results');
  }, 30000);

  it('should combine search with filters', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Search for wizard spells
    await page.type('.search-input', 'wizard');
    await wait(300);

    // Filter by level 1
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const levelBtn = buttons.find(btn => btn.textContent?.trim() === '1');
      if (levelBtn) (levelBtn as HTMLElement).click();
    });
    await wait(500);

    // Verify results match both criteria
    const classesCells = await page.$$eval('td.classes-col', cells =>
      cells.map(cell => cell.textContent?.toLowerCase() || '')
    );
    const levelCells = await page.$$eval('td.level-col', cells =>
      cells.map(cell => cell.textContent?.trim())
    );

    expect(classesCells.every(classes => classes.includes('wizard'))).toBe(true);
    expect(levelCells.every(level => level === '1')).toBe(true);
  }, 30000);
});
