// Complete spellbook workflow E2E tests
// Tests the full user journey: create → add spells → mark prepared → remove
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad } from './setup';
import {
  TIMEOUTS,
  VIEWPORTS,
  SELECTORS,
  TEST_IDS,
} from './config';
import {
  navigateAndWait,
  createSpellbook,
  addSpellToSpellbook,
  expandSpellRowInSpellbook,
  togglePreparedStatus,
  removeSpellFromSpellbook,
  clickSpellbookCard,
  clearTestData,
} from './helpers';

describe('Spellbook Workflow - Desktop', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
    await page.setViewport(VIEWPORTS.DESKTOP);
  }, TIMEOUTS.LONG);

  afterAll(async () => {
    await closeBrowser();
  });

  beforeEach(async () => {
    await navigateAndWait(page, TEST_URL);
    await clearTestData(page);
    await page.reload({ waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);
  });

  it('should create spellbook and navigate to it', async () => {
    // Use helper to create spellbook
    await createSpellbook(page, TEST_URL, 'My Wizard Spellbook');

    // Assert: Verify spellbook created
    const spellbookCard = await page.$(SELECTORS.SPELLBOOK_CARD);
    expect(spellbookCard).toBeTruthy();

    const spellbookName = await page.$eval('.spellbook-card h3', el => el.textContent);
    expect(spellbookName).toBe('My Wizard Spellbook');
  }, TIMEOUTS.LONG);

  it('should add spell to spellbook from browse page', async () => {
    // Arrange: Create spellbook first
    await createSpellbook(page, TEST_URL, 'Test Spellbook');

    // Act: Add spell from browse page
    await navigateAndWait(page, TEST_URL);
    await addSpellToSpellbook(page, 0);

    // Assert: Verify spell added successfully (helper already waits for success toast)
    const successToast = await page.$(TEST_IDS.ADD_SPELL_SUCCESS);
    expect(successToast).toBeTruthy();
  }, TIMEOUTS.LONG);

  it('should mark spell as prepared in spellbook', async () => {
    // Arrange: Create spellbook and add spell
    await createSpellbook(page, TEST_URL, 'Prepared Test');
    await navigateAndWait(page, TEST_URL);
    await addSpellToSpellbook(page, 0);

    // Navigate to spellbook detail
    await navigateAndWait(page, `${TEST_URL}#/spellbooks`);
    await clickSpellbookCard(page, 0);

    // Act: Mark spell as prepared using helper
    await togglePreparedStatus(page, 0);

    // Assert: Verify spell is marked as prepared
    const isPrepared = await page.$eval(
      `${SELECTORS.PREPARED_COL} input[type="checkbox"]`,
      el => (el as HTMLInputElement).checked
    );
    expect(isPrepared).toBe(true);
  }, TIMEOUTS.LONG);

  it('should remove spell from spellbook', async () => {
    // Arrange: Create spellbook and add spell
    await createSpellbook(page, TEST_URL, 'Remove Test');
    await navigateAndWait(page, TEST_URL);
    await addSpellToSpellbook(page, 0);

    // Navigate to spellbook detail
    await navigateAndWait(page, `${TEST_URL}#/spellbooks`);
    await clickSpellbookCard(page, 0);

    // Act: Remove spell using helper
    await removeSpellFromSpellbook(page, 0);

    // Assert: Verify spellbook is empty (helper already waits for removal)
    const emptyMessage = await page.$(SELECTORS.SPELLBOOK_DETAIL_EMPTY);
    expect(emptyMessage).toBeTruthy();

    const emptyText = await page.$eval('.spellbook-detail-empty p', el => el.textContent);
    expect(emptyText).toContain('empty');
  }, TIMEOUTS.LONG);

  it('should add multiple spells and verify count updates', async () => {
    // Arrange: Create spellbook using helper
    await createSpellbook(page, TEST_URL, 'Multi-Spell Test');

    // Add three spells using helper
    await navigateAndWait(page, TEST_URL);
    for (let i = 0; i < 3; i++) {
      await addSpellToSpellbook(page, i);
    }

    // Act: Navigate to spellbook list and verify count
    await navigateAndWait(page, `${TEST_URL}#/spellbooks`);

    // Assert: Verify count shows 3 spells
    await page.waitForSelector(SELECTORS.SPELLBOOK_COUNT, { visible: true, timeout: TIMEOUTS.MEDIUM });
    const spellCount = await page.$eval(SELECTORS.SPELLBOOK_COUNT, el => el.textContent);
    expect(spellCount).toContain('3 spells');

    // Navigate to detail and verify all spells present
    await clickSpellbookCard(page, 0);
    const spellRows = await page.$$('.spellbook-table tbody tr:not(.spell-expansion-row)');
    expect(spellRows.length).toBe(3);
  }, TIMEOUTS.LONG);

  it('should handle prepared spell count correctly', async () => {
    // Arrange: Create spellbook and add two spells
    await createSpellbook(page, TEST_URL, 'Prepared Spells Test');
    await navigateAndWait(page, TEST_URL);

    // Add two spells
    for (let i = 0; i < 2; i++) {
      await addSpellToSpellbook(page, i);
    }

    // Navigate to spellbook detail
    await navigateAndWait(page, `${TEST_URL}#/spellbooks`);
    await clickSpellbookCard(page, 0);

    // Act: Mark first spell as prepared using helper
    await togglePreparedStatus(page, 0);

    // Assert: Verify prepared count in list view
    await navigateAndWait(page, `${TEST_URL}#/spellbooks`);

    const preparedCount = await page.$eval(SELECTORS.SPELLBOOK_PREPARED, el => el.textContent);
    expect(preparedCount).toContain('1 prepared');
  }, TIMEOUTS.LONG);

  it('should prevent adding duplicate spells', async () => {
    // Arrange: Clear data and create spellbook
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });

    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });

    await page.waitForSelector('[data-testid="btn-create-spellbook"]', { visible: true, timeout: 10000 });
    const createButton = await page.$('[data-testid="btn-create-spellbook"]');
    await createButton?.click();

    await page.waitForSelector('[data-testid="input-spellbook-name"]', { visible: true, timeout: 10000 });
    const nameInput = await page.$('[data-testid="input-spellbook-name"]');
    await nameInput?.type('Duplicate Test');

    const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
    await saveButton?.click();

    await page.waitForSelector('.spellbook-card', { visible: true, timeout: 10000 });

    // Add first spell
    await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);

    await page.waitForSelector('[data-testid="btn-add-spell"]', { visible: true, timeout: 10000 });
    const addButtons = await page.$$('[data-testid="btn-add-spell"]');
    await addButtons[0]?.click();

    await page.waitForSelector('.spellbook-selector-item', { visible: true, timeout: 10000 });
    const spellbookOption = await page.$('.spellbook-selector-item');
    await spellbookOption?.click();

    await page.waitForSelector('[data-testid="add-spell-success"]', { visible: true, timeout: 10000 });

    // Act: Try to add same spell again
    const addButtonsAgain = await page.$$('[data-testid="btn-add-spell"]');
    await addButtonsAgain[0]?.click();

    await page.waitForSelector('.spellbook-selector-item', { visible: true, timeout: 10000 });
    const spellbookOptionAgain = await page.$('.spellbook-selector-item');
    await spellbookOptionAgain?.click();

    // Wait for duplicate handling to complete
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="add-spell-success"]'),
      { timeout: 10000 }
    );

    // Assert: Verify only one spell in spellbook (no duplicate)
    await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.spellbook-card .spellbook-count', { visible: true, timeout: 10000 });

    const spellCount = await page.$eval('.spellbook-card .spellbook-count', el => el.textContent);
    expect(spellCount).toContain('1 spell'); // Should still be 1, not 2
  }, TIMEOUTS.LONG);

  it('should expand spell details in spellbook view', async () => {
    // Arrange: Create spellbook and add spell
    await createSpellbook(page, TEST_URL, 'Expansion Test');
    await navigateAndWait(page, TEST_URL);
    await addSpellToSpellbook(page, 0);

    // Navigate to spellbook detail
    await navigateAndWait(page, `${TEST_URL}#/spellbooks`);
    await clickSpellbookCard(page, 0);

    // Act: Expand spell using helper
    await expandSpellRowInSpellbook(page, 0);

    // Assert: Verify expanded content appears
    const expandedContent = await page.$(SELECTORS.SPELL_INLINE_EXPANSION);
    expect(expandedContent).toBeTruthy();

    const description = await page.$(SELECTORS.SPELL_EXPANDED_DESCRIPTION);
    expect(description).toBeTruthy();
  }, TIMEOUTS.LONG);
});

