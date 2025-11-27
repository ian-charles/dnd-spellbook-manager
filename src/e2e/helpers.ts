/**
 * E2E Test Helper Functions
 *
 * This file contains reusable helper functions to reduce duplication
 * and improve test maintainability following E2E best practices.
 *
 * Best Practices Applied:
 * 1. Extract common workflows into helper functions
 * 2. Use explicit waits instead of arbitrary delays
 * 3. Centralize timeout management
 * 4. Chain operations with single overall timeout where possible
 * 5. Provide clear error messages
 *
 * References:
 * - Page Object Model pattern (partial implementation via helpers)
 * - DRY principle for common test operations
 * - Explicit waits over implicit waits
 */

import { Page, ElementHandle } from 'puppeteer';
import { TIMEOUTS, TEST_IDS, SELECTORS } from './config';

/**
 * Wait for an element to be visible and in the viewport.
 * This is more reliable than just waitForSelector because it ensures
 * the element is actually visible and scrolled into view.
 *
 * @param page Puppeteer page object
 * @param selector CSS selector or test ID
 * @param timeout Maximum wait time in milliseconds (default: MEDIUM)
 * @returns The element handle
 */
export async function waitForElementVisible(
  page: Page,
  selector: string,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<ElementHandle<Element>> {
  await page.waitForSelector(selector, { visible: true, timeout });
  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element;
}

/**
 * Scroll an element into the viewport and wait for it to be visible.
 * Essential for mobile testing and long pages where elements may be off-screen.
 *
 * @param page Puppeteer page object
 * @param element Element to scroll into view
 * @param timeout Maximum wait time for viewport check (default: SHORT)
 */
export async function scrollIntoViewport(
  page: Page,
  element: ElementHandle<Element>,
  timeout: number = TIMEOUTS.SHORT
): Promise<void> {
  // Scroll element to center of viewport and wait for it to be in viewport
  await element.evaluate((el: Element) => {
    el.scrollIntoView({ behavior: 'instant', block: 'center' });

    // Return true when element is in viewport
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  });

  // Small delay to ensure scroll completes
  await page.waitForFunction(
    (el) => {
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight;
    },
    { timeout: TIMEOUTS.SHORT },
    element
  );
}

/**
 * Check if an element is fully visible in the viewport.
 * Useful for assertions about element visibility.
 *
 * @param page Puppeteer page object
 * @param element Element to check
 * @returns True if element is in viewport, false otherwise
 */
export async function isElementInViewport(
  page: Page,
  element: ElementHandle<Element>
): Promise<boolean> {
  return await page.evaluate((el) => {
    const rect = el?.getBoundingClientRect();
    if (!rect) return false;

    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }, element);
}

/**
 * Navigate to a page and wait for it to fully load.
 * Combines goto with networkidle2 wait for complete page load.
 *
 * @param page Puppeteer page object
 * @param url URL to navigate to
 * @param timeout Maximum wait time (default: PAGE_LOAD)
 */
export async function navigateAndWait(
  page: Page,
  url: string,
  timeout: number = TIMEOUTS.PAGE_LOAD
): Promise<void> {
  await page.goto(url, { waitUntil: 'networkidle2', timeout });
}

/**
 * Navigate to the My Spellbooks page and wait for it to load.
 *
 * @param page Puppeteer page object
 * @param baseUrl Base URL of the application
 */
export async function navigateToSpellbooks(
  page: Page,
  baseUrl: string
): Promise<void> {
  await navigateAndWait(page, `${baseUrl}#/spellbooks`);
  await waitForElementVisible(page, TEST_IDS.SPELLBOOKS_HEADER);
}

/**
 * Navigate to a specific spellbook detail page.
 * Gets the spellbook ID from the first spellbook card and navigates to it.
 *
 * @param page Puppeteer page object
 * @param baseUrl Base URL of the application
 * @returns The spellbook ID
 */
export async function navigateToSpellbookDetail(
  page: Page,
  baseUrl: string
): Promise<string> {
  // Make sure we're on the spellbooks page
  await navigateToSpellbooks(page, baseUrl);

  // Wait for spellbook items to load
  await waitForElementVisible(page, TEST_IDS.SPELLBOOK_ITEM);

  // Get the first spellbook ID
  const spellbookId = await page.$eval(
    TEST_IDS.SPELLBOOK_ITEM,
    (el) => el.getAttribute('data-testid')?.replace('spellbook-item-', '') || ''
  );

  if (!spellbookId) {
    throw new Error('No spellbook ID found');
  }

  // Navigate to detail page
  await navigateAndWait(page, `${baseUrl}#/spellbooks/${spellbookId}`);

  // Wait for detail page to load
  await waitForElementVisible(page, TEST_IDS.SPELLBOOK_DETAIL);
  await waitForElementVisible(page, SELECTORS.SPELLBOOK_DETAIL_HEADER);
  await waitForElementVisible(page, SELECTORS.SPELLBOOK_TABLE);

  return spellbookId;
}

/**
 * Wait for spells to load on the browse page.
 * Waits for spell table and at least one spell row to be present.
 *
 * @param page Puppeteer page object
 * @param timeout Maximum wait time (default: MEDIUM)
 */
export async function waitForSpellsToLoad(
  page: Page,
  timeout: number = TIMEOUTS.MEDIUM
): Promise<void> {
  // Wait for the spell table to be present
  await page.waitForSelector(SELECTORS.SPELL_TABLE, { timeout });

  // Wait for at least one spell row to be rendered
  await page.waitForFunction(
    () => {
      const rows = document.querySelectorAll('.spell-row');
      return rows.length > 0;
    },
    { timeout }
  );
}

/**
 * Create a new spellbook with the given name.
 * Handles the complete workflow: navigate → open dialog → fill form → save.
 *
 * @param page Puppeteer page object
 * @param baseUrl Base URL of the application
 * @param name Name for the new spellbook
 */
export async function createSpellbook(
  page: Page,
  baseUrl: string,
  name: string
): Promise<void> {
  // Navigate to spellbooks page
  await navigateToSpellbooks(page, baseUrl);

  // Click create button
  const createButton = await waitForElementVisible(page, TEST_IDS.BTN_CREATE_SPELLBOOK);
  await createButton.click();

  // Wait for dialog to appear
  await waitForElementVisible(page, TEST_IDS.CREATE_SPELLBOOK_DIALOG);

  // Fill in name
  const nameInput = await waitForElementVisible(page, TEST_IDS.INPUT_SPELLBOOK_NAME);
  await nameInput.type(name);

  // Click save
  const saveButton = await waitForElementVisible(page, TEST_IDS.BTN_SAVE_SPELLBOOK);
  await saveButton.click();

  // Wait for spellbook card to appear
  await waitForElementVisible(page, SELECTORS.SPELLBOOK_CARD);
}

/**
 * Add a spell to a spellbook from the browse page.
 * Handles the complete workflow: click add → select spellbook → wait for success.
 *
 * @param page Puppeteer page object
 * @param spellIndex Index of the spell to add (0-based, default: 0 for first spell)
 */
export async function addSpellToSpellbook(
  page: Page,
  spellIndex: number = 0
): Promise<void> {
  if (spellIndex < 0) {
    throw new Error(`spellIndex must be non-negative, got ${spellIndex}`);
  }
  // Wait for spells to load
  await waitForSpellsToLoad(page);

  // Get all checkboxes and click the specified one
  await waitForElementVisible(page, '[data-testid="spell-checkbox"]');
  const checkboxes = await page.$$('[data-testid="spell-checkbox"]');

  if (checkboxes.length <= spellIndex) {
    throw new Error(`Spell index ${spellIndex} out of bounds (${checkboxes.length} spells available)`);
  }

  // Ensure checkbox is not already checked (toggle if needed, or just check)
  // For simplicity, we assume it's unchecked or clicking toggles it. 
  // But if it's already checked, clicking unchecks it. 
  // Let's assume clean state or check property.
  const isChecked = await checkboxes[spellIndex].evaluate((el) => (el as HTMLInputElement).checked);
  if (!isChecked) {
    await checkboxes[spellIndex].click();
  }

  // Wait for dropdown
  await waitForElementVisible(page, '[data-testid="spellbook-dropdown"]');

  // Wait for dropdown to populate with spellbooks (at least one spellbook + default + create new)
  await page.waitForFunction(
    () => {
      const select = document.querySelector('[data-testid="spellbook-dropdown"]') as HTMLSelectElement;
      return select && select.options.length >= 3;
    },
    { timeout: TIMEOUTS.MEDIUM }
  );

  // Select the first actual spellbook (index 2, after "Select..." and "Create New")
  // We need to get the value of the option at index 2
  const spellbookValue = await page.$eval(
    '[data-testid="spellbook-dropdown"]',
    (select: HTMLSelectElement) => {
      return select.options[2].value;
    }
  );

  if (!spellbookValue) {
    throw new Error('No spellbooks available to add to');
  }

  await page.select('[data-testid="spellbook-dropdown"]', spellbookValue);

  // Click Add button
  await waitForElementVisible(page, '[data-testid="btn-add-selected"]');

  // Wait for button to be enabled
  await page.waitForFunction(
    () => !(document.querySelector('[data-testid="btn-add-selected"]') as HTMLButtonElement).disabled,
    { timeout: TIMEOUTS.SHORT }
  );

  const addButton = await page.$('[data-testid="btn-add-selected"]');
  await addButton?.click();

  // Wait for success toast
  await waitForElementVisible(page, TEST_IDS.ADD_SPELL_SUCCESS);

  // Clear selection to clean up for next test steps
  const unselectButton = await page.$('[data-testid="btn-unselect-all"]');
  if (unselectButton) {
    const isDisabled = await unselectButton.evaluate((el) => (el as HTMLButtonElement).disabled);
    if (!isDisabled) {
      await unselectButton.click();
    }
  }
}

/**
 * Click on a spell row and wait for expansion to appear.
 * Handles scrolling into view for reliable clicking on mobile.
 *
 * @param page Puppeteer page object
 * @param spellIndex Index of the spell to expand (0-based, default: 0 for first spell)
 */
export async function expandSpellRow(
  page: Page,
  spellIndex: number = 0
): Promise<void> {
  if (spellIndex < 0) {
    throw new Error(`spellIndex must be non-negative, got ${spellIndex}`);
  }
  // Get all spell rows
  const spellRows = await page.$$(SELECTORS.SPELL_ROW);

  if (spellRows.length <= spellIndex) {
    throw new Error(`Spell index ${spellIndex} out of bounds (${spellRows.length} spells available)`);
  }

  const spellRow = spellRows[spellIndex];

  // Scroll into view before clicking
  await scrollIntoViewport(page, spellRow);

  // Click to expand
  await spellRow.click();

  // Wait for expansion to appear
  await waitForElementVisible(page, SELECTORS.SPELL_EXPANSION_ROW, TIMEOUTS.SHORT);

  // Wait for expansion animation to complete (opacity: 1)
  await page.waitForFunction(
    (selector) => {
      const el = document.querySelector(selector);
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.opacity === '1';
    },
    { timeout: TIMEOUTS.MEDIUM },
    SELECTORS.SPELL_INLINE_EXPANSION
  );

  // Scroll expansion into view
  const expansion = await page.$(SELECTORS.SPELL_EXPANSION_ROW);
  if (expansion) {
    await scrollIntoViewport(page, expansion);
  }
}

/**
 * Click on a spell row in spellbook detail and wait for inline expansion.
 * Different from browse page expansion which creates a separate row.
 *
 * @param page Puppeteer page object
 * @param spellIndex Index of the spell to expand (0-based, default: 0 for first spell)
 */
export async function expandSpellRowInSpellbook(
  page: Page,
  spellIndex: number = 0
): Promise<void> {
  if (spellIndex < 0) {
    throw new Error(`spellIndex must be non-negative, got ${spellIndex}`);
  }
  // Get all spell rows
  const spellRows = await page.$$(SELECTORS.SPELL_ROW);

  if (spellRows.length <= spellIndex) {
    throw new Error(`Spell index ${spellIndex} out of bounds (${spellRows.length} spells available)`);
  }

  const spellRow = spellRows[spellIndex];

  // Scroll into view before clicking
  await scrollIntoViewport(page, spellRow);

  // Click to expand
  await spellRow.click();

  // Wait for inline expansion to appear
  await waitForElementVisible(page, SELECTORS.SPELL_INLINE_EXPANSION, TIMEOUTS.SHORT);

  // Scroll expansion into view
  const expansion = await page.$(SELECTORS.SPELL_INLINE_EXPANSION);
  if (expansion) {
    await scrollIntoViewport(page, expansion);
  }
}

/**
 * Toggle the prepared status of a spell in spellbook detail.
 * Waits for checkbox to be enabled before clicking.
 *
 * @param page Puppeteer page object
 * @param spellIndex Index of the spell checkbox to toggle (0-based, default: 0)
 */
export async function togglePreparedStatus(
  page: Page,
  spellIndex: number = 0
): Promise<void> {
  if (spellIndex < 0) {
    throw new Error(`spellIndex must be non-negative, got ${spellIndex}`);
  }
  // Wait for checkbox to be visible
  const checkboxSelector = `${SELECTORS.PREPARED_COL} input[type="checkbox"]`;
  await waitForElementVisible(page, checkboxSelector);

  // Wait for checkbox to be enabled
  await page.waitForFunction(
    (selector) => {
      const checkboxes = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
      return checkboxes.length > 0 && !checkboxes[0].disabled;
    },
    { timeout: TIMEOUTS.SHORT },
    checkboxSelector
  );

  // Get current checked state
  const initialCheckedState = await page.evaluate(
    (selector, index) => {
      const checkboxes = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
      return checkboxes[index]?.checked ?? false;
    },
    checkboxSelector,
    spellIndex
  );

  // Get all checkboxes and click the specified one
  const checkboxes = await page.$$(checkboxSelector);

  if (checkboxes.length <= spellIndex) {
    throw new Error(`Checkbox index ${spellIndex} out of bounds (${checkboxes.length} checkboxes available)`);
  }

  // Scroll checkbox into view before clicking (important for mobile)
  const checkbox = checkboxes[spellIndex];
  if (checkbox) {
    await scrollIntoViewport(page, checkbox);

    // For React-controlled checkboxes, trigger click via evaluate to ensure React events fire
    await checkbox.evaluate((el: Element) => {
      (el as HTMLInputElement).click();
    });
  }

  // Wait for state to actually change after React updates
  // This includes waiting for the async handleTogglePrepared -> togglePrepared -> loadSpellbook cycle
  await page.waitForFunction(
    (selector, index, initialState) => {
      const checkboxes = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;
      const checkbox = checkboxes[index];
      return checkbox && checkbox.checked !== initialState;
    },
    { timeout: TIMEOUTS.LONG },
    checkboxSelector,
    spellIndex,
    initialCheckedState
  );
}

/**
 * Remove a spell from spellbook and wait for it to be removed from the DOM.
 *
 * @param page Puppeteer page object
 * @param spellIndex Index of the spell to remove (0-based, default: 0)
 */
export async function removeSpellFromSpellbook(
  page: Page,
  spellIndex: number = 0
): Promise<void> {
  if (spellIndex < 0) {
    throw new Error(`spellIndex must be non-negative, got ${spellIndex}`);
  }

  // Get current spell count (counting actual spell rows, not expansion rows)
  const initialCount = await page.evaluate(() => {
    const rows = document.querySelectorAll('.spellbook-table tbody tr.spell-row');
    return rows.length;
  });

  // Get all remove buttons and click the specified one
  const removeButtons = await page.$$(SELECTORS.BTN_REMOVE_SMALL);

  if (removeButtons.length <= spellIndex) {
    throw new Error(`Remove button index ${spellIndex} out of bounds (${removeButtons.length} buttons available)`);
  }

  // Scroll button into view and click
  const removeButton = removeButtons[spellIndex];
  if (removeButton) {
    await scrollIntoViewport(page, removeButton);
    await removeButton.click();
  }

  // Wait for custom ConfirmDialog to appear
  await waitForElementVisible(page, '[data-testid="confirm-dialog-overlay"]', TIMEOUTS.MEDIUM);

  // Click the confirm button in the custom dialog
  const confirmButton = await page.$('[data-testid="confirm-dialog-confirm"]');
  if (confirmButton) {
    await confirmButton.click();
  }

  // Wait for spell to be removed (count decreased or empty state appears)
  await page.waitForFunction(
    (count) => {
      const currentRows = document.querySelectorAll('.spellbook-table tbody tr.spell-row');
      const emptyState = document.querySelector('.spellbook-detail-empty');
      return currentRows.length < count || emptyState !== null;
    },
    { timeout: TIMEOUTS.LONG },
    initialCount
  );
}

/**
 * Click on a spellbook card to navigate to its detail page.
 * Clicks on a spellbook card by index.
 *
 * @param page The Puppeteer page instance
 * @param index The index of the spellbook card to click (0-based)
 */
export const clickSpellbookCard = async (page: Page, index: number): Promise<void> => {
  if (index < 0) {
    throw new Error(`index must be non-negative, got ${index}`);
  }
  // Wait for spellbook cards to be visible
  await waitForElementVisible(page, SELECTORS.SPELLBOOK_CARD_CONTENT);

  // Get all spellbook cards
  const cards = await page.$$(SELECTORS.SPELLBOOK_CARD_CONTENT);

  if (cards.length <= index) {
    throw new Error(`Spellbook index ${index} out of bounds (${cards.length} spellbooks available)`);
  }

  await cards[index]?.click();

  // Wait for navigation to detail page
  await waitForElementVisible(page, SELECTORS.SPELLBOOK_DETAIL_HEADER);
  await waitForElementVisible(page, SELECTORS.SPELLBOOK_TABLE);
}

/**
 * Clear all test data (localStorage and IndexedDB).
 * Useful for beforeEach hooks to ensure clean state.
 *
 * @param page Puppeteer page object
 */
export async function clearTestData(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(async () => {
    const dbName = 'DndSpellbookDB';
    return new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });
}
