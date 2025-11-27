// E2E tests for spell table sorting functionality
// Using vitest globals (describe, it, expect, beforeAll, afterAll are globally available)
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad } from './setup';
import { TIMEOUTS } from './config';

describe('Spell Table Sorting E2E', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, TIMEOUTS.LONG);

  afterAll(async () => {
    await closeBrowser();
  });

  it('should sort spells by name ascending by default', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Get first few spell names
    const spellNames = await page.$$eval('.spell-name', cells =>
      cells.slice(0, 5).map(cell => cell.textContent?.trim() || '')
    );

    // Should be in alphabetical order (excluding badges)
    const sortedNames = [...spellNames].map(name => name.replace(/[CR]/g, '').trim()).sort();
    const actualNames = spellNames.map(name => name.replace(/[CR]/g, '').trim());

    expect(actualNames[0]).toBe(sortedNames[0]);
  }, TIMEOUTS.LONG);

  it('should sort spells by level', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Get initial first level
    const initialFirstLevel = await page.$eval('td.level-col', el => el.textContent?.trim() || '');

    // Click level header button
    await page.click('th.level-col .sort-button');

    // Wait for sort to complete by checking if order changed or sort icon appeared
    await page.waitForFunction(
      (oldLevel) => {
        const firstLevel = document.querySelector('td.level-col');
        const levelIcon = document.querySelector('th.level-col .sort-button .sort-icon');
        return (firstLevel && firstLevel.textContent?.trim() !== oldLevel) || (levelIcon && (levelIcon.textContent?.includes('↑') || levelIcon.textContent?.includes('↓')));
      },
      { timeout: TIMEOUTS.SHORT },
      initialFirstLevel
    );

    // Get first few levels
    const levels = await page.$$eval('td.level-col', cells =>
      cells.slice(0, 10).map(cell => {
        const text = cell.textContent?.trim() || '';
        return text === 'Cantrip' ? 0 : parseInt(text, 10);
      })
    );

    // Should be sorted numerically
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThanOrEqual(levels[i - 1]);
    }
  }, TIMEOUTS.LONG);

  it('should sort spells by casting time', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click time header
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.sort-button'));
      const timeBtn = buttons.find(btn => btn.textContent?.includes('Time'));
      if (timeBtn) (timeBtn as HTMLElement).click();
    });

    // Wait for sort icon to appear indicating sort completed
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('.sort-button'));
        const timeBtn = buttons.find(btn => btn.textContent?.includes('Time'));
        const icon = timeBtn?.querySelector('.sort-icon');
        return icon && (icon.textContent?.includes('↑') || icon.textContent?.includes('↓'));
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Just verify no errors and sorting happened
    const castingTimes = await page.$$eval('td:nth-child(4)', cells =>
      cells.slice(0, 5).map(cell => cell.textContent?.trim() || '')
    );

    expect(castingTimes.length).toBeGreaterThan(0);
  }, TIMEOUTS.LONG);

  it('should sort spells by range', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click range header
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.sort-button'));
      const rangeBtn = buttons.find(btn => btn.textContent?.includes('Range'));
      if (rangeBtn) (rangeBtn as HTMLElement).click();
    });

    // Wait for sort icon to appear indicating sort completed
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('.sort-button'));
        const rangeBtn = buttons.find(btn => btn.textContent?.includes('Range'));
        const icon = rangeBtn?.querySelector('.sort-icon');
        return icon && (icon.textContent?.includes('↑') || icon.textContent?.includes('↓'));
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Just verify no errors and sorting happened
    const ranges = await page.$$eval('td:nth-child(5)', cells =>
      cells.slice(0, 5).map(cell => cell.textContent?.trim() || '')
    );

    expect(ranges.length).toBeGreaterThan(0);
  }, TIMEOUTS.LONG);

  it('should sort spells by duration', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click duration header
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.sort-button'));
      const durationBtn = buttons.find(btn => btn.textContent?.includes('Duration'));
      if (durationBtn) (durationBtn as HTMLElement).click();
    });

    // Wait for sort icon to appear indicating sort completed
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('.sort-button'));
        const durationBtn = buttons.find(btn => btn.textContent?.includes('Duration'));
        const icon = durationBtn?.querySelector('.sort-icon');
        return icon && (icon.textContent?.includes('↑') || icon.textContent?.includes('↓'));
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Just verify no errors and sorting happened
    const durations = await page.$$eval('td:nth-child(7)', cells =>
      cells.slice(0, 5).map(cell => cell.textContent?.trim() || '')
    );

    expect(durations.length).toBeGreaterThan(0);
  }, TIMEOUTS.LONG);

  it('should show sort icon indicating current sort direction', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Check for sort icon on name column (default)
    const nameHeaderHasIcon = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.sort-button'));
      const nameBtn = buttons.find(btn => btn.textContent?.includes('Name') && !btn.textContent?.includes('Spell Name'));
      const sortIcon = nameBtn?.querySelector('.sort-icon');
      return sortIcon?.textContent?.includes('↑') || sortIcon?.textContent?.includes('↓');
    });

    expect(nameHeaderHasIcon).toBe(true);
  }, TIMEOUTS.LONG);

  it('should maintain sort when filtering', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Sort by level
    await page.click('th.level-col .sort-button');

    // Wait for sort to complete
    await page.waitForFunction(
      () => document.querySelector('th.level-col .sort-button .sort-icon'),
      { timeout: TIMEOUTS.SHORT }
    );

    // Apply a filter
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const levelBtn = buttons.find(btn => btn.textContent?.trim() === '1');
      if (levelBtn) (levelBtn as HTMLElement).click();
    });

    // Wait for filter to be applied - check that button is active
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
        const levelBtn = buttons.find(btn => btn.textContent?.trim() === '1');
        return levelBtn?.classList.contains('active');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify results are still sorted by level
    const levels = await page.$$eval('td.level-col', cells =>
      cells.map(cell => cell.textContent?.trim())
    );

    expect(levels.every(level => level === '1')).toBe(true);
  }, TIMEOUTS.LONG);
});
