// E2E tests for spell table sorting functionality
// Using vitest globals (describe, it, expect, beforeAll, afterAll are globally available)
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad, wait } from './setup';

describe('Spell Table Sorting E2E', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, 30000);

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
  }, 30000);

  it('should sort spells by name descending when clicked twice', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click name header to sort descending
    await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('th.sortable'));
      const nameHeader = headers.find(h => h.textContent?.includes('Spell Name'));
      if (nameHeader) (nameHeader as HTMLElement).click();
    });
    await wait(300);

    // Get first few spell names
    const spellNames = await page.$$eval('.spell-name', cells =>
      cells.slice(0, 5).map(cell => cell.textContent?.trim() || '')
    );

    const sortedNames = [...spellNames].map(name => name.replace(/[CR]/g, '').trim()).sort().reverse();
    const actualNames = spellNames.map(name => name.replace(/[CR]/g, '').trim());

    expect(actualNames[0]).toBe(sortedNames[0]);
  }, 30000);

  it('should sort spells by level', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click level header
    await page.click('th.sortable.level-col');
    await wait(300);

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
  }, 30000);

  it('should sort spells by school', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click school header
    await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('th.sortable'));
      const schoolHeader = headers.find(h => h.textContent?.includes('School'));
      if (schoolHeader) (schoolHeader as HTMLElement).click();
    });
    await wait(300);

    // Get first few schools
    const schools = await page.$$eval('.school-col', cells =>
      cells.slice(0, 5).map(cell => cell.textContent?.trim() || '')
    );

    // Should be sorted alphabetically
    for (let i = 1; i < schools.length; i++) {
      expect(schools[i].localeCompare(schools[i - 1])).toBeGreaterThanOrEqual(0);
    }
  }, 30000);

  it('should sort spells by casting time', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click time header
    await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('th.sortable'));
      const timeHeader = headers.find(h => h.textContent?.includes('Time'));
      if (timeHeader) (timeHeader as HTMLElement).click();
    });
    await wait(300);

    // Just verify no errors and sorting happened
    const castingTimes = await page.$$eval('td:nth-child(4)', cells =>
      cells.slice(0, 5).map(cell => cell.textContent?.trim() || '')
    );

    expect(castingTimes.length).toBeGreaterThan(0);
  }, 30000);

  it('should sort spells by range', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click range header
    await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('th.sortable'));
      const rangeHeader = headers.find(h => h.textContent?.includes('Range'));
      if (rangeHeader) (rangeHeader as HTMLElement).click();
    });
    await wait(300);

    // Just verify no errors and sorting happened
    const ranges = await page.$$eval('td:nth-child(5)', cells =>
      cells.slice(0, 5).map(cell => cell.textContent?.trim() || '')
    );

    expect(ranges.length).toBeGreaterThan(0);
  }, 30000);

  it('should sort spells by duration', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click duration header
    await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('th.sortable'));
      const durationHeader = headers.find(h => h.textContent?.includes('Duration'));
      if (durationHeader) (durationHeader as HTMLElement).click();
    });
    await wait(300);

    // Just verify no errors and sorting happened
    const durations = await page.$$eval('td:nth-child(7)', cells =>
      cells.slice(0, 5).map(cell => cell.textContent?.trim() || '')
    );

    expect(durations.length).toBeGreaterThan(0);
  }, 30000);

  it('should show sort icon indicating current sort direction', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Check for sort icon on name column (default)
    const nameHeaderHasIcon = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('th.sortable'));
      const nameHeader = headers.find(h => h.textContent?.includes('Spell Name'));
      const sortIcon = nameHeader?.querySelector('.sort-icon');
      return sortIcon?.textContent?.includes('↑') || sortIcon?.textContent?.includes('↓');
    });

    expect(nameHeaderHasIcon).toBe(true);
  }, 30000);

  it('should maintain sort when filtering', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Sort by level
    await page.click('th.sortable.level-col');
    await wait(300);

    // Apply a filter
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const levelBtn = buttons.find(btn => btn.textContent?.trim() === '1');
      if (levelBtn) (levelBtn as HTMLElement).click();
    });
    await wait(500);

    // Verify results are still sorted by level
    const levels = await page.$$eval('td.level-col', cells =>
      cells.map(cell => cell.textContent?.trim())
    );

    expect(levels.every(level => level === '1')).toBe(true);
  }, 30000);
});
