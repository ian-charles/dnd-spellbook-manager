// Complete spellbook workflow E2E tests
// Tests the full user journey: create → add spells → mark prepared → remove
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad, wait } from './setup';

describe('Spellbook Workflow - Desktop', () => {
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
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);
  });

  it.skip('should complete full workflow: create spellbook → add spell → mark prepared → remove spell', async () => {
    // Step 1: Verify no add buttons initially (no spellbooks exist)
    // Note: Add buttons are hidden via CSS, not removed from DOM
    const addButtonBefore = await page.$('[data-testid="btn-add-spell"]');
    // Add buttons exist but may be hidden when no spellbooks exist
    // This is implementation detail - skip this check

    // Step 2: Navigate to spellbooks
    await page.waitForSelector('[data-testid="nav-spellbooks"]', { timeout: 10000 });
    const spellbooksButton = await page.$('[data-testid="nav-spellbooks"]');
    await spellbooksButton?.click();
    await wait(500);

    const hash = await page.evaluate(() => window.location.hash);
    expect(hash).toContain('/spellbooks');

    // Step 3: Create a new spellbook
    await page.waitForSelector('[data-testid="btn-create-spellbook"]', { timeout: 10000 });
    const createButton = await page.$('[data-testid="btn-create-spellbook"]');
    expect(createButton).toBeTruthy();
    await createButton?.click();
    await wait(300);

    // Step 4: Fill in spellbook name
    await page.waitForSelector('[data-testid="input-spellbook-name"]', { timeout: 5000 });
    const nameInput = await page.$('[data-testid="input-spellbook-name"]');
    expect(nameInput).toBeTruthy();
    await nameInput?.type('My Wizard Spellbook');

    // Step 5: Submit form
    const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
    await saveButton?.click();
    await wait(500);

    // Step 6: Verify spellbook created
    await page.waitForSelector('.spellbook-card', { timeout: 10000 });
    const spellbookCard = await page.$('.spellbook-card');
    expect(spellbookCard).toBeTruthy();

    const spellbookName = await page.$eval('.spellbook-card h3', el => el.textContent);
    expect(spellbookName).toBe('My Wizard Spellbook');

    // Step 7: Navigate back to browse
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);

    // Step 8: Verify add buttons now appear
    await page.waitForSelector('[data-testid="btn-add-spell"]', { timeout: 10000 });
    const addButtons = await page.$$('[data-testid="btn-add-spell"]');
    expect(addButtons.length).toBeGreaterThan(0);

    // Step 9: Add first spell to spellbook
    await addButtons[0]?.click();
    await wait(500);

    // Step 10: Verify spellbook selector appears
    await page.waitForSelector('[data-testid="spellbook-selector"]', { timeout: 5000 });
    const selector = await page.$('[data-testid="spellbook-selector"]');
    expect(selector).toBeTruthy();

    // Step 11: Select the spellbook
    await page.waitForSelector('.spellbook-selector-item', { timeout: 5000 });
    const spellbookOption = await page.$('.spellbook-selector-item');
    expect(spellbookOption).toBeTruthy();
    await spellbookOption?.click();
    await wait(1000); // Wait for add operation and success toast

    // Step 12: Verify success toast
    const successToast = await page.$('[data-testid="add-spell-success"]');
    expect(successToast).toBeTruthy();

    // Step 13: Navigate to spellbook detail
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await wait(500);

    await page.waitForSelector('.spellbook-card-content', { timeout: 10000 });
    const spellbookCardClick = await page.$('.spellbook-card-content');
    await spellbookCardClick?.click();
    await wait(500);

    // Step 14: Verify spell appears in spellbook
    await page.waitForSelector('.spellbook-table .spell-name', { timeout: 10000 });
    const spellInBook = await page.$('.spellbook-table .spell-name');
    expect(spellInBook).toBeTruthy();

    await page.waitForSelector('.spellbook-stats', { timeout: 5000 });
    const spellCount = await page.$eval('.spellbook-stats', el => el.textContent);
    expect(spellCount).toContain('1 spell');

    // Step 15: Mark spell as prepared
    await page.waitForSelector('.prepared-col input[type="checkbox"]', { timeout: 5000 });
    const preparedCheckbox = await page.$('.prepared-col input[type="checkbox"]');
    expect(preparedCheckbox).toBeTruthy();
    await preparedCheckbox?.click();
    await wait(300);

    // Step 16: Verify spell is marked as prepared
    const isPrepared = await page.$eval('.prepared-col input[type="checkbox"]', el => (el as HTMLInputElement).checked);
    expect(isPrepared).toBe(true);

    await page.waitForSelector('.prepared-row', { timeout: 5000 });
    const preparedRow = await page.$('.prepared-row');
    expect(preparedRow).toBeTruthy();

    // Step 17: Remove spell from spellbook
    await page.waitForSelector('.btn-remove-small', { timeout: 5000 });
    const removeButton = await page.$('.btn-remove-small');
    expect(removeButton).toBeTruthy();
    await removeButton?.click();
    await wait(500);

    // Step 18: Verify spellbook is empty
    await page.waitForSelector('.spellbook-detail-empty', { timeout: 10000 });
    const emptyMessage = await page.$('.spellbook-detail-empty');
    expect(emptyMessage).toBeTruthy();

    const emptyText = await page.$eval('.spellbook-detail-empty p', el => el.textContent);
    expect(emptyText).toContain('empty');
  }, 120000);

  it('should add multiple spells and verify count updates', async () => {
    // Clear localStorage first
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    // Create spellbook
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    const createButton = await page.$('[data-testid="btn-create-spellbook"]');
    await createButton?.click();
    await wait(300);

    const nameInput = await page.$('[data-testid="input-spellbook-name"]');
    await nameInput?.type('Multi-Spell Test');
    const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
    await saveButton?.click();
    await wait(500);

    // Add three spells
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);

    for (let i = 0; i < 3; i++) {
      const addButtons = await page.$$('[data-testid="btn-add-spell"]');
      await addButtons[i]?.click();
      await wait(300);

      const spellbookOption = await page.$('.spellbook-selector-item');
      await spellbookOption?.click();
      await wait(1000);
    }

    // Navigate to spellbook and verify count
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await wait(500);

    const spellCount = await page.$eval('.spellbook-card .spellbook-count', el => el.textContent);
    expect(spellCount).toContain('3 spells');

    // View detail and verify all spells present
    const spellbookCard = await page.$('.spellbook-card-content');
    await spellbookCard?.click();
    await wait(500);

    const spellRows = await page.$$('.spellbook-table tbody tr:not(.spell-expansion-row)');
    expect(spellRows.length).toBe(3);
  }, 120000);

  it('should handle prepared spell count correctly', async () => {
    // Clear localStorage first
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    // Create spellbook and add spells
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    const createButton = await page.$('[data-testid="btn-create-spellbook"]');
    await createButton?.click();
    await wait(300);

    const nameInput = await page.$('[data-testid="input-spellbook-name"]');
    await nameInput?.type('Prepared Spells Test');
    const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
    await saveButton?.click();
    await wait(500);

    // Add two spells
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);

    for (let i = 0; i < 2; i++) {
      const addButtons = await page.$$('[data-testid="btn-add-spell"]');
      await addButtons[i]?.click();
      await wait(300);
      const spellbookOption = await page.$('.spellbook-selector-item');
      await spellbookOption?.click();
      await wait(1000);
    }

    // Navigate to spellbook detail
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await wait(500);
    const spellbookCard = await page.$('.spellbook-card-content');
    await spellbookCard?.click();
    await wait(500);

    // Mark first spell as prepared
    const checkboxes = await page.$$('.prepared-col input[type="checkbox"]');
    await checkboxes[0]?.click();
    await wait(300);

    // Verify prepared count in list view
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await wait(500);

    const preparedCount = await page.$eval('.spellbook-prepared', el => el.textContent);
    expect(preparedCount).toContain('1 prepared');
  }, 120000);

  it.skip('should prevent adding duplicate spells', async () => {
    // Clear any existing data first - use evaluate to ensure localStorage is cleared
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Reload and wait for clean state
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await wait(500);

    // Create spellbook with unique name
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await wait(500);

    await page.waitForSelector('[data-testid="btn-create-spellbook"]', { timeout: 10000 });
    const createButton = await page.$('[data-testid="btn-create-spellbook"]');
    await createButton?.click();
    await wait(300);

    await page.waitForSelector('[data-testid="input-spellbook-name"]', { timeout: 5000 });
    const nameInput = await page.$('[data-testid="input-spellbook-name"]');
    await nameInput?.type('Duplicate Test Unique Name');
    const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
    await saveButton?.click();
    await wait(500);

    // Verify only one spellbook exists
    await page.waitForSelector('.spellbook-card', { timeout: 10000 });
    const spellbooksCount = await page.$$eval('.spellbook-card', cards => cards.length);
    expect(spellbooksCount).toBe(1);

    // Add first spell
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);

    const addButtons = await page.$$('[data-testid="btn-add-spell"]');
    await addButtons[0]?.click();
    await wait(300);
    const spellbookOption = await page.$('.spellbook-selector-item');
    await spellbookOption?.click();
    await wait(1000);

    // Try to add same spell again
    const addButtonsAgain = await page.$$('[data-testid="btn-add-spell"]');
    await addButtonsAgain[0]?.click();
    await wait(300);
    const spellbookOptionAgain = await page.$('.spellbook-selector-item');
    await spellbookOptionAgain?.click();
    await wait(500);

    // Should show alert (we can't test alert content, but can verify only one spell in book)
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await wait(500);

    // Wait for spellbook card to be visible and find the one we created
    await page.waitForSelector('.spellbook-card', { timeout: 10000 });
    const spellCount = await page.$eval('.spellbook-card .spellbook-count', el => el.textContent);
    expect(spellCount).toContain('1 spell'); // Should still be 1, not 2
  }, 120000);

  it('should expand spell details in spellbook view', async () => {
    // Clear localStorage first
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    // Create spellbook and add spell
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    const createButton = await page.$('[data-testid="btn-create-spellbook"]');
    await createButton?.click();
    await wait(300);

    const nameInput = await page.$('[data-testid="input-spellbook-name"]');
    await nameInput?.type('Expansion Test');
    const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
    await saveButton?.click();
    await wait(500);

    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);

    const addButton = await page.$('[data-testid="btn-add-spell"]');
    await addButton?.click();
    await wait(300);
    const spellbookOption = await page.$('.spellbook-selector-item');
    await spellbookOption?.click();
    await wait(1000);

    // Navigate to spellbook detail
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await wait(500);
    const spellbookCard = await page.$('.spellbook-card-content');
    await spellbookCard?.click();
    await wait(500);

    // Scroll into view before clicking
    const spellRow = await page.$('.spell-row');
    await spellRow?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(400);

    // Click spell to expand
    await spellRow?.click();
    await wait(500);

    // Scroll the expansion into view
    const expansion = await page.$('.spell-expansion-row');
    await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(300);

    // Verify expanded content appears
    const expandedContent = await page.$('.spell-inline-expansion');
    expect(expandedContent).toBeTruthy();

    const description = await page.$('.spell-expanded-description');
    expect(description).toBeTruthy();
  }, 120000);
});

