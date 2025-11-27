/**
 * E2E Test Configuration
 *
 * Centralized configuration for E2E tests including timeout constants.
 *
 * Timeout Strategy:
 * - Use SHORT for quick DOM queries and simple interactions
 * - Use MEDIUM for navigation, modal appearance, API calls
 * - Use LONG for complex multi-step operations
 * - Use VERY_LONG for full end-to-end workflows
 *
 * Best Practice: Always use explicit waits (waitForSelector, waitForFunction)
 * instead of arbitrary delays (page.waitForTimeout, sleep). This ensures
 * tests wait for actual conditions rather than guessing timing.
 */

export const TEST_URL = process.env.TEST_URL || 'http://localhost:5173';

/**
 * Timeout constants for different operation types.
 * All values in milliseconds.
 */
export const TIMEOUTS = {
  /** Quick operations: button clicks, simple queries (5s) */
  SHORT: 5000,

  /** Normal operations: navigation, modals, API calls (10s) */
  MEDIUM: 10000,

  /** Complex operations: multi-step workflows (30s) */
  LONG: 30000,

  /** Full E2E workflows with multiple steps (60s) */
  VERY_LONG: 60000,

  /** Page load and network idle (30s) */
  PAGE_LOAD: 30000,
} as const;




/**
 * Viewport configurations for different device types
 */
export const VIEWPORTS = {
  MOBILE_SMALL: { width: 375, height: 667 },   // iPhone SE
  MOBILE_LARGE: { width: 414, height: 896 },   // iPhone 14 Pro Max
  TABLET: { width: 768, height: 1024 },         // iPad
  DESKTOP: { width: 1280, height: 800 },        // Standard desktop
  DESKTOP_LARGE: { width: 1920, height: 1080 }, // Full HD
} as const;

/**
 * Test data identifiers
 */
export const TEST_IDS = {
  // Navigation
  NAV_SPELLBOOKS: '[data-testid="nav-spellbooks"]',

  // Spellbooks page
  SPELLBOOKS_HEADER: '[data-testid="spellbooks-header"]',
  SPELLBOOKS_EMPTY: '[data-testid="spellbooks-empty"]',
  BTN_CREATE_SPELLBOOK: '[data-testid="btn-create-spellbook"]',

  // Create spellbook dialog
  CREATE_SPELLBOOK_DIALOG: '[data-testid="create-spellbook-dialog"]',
  INPUT_SPELLBOOK_NAME: 'spellbook-name-input',
  BTN_SAVE_SPELLBOOK: '[data-testid="btn-save-spellbook"]',

  // Spellbook list
  SPELLBOOK_ITEM: '[data-testid^="spellbook-item-"]',
  SPELLBOOK_NAME: '[data-testid="spellbook-name"]',

  // Spellbook detail
  SPELLBOOK_DETAIL: '[data-testid="spellbook-detail"]',
  SPELLBOOK_DETAIL_NAME: '[data-testid="spellbook-detail-name"]',
  SPELLBOOK_SPELL_LIST: '[data-testid="spellbook-spell-list"]',

  // Spell actions
  BTN_ADD_SPELL: '[data-testid="btn-add-spell"]',
  SPELLBOOK_SELECTOR: '[data-testid="spellbook-selector"]',
  ADD_SPELL_SUCCESS: '[data-testid="add-spell-success"]',
  TOGGLE_PREPARED: '[data-testid="toggle-prepared"]',
} as const;

/**
 * CSS selectors for common elements
 */
export const SELECTORS = {
  // Layout
  APP_HEADER: '.app-header',
  BROWSE_HEADER: '.browse-header',

  // Spell table
  SPELL_TABLE: '.spell-table',
  SPELL_ROW: '.spell-row',
  SPELL_EXPANSION_ROW: '.spell-expansion-row',
  SPELL_INLINE_EXPANSION: '.spell-inline-expansion',
  SPELL_DESCRIPTION: '.spell-description',
  SPELL_EXPANDED_DESCRIPTION: '.spell-expanded-description',

  // Spellbook elements
  SPELLBOOK_CARD: '.spellbook-row',
  SPELLBOOK_CARD_CONTENT: '.spellbook-row',
  SPELLBOOK_COUNT: '.spellbook-count',
  SPELLBOOK_PREPARED: '.spellbook-prepared',
  SPELLBOOK_TABLE: '.spellbook-table',
  SPELLBOOK_DETAIL_HEADER: '.spellbook-detail-header',
  SPELLBOOK_DETAIL_EMPTY: '.spellbook-detail-empty',

  // Buttons
  BTN_ADD_SMALL: '.btn-add-small',
  BTN_REMOVE_SMALL: '.btn-remove-small',

  // Table columns
  LEVEL_COL: '.level-col',
  ACTION_COL: '.action-col',
  PREPARED_COL: '.prepared-col',
  SOURCE_COL: '.source-col',

  // Spellbook selector
  SPELLBOOK_SELECTOR_ITEM: '.spellbook-selector-item',
} as const;
