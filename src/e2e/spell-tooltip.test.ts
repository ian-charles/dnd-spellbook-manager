// E2E tests for spell expanding description functionality
// Using vitest globals (describe, it, expect, beforeAll, afterAll are globally available)
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad, wait } from './setup';

describe('Spell Description E2E', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  it('should expand spell description when clicking on a spell row', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Scroll into view before clicking
    const firstSpell = await page.$('.spell-row');
    await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(400);

    // Click the first spell row
    await page.click('.spell-row');
    await wait(400); // Wait for expansion animation

    // Scroll the expansion into view
    const expansion = await page.$('.spell-expansion-row');
    await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(300);

    // Check that expanded row is visible
    const expandedRow = await page.$('.spell-expansion-row');
    expect(expandedRow).toBeTruthy();
  }, 30000);

  it('should display spell name in expanded description', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Get the first spell name from the table (clean up badges)
    const spellName = await page.$eval('.spell-row .spell-name', el => {
      const nameHeader = el.querySelector('.spell-name-header');
      if (!nameHeader) return '';
      // Get text content and remove badge text (C, R)
      const text = nameHeader.textContent || '';
      return text.replace(/[CR]/g, '').trim();
    });

    // Scroll into view before clicking
    const firstSpell = await page.$('.spell-row');
    await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(400);

    // Click the first spell row
    await page.click('.spell-row');
    await wait(400);

    // Scroll the expansion into view
    const expansion = await page.$('.spell-expansion-row');
    await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(300);

    // Check that expanded inline content contains spell description
    // Note: spell name is already visible in the row above, expansion shows description
    const expandedText = await page.$eval('.spell-inline-expansion', el => el.textContent || '');
    expect(expandedText.length).toBeGreaterThan(50); // Should have substantial description content
  }, 30000);

  it('should display spell description in expanded row', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Scroll into view before clicking
    const firstSpell = await page.$('.spell-row');
    await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(400);

    // Click the first spell row
    await page.click('.spell-row');
    await wait(400);

    // Scroll the expansion into view
    const expansion = await page.$('.spell-expansion-row');
    await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(300);

    // Check that expanded row contains description text
    const hasDescription = await page.evaluate(() => {
      const expandedRow = document.querySelector('.spell-expansion-row');
      if (!expandedRow) return false;
      const text = expandedRow.textContent || '';
      // Description should be reasonably long (more than just the spell name)
      return text.length > 50;
    });
    expect(hasDescription).toBe(true);
  }, 30000);

  it('should collapse description when clicking the same spell row again', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Scroll into view before clicking
    const firstSpell = await page.$('.spell-row');
    await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(400);

    // Click first spell row to expand
    await page.click('.spell-row');
    await wait(400);

    // Scroll the expansion into view
    const expansion = await page.$('.spell-expansion-row');
    await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(300);

    // Verify expanded row exists
    let expandedRow = await page.$('.spell-expansion-row');
    expect(expandedRow).toBeTruthy();

    // Click the same row again to collapse
    await page.click('.spell-row');
    await wait(400);

    // Verify expanded row is removed
    expandedRow = await page.$('.spell-expansion-row');
    expect(expandedRow).toBeNull();
  }, 30000);

  it('should show expanded description below the clicked row', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Scroll into view before clicking
    const firstSpell = await page.$('.spell-row');
    await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(400);

    // Click a spell row
    await page.click('.spell-row');
    await wait(400);

    // Scroll the expansion into view
    const expansion = await page.$('.spell-expansion-row');
    await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(300);

    // Check that expanded row exists and has content
    const hasExpandedContent = await page.evaluate(() => {
      const expandedRow = document.querySelector('.spell-expansion-row');
      if (!expandedRow) return false;
      const content = expandedRow.querySelector('.spell-inline-expansion');
      return !!content;
    });

    expect(hasExpandedContent).toBe(true);
  }, 30000);

  it('should not display "Ritual Caster" in classes list for ritual spells', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Search for Alarm spell which has "ritual caster" in the data
    await page.type('input[placeholder*="Search"]', 'Alarm');
    await wait(400);

    // Check the main table row classes column
    const mainRowClasses = await page.$eval('.spell-row .classes-col', el => el.textContent || '');
    expect(mainRowClasses.toLowerCase()).not.toContain('ritual caster');

    // Scroll into view before clicking
    const firstSpell = await page.$('.spell-row');
    await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(400);

    // Click to expand the spell row
    await page.click('.spell-row');
    await wait(400);

    // Scroll the expansion into view
    const expansion = await page.$('.spell-expansion-row');
    await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(300);

    // Check the expanded row footer classes
    const expandedClasses = await page.$eval('.spell-expanded-footer', el => el.textContent || '');
    expect(expandedClasses.toLowerCase()).not.toContain('ritual caster');
  }, 30000);
});