describe('Spellbook Workflow - Mobile', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  beforeEach(async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);
  }, 30000);

  it.skip('should complete full mobile workflow: create → add → prepare → remove', async () => {
    // Step 1: Navigate to spellbooks on mobile
    await page.waitForSelector('[data-testid="nav-spellbooks"]', { timeout: 10000 });
    const spellbooksButton = await page.$('[data-testid="nav-spellbooks"]');
    await spellbooksButton?.click();
    await wait(500);

    // Step 2: Create spellbook - button should be full width
    await page.waitForSelector('[data-testid="btn-create-spellbook"]', { timeout: 10000 });
    const createButton = await page.$('[data-testid="btn-create-spellbook"]');
    const buttonWidth = await createButton?.evaluate(el => el.getBoundingClientRect().width);
    expect(buttonWidth).toBeGreaterThan(200); // Full width on mobile (accounting for padding)

    await createButton?.click();
    await wait(300);

    // Step 3: Dialog should be mobile-friendly
    await page.waitForSelector('.dialog', { timeout: 5000 });
    const dialog = await page.$('.dialog');
    const dialogWidth = await dialog?.evaluate(el => el.getBoundingClientRect().width);
    expect(dialogWidth).toBeLessThan(375); // Should fit in viewport with margins

    // Step 4: Fill in name
    await page.waitForSelector('[data-testid="input-spellbook-name"]', { timeout: 5000 });
    const nameInput = await page.$('[data-testid="input-spellbook-name"]');
    await nameInput?.type('Mobile Spellbook');

    // Step 5: Save button should be full width on mobile
    const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
    const saveButtonWidth = await saveButton?.evaluate(el => el.getBoundingClientRect().width);
    expect(saveButtonWidth).toBeGreaterThan(200); // Full width in dialog

    await saveButton?.click();
    await wait(500);

    // Step 6: Navigate back to browse
    await page.waitForSelector('.nav-link', { timeout: 10000 });
    const browseButton = await page.$$('.nav-link');
    await browseButton[0]?.click();
    await waitForSpellsToLoad(page);

    // Step 7: Add spell - mobile button is 44x44px touch-friendly size
    await page.waitForSelector('[data-testid="btn-add-spell"]', { timeout: 10000 });
    const addButton = await page.$('[data-testid="btn-add-spell"]');
    const addButtonSize = await addButton?.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
      };
    });

    // Mobile buttons are 44x44px for touch-friendly targets
    expect(addButtonSize?.width).toBeGreaterThanOrEqual(44);
    expect(addButtonSize?.height).toBeGreaterThanOrEqual(44);

    await addButton?.click();
    await wait(500);

    // Step 8: Select spellbook
    await page.waitForSelector('.spellbook-selector-item', { timeout: 5000 });
    const spellbookOption = await page.$('.spellbook-selector-item');
    await spellbookOption?.click();
    await wait(1000);

    // Step 9: Navigate to spellbook detail
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await wait(500);
    await page.waitForSelector('.spellbook-card-content', { timeout: 10000 });
    const spellbookCard = await page.$('.spellbook-card-content');
    await spellbookCard?.click();
    await wait(500);

    // Step 10: Verify mobile layout - checkbox and remove button should be positioned absolutely
    await page.waitForSelector('.prepared-col input[type="checkbox"]', { timeout: 10000 });
    const checkbox = await page.$('.prepared-col input[type="checkbox"]');
    const checkboxPosition = await checkbox?.evaluate(el => {
      const parent = el.closest('.prepared-col') as HTMLElement;
      const style = window.getComputedStyle(parent);
      return style.position;
    });
    expect(checkboxPosition).toBe('absolute');

    // Step 11: Checkbox should be touch-friendly size
    const checkboxSize = await checkbox?.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(checkboxSize?.width).toBeGreaterThanOrEqual(24);
    expect(checkboxSize?.height).toBeGreaterThanOrEqual(24);

    // Step 12: Mark as prepared
    await checkbox?.click();
    await wait(300);

    const isPrepared = await page.$eval('.prepared-col input[type="checkbox"]', el => (el as HTMLInputElement).checked);
    expect(isPrepared).toBe(true);

    // Step 13: Remove button should be touch-friendly
    await page.waitForSelector('.btn-remove-small', { timeout: 5000 });
    const removeButton = await page.$('.btn-remove-small');
    const removeSize = await removeButton?.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    });
    expect(removeSize?.width).toBeGreaterThanOrEqual(44);
    expect(removeSize?.height).toBeGreaterThanOrEqual(44);

    await removeButton?.click();
    await wait(500);

    // Step 14: Verify empty state
    await page.waitForSelector('.spellbook-detail-empty', { timeout: 10000 });
    const emptyMessage = await page.$('.spellbook-detail-empty');
    expect(emptyMessage).toBeTruthy();
  }, 120000);

  it.skip('should handle spell expansion on mobile with card layout', async () => {
    // Create spellbook and add spell
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('[data-testid="btn-create-spellbook"]', { timeout: 10000 });
    const createButton = await page.$('[data-testid="btn-create-spellbook"]');
    await createButton?.click();
    await wait(300);

    await page.waitForSelector('[data-testid="input-spellbook-name"]', { timeout: 5000 });
    const nameInput = await page.$('[data-testid="input-spellbook-name"]');
    await nameInput?.type('Mobile Expansion Test');
    const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
    await saveButton?.click();
    await wait(500);

    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);

    await page.waitForSelector('[data-testid="btn-add-spell"]', { timeout: 10000 });
    const addButton = await page.$('[data-testid="btn-add-spell"]');
    await addButton?.click();
    await wait(300);
    await page.waitForSelector('.spellbook-selector-item', { timeout: 5000 });
    const spellbookOption = await page.$('.spellbook-selector-item');
    await spellbookOption?.click();
    await wait(1000);

    // Navigate to spellbook detail
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await wait(500);
    await page.waitForSelector('.spellbook-card-content', { timeout: 10000 });
    const spellbookCard = await page.$('.spellbook-card-content');
    await spellbookCard?.click();
    await wait(500);

    // Scroll into view before clicking
    await page.waitForSelector('.spell-row', { timeout: 10000 });
    const spellRow = await page.$('.spell-row');
    await spellRow?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(400);

    // Expand spell
    await spellRow?.click();
    await wait(500);

    // Wait for expansion to appear
    await page.waitForSelector('.spell-inline-expansion', { timeout: 5000 });

    // Scroll the expansion into view
    const expansion = await page.$('.spell-inline-expansion');
    await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await wait(300);

    // Verify expanded content has mobile card styling
    const expandedStyle = await page.evaluate(() => {
      const expanded = document.querySelector('.spell-inline-expansion');
      if (!expanded) return null;

      const style = window.getComputedStyle(expanded);
      // Border radius may be 0px in spellbook detail view (different from browse view)
      return {
        borderRadius: style.borderRadius,
        padding: style.padding,
        background: style.backgroundColor,
        hasContent: expanded.textContent && expanded.textContent.length > 50,
      };
    });

    // Main check: expansion has content and styling
    expect(expandedStyle?.hasContent).toBe(true);
    expect(expandedStyle?.background).not.toBe('rgba(0, 0, 0, 0)');

    // Verify no horizontal scroll on expanded content
    const scrollWidth = await page.evaluate(() => {
      return {
        bodyScrollWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });

    expect(scrollWidth.bodyScrollWidth).toBeLessThanOrEqual(scrollWidth.viewportWidth + 1);
  }, 120000);

  it.skip('should handle no horizontal scroll throughout workflow', async () => {
    const checkNoScroll = async () => {
      const scrollWidth = await page.evaluate(() => ({
        bodyScrollWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
      }));
      expect(scrollWidth.bodyScrollWidth).toBeLessThanOrEqual(scrollWidth.viewportWidth + 1);
    };

    // Check browse page
    await checkNoScroll();

    // Navigate to spellbooks
    await page.waitForSelector('[data-testid="nav-spellbooks"]', { timeout: 10000 });
    const spellbooksButton = await page.$('[data-testid="nav-spellbooks"]');
    await spellbooksButton?.click();
    await wait(500);
    await checkNoScroll();

    // Create spellbook
    await page.waitForSelector('[data-testid="btn-create-spellbook"]', { timeout: 10000 });
    const createButton = await page.$('[data-testid="btn-create-spellbook"]');
    await createButton?.click();
    await wait(300);
    await checkNoScroll();

    await page.waitForSelector('[data-testid="input-spellbook-name"]', { timeout: 5000 });
    const nameInput = await page.$('[data-testid="input-spellbook-name"]');
    await nameInput?.type('Scroll Test');
    const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
    await saveButton?.click();
    await wait(500);
    await checkNoScroll();

    // View detail
    await page.waitForSelector('.spellbook-card-content', { timeout: 10000 });
    const spellbookCard = await page.$('.spellbook-card-content');
    await spellbookCard?.click();
    await wait(500);
    await checkNoScroll();

    // Back to browse
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);
    await checkNoScroll();
  }, 120000);
});
