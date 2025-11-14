import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import puppeteer, { Browser, Page } from 'puppeteer';
import { startDevServer, stopDevServer, getDevServerUrl } from './setup';

describe('Spellbook Management E2E', () => {
  let browser: Browser;
  let page: Page;
  const baseUrl = getDevServerUrl();

  beforeAll(async () => {
    await startDevServer();
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    await stopDevServer();
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
      await page.waitForSelector('.spell-table');

      // Should see add buttons in table
      const addButton = await page.$('[data-testid="btn-add-spell"]');
      expect(addButton).toBeTruthy();
    });

    it('should open spellbook selector when clicking add', async () => {
      await page.goto(baseUrl);
      await page.waitForSelector('[data-testid="btn-add-spell"]');

      await page.click('[data-testid="btn-add-spell"]');

      // Should see spellbook selector
      await page.waitForSelector('[data-testid="spellbook-selector"]');
      const selector = await page.$('[data-testid="spellbook-selector"]');
      expect(selector).toBeTruthy();
    });

    it('should add spell to selected spellbook', async () => {
      await page.goto(baseUrl);
      await page.waitForSelector('[data-testid="btn-add-spell"]');

      // Click first add button
      await page.click('[data-testid="btn-add-spell"]');
      await page.waitForSelector('[data-testid="spellbook-selector"]');

      // Select first spellbook
      await page.click('[data-testid^="select-spellbook-"]');

      // Should show success feedback
      await page.waitForSelector('[data-testid="add-spell-success"]', { timeout: 2000 });
    });
  });

  describe('Spellbook Detail View', () => {
    it('should navigate to spellbook detail when clicking spellbook', async () => {
      await page.goto(`${baseUrl}#/spellbooks`);
      await page.waitForSelector('[data-testid^="spellbook-item-"]');

      await page.click('[data-testid^="spellbook-item-"]');

      // Should see detail view
      await page.waitForSelector('[data-testid="spellbook-detail"]');
      const detail = await page.$('[data-testid="spellbook-detail"]');
      expect(detail).toBeTruthy();
    });

    it('should show spellbook name in detail view', async () => {
      const name = await page.$eval('[data-testid="spellbook-detail-name"]', el => el.textContent);
      expect(name).toContain('My Wizard Spells');
    });

    it('should show spell list in detail view', async () => {
      const spellList = await page.$('[data-testid="spellbook-spell-list"]');
      expect(spellList).toBeTruthy();
    });

    it('should show added spell in detail view', async () => {
      const spells = await page.$$('[data-testid^="spellbook-spell-"]');
      expect(spells.length).toBeGreaterThan(0);
    });

    it('should toggle prepared status', async () => {
      await page.waitForSelector('[data-testid="toggle-prepared"]');

      // Get initial state
      const initialChecked = await page.$eval(
        '[data-testid="toggle-prepared"]',
        (el: any) => el.checked
      );

      // Toggle
      await page.click('[data-testid="toggle-prepared"]');

      // Wait a bit for state to update
      await page.waitForTimeout(100);

      // Check new state
      const newChecked = await page.$eval(
        '[data-testid="toggle-prepared"]',
        (el: any) => el.checked
      );

      expect(newChecked).toBe(!initialChecked);
    });
  });
});
