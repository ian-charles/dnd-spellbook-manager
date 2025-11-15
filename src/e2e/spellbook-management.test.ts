import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';
import { TEST_URL } from './setup';

describe('Spellbook Management E2E', () => {
  let browser: Browser;
  let page: Page;
  const baseUrl = TEST_URL;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });

  afterAll(async () => {
    await browser.close();
  });

  describe('Spellbook List View', () => {
    it('should show navigation to My Spellbooks', async () => {
      await page.goto(baseUrl);
      await page.waitForSelector('h1');

      // Look for navigation link or button to My Spellbooks
      const navLink = await page.$('[data-testid="nav-spellbooks"]');
      expect(navLink).toBeTruthy();
    });

    it('should navigate to My Spellbooks page', async () => {
      await page.goto(baseUrl);
      await page.waitForSelector('[data-testid="nav-spellbooks"]');

      await page.click('[data-testid="nav-spellbooks"]');

      // Should see spellbooks header
      await page.waitForSelector('[data-testid="spellbooks-header"]');
      const headerText = await page.$eval('[data-testid="spellbooks-header"]', el => el.textContent);
      expect(headerText).toContain('My Spellbooks');
    });

    it('should show empty state when no spellbooks exist', async () => {
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid="spellbooks-header"]');

      const emptyState = await page.$('[data-testid="spellbooks-empty"]');
      expect(emptyState).toBeTruthy();
    });

    it('should show create spellbook button', async () => {
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid="spellbooks-header"]');

      const createButton = await page.$('[data-testid="btn-create-spellbook"]');
      expect(createButton).toBeTruthy();
    });
  });

  describe('Create Spellbook', () => {
    it('should open create spellbook dialog', async () => {
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid="btn-create-spellbook"]');

      await page.click('[data-testid="btn-create-spellbook"]');

      // Should see dialog
      await page.waitForSelector('[data-testid="create-spellbook-dialog"]');
      const dialog = await page.$('[data-testid="create-spellbook-dialog"]');
      expect(dialog).toBeTruthy();
    });

    it('should create a new spellbook', async () => {
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid="btn-create-spellbook"]');

      await page.click('[data-testid="btn-create-spellbook"]');
      await page.waitForSelector('[data-testid="create-spellbook-dialog"]');

      // Fill in form
      await page.type('[data-testid="input-spellbook-name"]', 'My Wizard Spells');
      await page.click('[data-testid="btn-save-spellbook"]');

      // Should close dialog and show spellbook in list
      await page.waitForSelector('[data-testid^="spellbook-item-"]', { timeout: 3000 });
      const spellbookItems = await page.$$('[data-testid^="spellbook-item-"]');
      expect(spellbookItems.length).toBe(1);
    });

    it('should show spellbook name in list', async () => {
      // Assuming spellbook from previous test exists
      const spellbookName = await page.$eval(
        '[data-testid^="spellbook-item-"] [data-testid="spellbook-name"]',
        el => el.textContent
      );
      expect(spellbookName).toBe('My Wizard Spells');
    });
  });

  describe('Add Spell to Spellbook', () => {
    it('should show add to spellbook button when spellbooks exist', async () => {
      // Navigate to browse view
      await page.goto(baseUrl);
      await page.waitForSelector('.spell-table', { timeout: 10000 });

      // Should see add buttons in table
      const addButton = await page.$('[data-testid="btn-add-spell"]');
      expect(addButton).toBeTruthy();
    });

    it('should open spellbook selector when clicking add', async () => {
      await page.goto(baseUrl);
      await page.waitForSelector('[data-testid="btn-add-spell"]', { timeout: 10000 });

      await page.click('[data-testid="btn-add-spell"]');

      // Should see spellbook selector
      await page.waitForSelector('[data-testid="spellbook-selector"]', { timeout: 5000 });
      const selector = await page.$('[data-testid="spellbook-selector"]');
      expect(selector).toBeTruthy();
    });

    it('should add spell to selected spellbook', async () => {
      await page.goto(baseUrl);
      await page.waitForSelector('[data-testid="btn-add-spell"]', { timeout: 10000 });

      // Click first add button
      await page.click('[data-testid="btn-add-spell"]');
      await page.waitForSelector('[data-testid="spellbook-selector"]', { timeout: 5000 });

      // Select first spellbook
      await page.click('[data-testid^="select-spellbook-"]');

      // Should show success feedback
      await page.waitForSelector('[data-testid="add-spell-success"]', { timeout: 5000 });
    }, 60000);
  });

  describe('Spellbook Detail View', () => {
    it('should navigate to spellbook detail when clicking spellbook', async () => {
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid^="spellbook-item-"]', { timeout: 10000 });

      // Get the spellbook ID from the element
      const spellbookId = await page.$eval('[data-testid^="spellbook-item-"]', el => el.getAttribute('data-testid')?.replace('spellbook-item-', ''));

      // Navigate directly via hash
      await page.goto(`${baseUrl}#/spellbooks/${spellbookId}`);

      // Should see detail view
      await page.waitForSelector('[data-testid="spellbook-detail"]', { timeout: 10000 });
      const detail = await page.$('[data-testid="spellbook-detail"]');
      expect(detail).toBeTruthy();
    }, 60000);

    it('should show spellbook name in detail view', async () => {
      // Get spellbook ID and navigate directly
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid^="spellbook-item-"]', { timeout: 10000 });
      const spellbookId = await page.$eval('[data-testid^="spellbook-item-"]', el => el.getAttribute('data-testid')?.replace('spellbook-item-', ''));

      await page.goto(`${baseUrl}#/spellbooks/${spellbookId}`);
      await page.waitForSelector('[data-testid="spellbook-detail"]', { timeout: 10000 });

      // Now check for the name
      await page.waitForSelector('[data-testid="spellbook-detail-name"]', { timeout: 5000 });
      const name = await page.$eval('[data-testid="spellbook-detail-name"]', el => el.textContent);
      expect(name).toContain('My Wizard Spells');
    }, 60000);

    it('should show spell list in detail view', async () => {
      // Get spellbook ID and navigate directly
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid^="spellbook-item-"]', { timeout: 10000 });
      const spellbookId = await page.$eval('[data-testid^="spellbook-item-"]', el => el.getAttribute('data-testid')?.replace('spellbook-item-', ''));

      await page.goto(`${baseUrl}#/spellbooks/${spellbookId}`);
      await page.waitForSelector('[data-testid="spellbook-detail"]', { timeout: 10000 });

      // Check for spell list (may not exist if no spells)
      const spellList = await page.$('[data-testid="spellbook-spell-list"]');
      const emptyState = await page.$('.spellbook-detail-empty');

      // Should have either the spell list or empty state
      expect(spellList !== null || emptyState !== null).toBe(true);
    }, 60000);

    it('should show added spell in detail view', async () => {
      // Get spellbook ID and navigate directly
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid^="spellbook-item-"]', { timeout: 10000 });
      const spellbookId = await page.$eval('[data-testid^="spellbook-item-"]', el => el.getAttribute('data-testid')?.replace('spellbook-item-', ''));

      await page.goto(`${baseUrl}#/spellbooks/${spellbookId}`);
      await page.waitForSelector('[data-testid="spellbook-detail"]', { timeout: 10000 });

      // Wait a bit for spells to load
      await new Promise(resolve => setTimeout(resolve, 1000));

      const spells = await page.$$('[data-testid^="spellbook-spell-"]');
      expect(spells.length).toBeGreaterThan(0);
    }, 60000);

    it('should toggle prepared status', async () => {
      // Get spellbook ID and navigate directly
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid^="spellbook-item-"]', { timeout: 10000 });
      const spellbookId = await page.$eval('[data-testid^="spellbook-item-"]', el => el.getAttribute('data-testid')?.replace('spellbook-item-', ''));

      await page.goto(`${baseUrl}#/spellbooks/${spellbookId}`);
      await page.waitForSelector('[data-testid="spellbook-detail"]', { timeout: 10000 });

      await page.waitForSelector('[data-testid="toggle-prepared"]', { timeout: 10000 });

      // Get initial state
      const initialChecked = await page.$eval(
        '[data-testid="toggle-prepared"]',
        (el: any) => el.checked
      );

      // Toggle
      await page.click('[data-testid="toggle-prepared"]');

      // Wait a bit for state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check new state
      const newChecked = await page.$eval(
        '[data-testid="toggle-prepared"]',
        (el: any) => el.checked
      );

      expect(newChecked).toBe(!initialChecked);
    }, 60000);

    it('should show spell tooltip when clicking on spell row in spellbook', async () => {
      // Get spellbook ID and navigate directly
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid^="spellbook-item-"]', { timeout: 10000 });
      const spellbookId = await page.$eval('[data-testid^="spellbook-item-"]', el => el.getAttribute('data-testid')?.replace('spellbook-item-', ''));

      await page.goto(`${baseUrl}#/spellbooks/${spellbookId}`);
      await page.waitForSelector('[data-testid="spellbook-detail"]', { timeout: 10000 });
      await page.waitForSelector('.spell-row', { timeout: 10000 });

      // Click the first spell row
      await page.click('.spell-row');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check that tooltip is visible
      const tooltip = await page.$('.spell-tooltip');
      expect(tooltip).toBeTruthy();

      // Verify tooltip is actually visible
      const isVisible = await page.evaluate(() => {
        const tooltip = document.querySelector('.spell-tooltip');
        if (!tooltip) return false;
        const styles = window.getComputedStyle(tooltip);
        return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
      });
      expect(isVisible).toBe(true);
    }, 60000);

    it('should hide tooltip when clicking same spell row again in spellbook', async () => {
      // Get spellbook ID and navigate directly
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid^="spellbook-item-"]', { timeout: 10000 });
      const spellbookId = await page.$eval('[data-testid^="spellbook-item-"]', el => el.getAttribute('data-testid')?.replace('spellbook-item-', ''));

      await page.goto(`${baseUrl}#/spellbooks/${spellbookId}`);
      await page.waitForSelector('[data-testid="spellbook-detail"]', { timeout: 10000 });
      await page.waitForSelector('.spell-row', { timeout: 10000 });

      // Click to show tooltip
      await page.click('.spell-row');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Verify tooltip is visible
      let isVisible = await page.evaluate(() => {
        const tooltip = document.querySelector('.spell-tooltip');
        if (!tooltip) return false;
        const styles = window.getComputedStyle(tooltip);
        return styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0';
      });
      expect(isVisible).toBe(true);

      // Click the same row again to hide tooltip
      await page.click('.spell-row');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Verify tooltip is hidden
      isVisible = await page.evaluate(() => {
        const tooltip = document.querySelector('.spell-tooltip');
        if (!tooltip) return true; // No tooltip element means it's hidden
        const styles = window.getComputedStyle(tooltip);
        return styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0';
      });
      expect(isVisible).toBe(true);
    }, 60000);

    it('should have sortable column headers in spellbook detail view', async () => {
      // Get spellbook ID and navigate directly
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid^="spellbook-item-"]', { timeout: 10000 });
      const spellbookId = await page.$eval('[data-testid^="spellbook-item-"]', el => el.getAttribute('data-testid')?.replace('spellbook-item-', ''));

      await page.goto(`${baseUrl}#/spellbooks/${spellbookId}`);
      await page.waitForSelector('[data-testid="spellbook-detail"]', { timeout: 10000 });
      await page.waitForSelector('.spell-row', { timeout: 10000 });

      // Wait for the table to be in the spellbook detail view
      const isInSpellbookDetail = await page.evaluate(() => {
        return !!document.querySelector('[data-testid="spellbook-detail"]');
      });
      expect(isInSpellbookDetail).toBe(true);

      // Find sortable headers in spellbook detail table
      const hasSortableHeaders = await page.evaluate(() => {
        const detail = document.querySelector('[data-testid="spellbook-detail"]');
        if (!detail) return false;
        const sortableHeaders = detail.querySelectorAll('th.sortable');
        return sortableHeaders.length > 0;
      });

      // Sorting should be available
      expect(hasSortableHeaders).toBe(true);

      // Verify sort icons are present
      const hasSortIcons = await page.evaluate(() => {
        const detail = document.querySelector('[data-testid="spellbook-detail"]');
        if (!detail) return false;
        const sortIcons = detail.querySelectorAll('.sort-icon');
        return sortIcons.length > 0;
      });

      expect(hasSortIcons).toBe(true);
    }, 60000);
  });
});