describe('Spellbook Workflow - Mobile', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, TIMEOUTS.LONG);

  afterAll(async () => {
    await closeBrowser();
  });

  beforeEach(async () => {
    await page.setViewport(VIEWPORTS.MOBILE_SMALL);
    await navigateAndWait(page, TEST_URL);
    await clearTestData(page);
    await page.reload({ waitUntil: 'networkidle2' });
    await waitForSpellsToLoad(page);
  }, TIMEOUTS.LONG);

  it('should create spellbook on mobile', async () => {
    // Use helper to create spellbook
    await createSpellbook(page, TEST_URL, 'Mobile Spellbook');

    // Assert: Verify spellbook created
    const spellbookCard = await page.$(SELECTORS.SPELLBOOK_CARD);
    expect(spellbookCard).toBeTruthy();

    const spellbookName = await page.$eval('.spellbook-card h3', el => el.textContent);
    expect(spellbookName).toContain('Mobile Spellbook');
  }, TIMEOUTS.LONG);

  it('should add spell to spellbook on mobile', async () => {
    // Arrange: Create spellbook first
    await createSpellbook(page, TEST_URL, 'Mobile Add Test');

    // Act: Add spell from browse page
    await navigateAndWait(page, TEST_URL);
    await addSpellToSpellbook(page, 0);

    // Assert: Verify spell added successfully (helper already waits for success toast)
    const successToast = await page.$(TEST_IDS.ADD_SPELL_SUCCESS);
    expect(successToast).toBeTruthy();
  }, TIMEOUTS.VERY_LONG);

  it('should mark spell as prepared on mobile', async () => {
    // Arrange: Create spellbook and add spell
    await createSpellbook(page, TEST_URL, 'Mobile Prepared Test');
    await navigateAndWait(page, TEST_URL);
    await addSpellToSpellbook(page, 0);

    // Navigate to spellbook detail
    await navigateAndWait(page, `${TEST_URL}#/spellbooks`);
    await clickSpellbookCard(page, 0);

    // Act: Mark spell as prepared using helper
    await togglePreparedStatus(page, 0);

    // Assert: Verify spell is marked as prepared
    const isPrepared = await page.$eval(
      `${SELECTORS.PREPARED_COL} input[type="checkbox"]`,
      el => (el as HTMLInputElement).checked
    );
    expect(isPrepared).toBe(true);
  }, TIMEOUTS.VERY_LONG);

  it('should remove spell from spellbook on mobile', async () => {
    // Arrange: Create spellbook and add spell
    await createSpellbook(page, TEST_URL, 'Mobile Remove Test');
    await navigateAndWait(page, TEST_URL);
    await addSpellToSpellbook(page, 0);

    // Navigate to spellbook detail
    await navigateAndWait(page, `${TEST_URL}#/spellbooks`);
    await clickSpellbookCard(page, 0);

    // Act: Remove spell using helper
    await removeSpellFromSpellbook(page, 0);

    // Assert: Verify spellbook is empty (helper already waits for removal)
    const emptyMessage = await page.$(SELECTORS.SPELLBOOK_DETAIL_EMPTY);
    expect(emptyMessage).toBeTruthy();

    const emptyText = await page.$eval('.spellbook-detail-empty p', el => el.textContent);
    expect(emptyText).toContain('empty');
  }, TIMEOUTS.VERY_LONG);

});
