// E2E tests for spell hover tooltip functionality
// Using vitest globals (describe, it, expect, beforeAll, afterAll are globally available)
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad, wait } from './setup';

describe('Spell Tooltip E2E', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  it('should show tooltip when hovering over a spell row', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Hover over the first spell row
    await page.hover('.spell-row');
    await wait(300); // Wait for tooltip to appear

    // Check that tooltip is visible
    const tooltip = await page.$('.spell-tooltip');
    expect(tooltip).toBeTruthy();

    // Verify tooltip is visible
    const isVisible = await page.evaluate(() => {
      const tooltip = document.querySelector('.spell-tooltip');
      if (!tooltip) return false;
      const styles = window.getComputedStyle(tooltip);
      return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
    });
    expect(isVisible).toBe(true);
  }, 30000);

  it('should display spell name in tooltip', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Get the first spell name from the table
    const spellName = await page.$eval('.spell-row .spell-name', el =>
      el.textContent?.replace(/[CR]/g, '').trim() || ''
    );

    // Hover over the first spell row
    await page.hover('.spell-row');
    await wait(300);

    // Check that tooltip contains the spell name
    const tooltipText = await page.$eval('.spell-tooltip', el => el.textContent || '');
    expect(tooltipText).toContain(spellName);
  }, 30000);

  it('should display spell description in tooltip', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Hover over the first spell row
    await page.hover('.spell-row');
    await wait(300);

    // Check that tooltip contains description text
    const hasDescription = await page.evaluate(() => {
      const tooltip = document.querySelector('.spell-tooltip');
      if (!tooltip) return false;
      const text = tooltip.textContent || '';
      // Description should be reasonably long (more than just the spell name)
      return text.length > 50;
    });
    expect(hasDescription).toBe(true);
  }, 30000);

  it('should hide tooltip when mouse leaves spell row', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Hover over first spell row
    await page.hover('.spell-row');
    await wait(300);

    // Verify tooltip is visible
    let isVisible = await page.evaluate(() => {
      const tooltip = document.querySelector('.spell-tooltip');
      if (!tooltip) return false;
      const styles = window.getComputedStyle(tooltip);
      return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
    });
    expect(isVisible).toBe(true);

    // Move mouse away to a safe location (far from the table)
    await page.mouse.move(10, 10);
    await wait(300);

    // Verify tooltip is hidden
    isVisible = await page.evaluate(() => {
      const tooltip = document.querySelector('.spell-tooltip');
      if (!tooltip) return false; // If no tooltip element, it's hidden
      const styles = window.getComputedStyle(tooltip);
      return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
    });
    expect(isVisible).toBe(false);
  }, 30000);

  it('should show different content when hovering over different spells', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Get all spell rows
    const spellRows = await page.$$('.spell-row');
    if (spellRows.length < 2) {
      throw new Error('Need at least 2 spells for this test');
    }

    // Hover over first spell and get tooltip content
    await spellRows[0].hover();
    await wait(300);
    const firstTooltipText = await page.$eval('.spell-tooltip', el => el.textContent || '');

    // Move away
    await page.hover('.app-header');
    await wait(200);

    // Hover over second spell and get tooltip content
    await spellRows[1].hover();
    await wait(300);
    const secondTooltipText = await page.$eval('.spell-tooltip', el => el.textContent || '');

    // Tooltips should be different
    expect(firstTooltipText).not.toBe(secondTooltipText);
  }, 30000);

  it('should position tooltip near the cursor', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Hover over a spell row
    await page.hover('.spell-row');
    await wait(300);

    // Check tooltip position
    const tooltipPosition = await page.evaluate(() => {
      const tooltip = document.querySelector('.spell-tooltip') as HTMLElement;
      if (!tooltip) return null;
      const rect = tooltip.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      };
    });

    expect(tooltipPosition).toBeTruthy();
    // Tooltip should be visible on screen (not off-screen)
    expect(tooltipPosition!.top).toBeGreaterThanOrEqual(0);
    expect(tooltipPosition!.left).toBeGreaterThanOrEqual(0);
  }, 30000);
});
