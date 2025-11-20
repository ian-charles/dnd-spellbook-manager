// Tests for spell selection and batch add functionality
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad } from './setup';

describe('Spell Selection and Batch Add', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
    await page.setViewport({ width: 1280, height: 800 });
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  beforeEach(async () => {
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);
  });

  describe('Batch Add Section Visibility', () => {
    it('should display batch add section even when no spells are selected', async () => {
      const batchAddContainer = await page.$('.batch-add-container');
      expect(batchAddContainer).toBeTruthy();
    }, 10000);

    it('should display spellbook dropdown when no spells are selected', async () => {
      const dropdown = await page.$('[data-testid="spellbook-dropdown"]');
      expect(dropdown).toBeTruthy();
    }, 10000);

    it('should display add button when no spells are selected', async () => {
      const addButton = await page.$('[data-testid="btn-add-selected"]');
      expect(addButton).toBeTruthy();
    }, 10000);
  });

  describe('Button State Based on Selection', () => {
    it('should disable add button when no spells are selected', async () => {
      const addButton = await page.$('[data-testid="btn-add-selected"]');
      const isDisabled = await addButton?.evaluate((el) => (el as HTMLButtonElement).disabled);
      expect(isDisabled).toBe(true);
    }, 10000);

    it('should disable add button when no spellbook is selected', async () => {
      // Select a spell
      const checkbox = await page.$('[data-testid="spell-checkbox"]');
      await checkbox?.click();

      const addButton = await page.$('[data-testid="btn-add-selected"]');
      const isDisabled = await addButton?.evaluate((el) => (el as HTMLButtonElement).disabled);
      expect(isDisabled).toBe(true);
    }, 10000);

    it('should enable add button when spell and spellbook are selected', async () => {
      // Select a spell
      const checkbox = await page.$('[data-testid="spell-checkbox"]');
      await checkbox?.click();

      // Select a spellbook (assuming "new" option exists)
      const dropdown = await page.$('[data-testid="spellbook-dropdown"]');
      await dropdown?.select('new');

      const addButton = await page.$('[data-testid="btn-add-selected"]');
      const isDisabled = await addButton?.evaluate((el) => (el as HTMLButtonElement).disabled);
      expect(isDisabled).toBe(false);
    }, 10000);
  });

  describe('Unselect All Button', () => {
    it('should display unselect all button', async () => {
      const unselectButton = await page.$('[data-testid="btn-unselect-all"]');
      expect(unselectButton).toBeTruthy();
    }, 10000);

    it('should unselect all spells when clicked', async () => {
      // Select multiple spells
      const checkboxes = await page.$$('[data-testid="spell-checkbox"]');
      await checkboxes[0]?.click();
      await checkboxes[1]?.click();
      await checkboxes[2]?.click();

      // Verify spells are selected
      let selectedCount = await page.$$eval(
        '[data-testid="spell-checkbox"]:checked',
        (els) => els.length
      );
      expect(selectedCount).toBe(3);

      // Click unselect all
      const unselectButton = await page.$('[data-testid="btn-unselect-all"]');
      await unselectButton?.click();

      // Verify no spells are selected
      selectedCount = await page.$$eval(
        '[data-testid="spell-checkbox"]:checked',
        (els) => els.length
      );
      expect(selectedCount).toBe(0);
    }, 10000);

    it('should disable unselect all button when no spells are selected', async () => {
      const unselectButton = await page.$('[data-testid="btn-unselect-all"]');
      const isDisabled = await unselectButton?.evaluate((el) => (el as HTMLButtonElement).disabled);
      expect(isDisabled).toBe(true);
    }, 10000);

    it('should enable unselect all button when spells are selected', async () => {
      // Select a spell
      const checkbox = await page.$('[data-testid="spell-checkbox"]');
      await checkbox?.click();

      const unselectButton = await page.$('[data-testid="btn-unselect-all"]');
      const isDisabled = await unselectButton?.evaluate((el) => (el as HTMLButtonElement).disabled);
      expect(isDisabled).toBe(false);
    }, 10000);
  });

  describe('Button Text Updates', () => {
    it('should show "Add 0 Spells" when no spells selected', async () => {
      const addButton = await page.$('[data-testid="btn-add-selected"]');
      const buttonText = await addButton?.evaluate((el) => el.textContent?.trim());
      expect(buttonText).toBe('Add 0 Spells');
    }, 10000);

    it('should show "Add 1 Spell" when one spell selected', async () => {
      const checkbox = await page.$('[data-testid="spell-checkbox"]');
      await checkbox?.click();

      const addButton = await page.$('[data-testid="btn-add-selected"]');
      const buttonText = await addButton?.evaluate((el) => el.textContent?.trim());
      expect(buttonText).toBe('Add 1 Spell');
    }, 10000);

    it('should show "Add X Spells" when multiple spells selected', async () => {
      const checkboxes = await page.$$('[data-testid="spell-checkbox"]');
      await checkboxes[0]?.click();
      await checkboxes[1]?.click();
      await checkboxes[2]?.click();

      const addButton = await page.$('[data-testid="btn-add-selected"]');
      const buttonText = await addButton?.evaluate((el) => el.textContent?.trim());
      expect(buttonText).toBe('Add 3 Spells');
    }, 10000);
  });
});
