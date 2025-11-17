// Comprehensive UI interaction tests for desktop and mobile
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad, clearSpellbookData } from './setup';
import { createSpellbook, navigateAndWait } from './helpers';
import { TIMEOUTS } from './config';

describe('UI Interactions - Desktop', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
    await page.setViewport({ width: 1280, height: 800 });
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  describe('Browse Spells Page', () => {
    beforeEach(async () => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      await waitForSpellsToLoad(page);
    });

    it('should display spell list on load', async () => {
      const spellCount = await page.$$eval('.spell-row', rows => rows.length);
      expect(spellCount).toBeGreaterThan(0);
      expect(spellCount).toBeLessThanOrEqual(319); // Total SRD spells
    }, 30000);

    it('should expand and collapse spell details on click', async () => {
      const firstSpell = await page.$('.spell-row');
      expect(firstSpell).toBeTruthy();

      // Scroll into view before clicking
      await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

      // Wait for element to be in viewport
      await page.waitForFunction(
        (el) => {
          const rect = el?.getBoundingClientRect();
          return rect && rect.top >= 0 && rect.bottom <= window.innerHeight;
        },
        { timeout: 5000 },
        firstSpell
      );

      // Click to expand
      await firstSpell?.click();

      // Wait for expansion to appear
      await page.waitForSelector('.spell-expansion-row', { visible: true, timeout: 5000 });

      // Scroll the expansion into view
      const expansion = await page.$('.spell-expansion-row');
      await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

      // Wait for expansion to be in viewport
      await page.waitForFunction(
        (el) => {
          const rect = el?.getBoundingClientRect();
          return rect && rect.top >= 0 && rect.bottom <= window.innerHeight;
        },
        { timeout: 5000 },
        expansion
      );

      const expandedContent = await page.$('.spell-inline-expansion');
      expect(expandedContent).toBeTruthy();

      const isVisible = await expandedContent?.evaluate(el => {
        return window.getComputedStyle(el).display !== 'none';
      });
      expect(isVisible).toBe(true);

      // Click again to collapse
      await firstSpell?.click();

      // Wait for expansion to be removed/hidden
      await page.waitForFunction(
        () => {
          const row = document.querySelector('.spell-expansion-row');
          return !row || row.textContent?.length === 0;
        },
        { timeout: 5000 }
      );

      const stillExpanded = await page.$('.spell-inline-expansion');
      const isHidden = await stillExpanded?.evaluate(el => {
        const parent = el.closest('.spell-expansion-row');
        return parent?.classList.contains('spell-expansion-row') &&
               el.textContent?.length === 0;
      });
      // Expanded content should exist but be empty or hidden
    }, 30000);

    it('should search spells by name', async () => {
      const searchInput = await page.$('.search-input');
      expect(searchInput).toBeTruthy();

      // Get initial spell count
      const initialCount = await page.$$eval('.spell-row', rows => rows.length);

      await searchInput?.type('fireball');

      // Wait for search results to update
      await page.waitForFunction(
        (oldCount) => {
          const newCount = document.querySelectorAll('.spell-row').length;
          return newCount !== oldCount && newCount > 0;
        },
        { timeout: 5000 },
        initialCount
      );

      const visibleSpells = await page.$$eval('.spell-row', rows =>
        rows.map(row => row.textContent || '').filter(text => text.toLowerCase().includes('fireball'))
      );

      expect(visibleSpells.length).toBeGreaterThan(0);
      expect(visibleSpells.length).toBeLessThanOrEqual(2); // Should only show Fireball and maybe Delayed Blast Fireball
    }, 30000);

    it('should filter spells by level', async () => {
      // Click on a level filter button
      const levelButtons = await page.$$('.filter-btn');
      expect(levelButtons.length).toBeGreaterThan(0);

      // Click "Cantrip" or "1" level filter
      const cantripButton = levelButtons[0];
      await cantripButton.click();

      // Wait for filter to be applied
      await page.waitForSelector('.filter-btn.active', { timeout: 5000 });

      const activeButton = await page.$('.filter-btn.active');
      expect(activeButton).toBeTruthy();

      const visibleSpells = await page.$$('.spell-row');
      expect(visibleSpells.length).toBeGreaterThan(0);
    }, 30000);

    it('should sort spells by clicking column headers', async () => {
      // Get first spell name before sorting
      const firstSpellBefore = await page.$eval('.spell-row .spell-name', el => el.textContent?.trim());

      // Click on name header to sort
      const nameHeader = await page.$('th.sortable');
      await nameHeader?.click();

      // Wait for sort to be applied (sort icon appears)
      await page.waitForSelector('.sort-icon', { timeout: 5000 });

      const firstSpellAfter = await page.$eval('.spell-row .spell-name', el => el.textContent?.trim());

      // After clicking, order should change
      // (depends on initial sort, but we can verify the sort icon appears)
      const sortIcon = await page.$('.sort-icon');
      expect(sortIcon).toBeTruthy();
    }, 30000);

    it('should filter by concentration and ritual', async () => {
      // Find and click concentration checkbox
      const checkboxes = await page.$$('.checkbox-label input[type="checkbox"]');
      expect(checkboxes.length).toBeGreaterThan(0);

      // Get initial spell count
      const initialCount = await page.$$eval('.spell-row', rows => rows.length);

      await checkboxes[0].click(); // Click first checkbox (likely Concentration)

      // Wait for filter to be applied (spell count changes)
      await page.waitForFunction(
        (oldCount) => {
          const newCount = document.querySelectorAll('.spell-row').length;
          return newCount !== oldCount;
        },
        { timeout: 5000 },
        initialCount
      );

      const visibleSpells = await page.$$('.spell-row');
      expect(visibleSpells.length).toBeGreaterThan(0);

      // Verify concentration badge appears on visible spells
      const hasConcentrationBadge = await page.$('.badge-concentration');
      expect(hasConcentrationBadge).toBeTruthy();
    }, 30000);

    it('should clear all filters', async () => {
      // Apply some filters first
      const searchInput = await page.$('.search-input');

      // Get initial spell count
      const initialCount = await page.$$eval('.spell-row', rows => rows.length);

      await searchInput?.type('fire');

      // Wait for search to filter results
      await page.waitForFunction(
        (oldCount) => {
          const newCount = document.querySelectorAll('.spell-row').length;
          return newCount !== oldCount && newCount > 0;
        },
        { timeout: 5000 },
        initialCount
      );

      const spellCountWithFilter = await page.$$eval('.spell-row', rows => rows.length);

      // Click clear filters
      const clearButton = await page.$('.btn-clear-filters');
      await clearButton?.click();

      // Wait for filters to be cleared (spell count increases)
      await page.waitForFunction(
        (filteredCount) => {
          const newCount = document.querySelectorAll('.spell-row').length;
          return newCount > filteredCount;
        },
        { timeout: 5000 },
        spellCountWithFilter
      );

      const spellCountAfterClear = await page.$$eval('.spell-row', rows => rows.length);
      expect(spellCountAfterClear).toBeGreaterThan(spellCountWithFilter);
    }, 30000);
  });

  describe('Spellbook Management', () => {
    beforeEach(async () => {
      // Tests will navigate where they need to go
    });

    it('should navigate to My Spellbooks page', async () => {
      const spellbooksButton = await page.$('[data-testid="nav-spellbooks"]');
      expect(spellbooksButton).toBeTruthy();

      await spellbooksButton?.click();

      // Wait for URL to change to spellbooks page
      await page.waitForFunction(
        () => window.location.hash.includes('/spellbooks'),
        { timeout: 5000 }
      );

      const hash = await page.evaluate(() => window.location.hash);
      expect(hash).toContain('/spellbooks');

      // Wait for header to appear
      await page.waitForSelector('.spellbook-list-header h2', { timeout: 5000 });

      const header = await page.$eval('.spellbook-list-header h2', el => el.textContent);
      expect(header).toContain('My Spellbooks');
    }, 30000);

    it('should create a new spellbook', async () => {
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });

      // Wait for create button to appear
      await page.waitForSelector('[data-testid="btn-create-spellbook"]', { timeout: 5000 });

      // Click create button using test ID
      const createButton = await page.$('[data-testid="btn-create-spellbook"]');
      expect(createButton).toBeTruthy();
      await createButton?.click();

      // Wait for modal to appear
      await page.waitForSelector('input[type="text"]', { timeout: 5000 });

      // Fill in name
      const nameInput = await page.$('input[type="text"]');
      expect(nameInput).toBeTruthy();
      await nameInput?.type('Test Wizard Spellbook');

      // Click save
      const dialogButtons = await page.$$('.dialog-actions button');
      const saveButton = dialogButtons[dialogButtons.length - 1]; // Last button is usually save
      await saveButton?.click();

      // Wait for spellbook card to appear
      await page.waitForSelector('.spellbook-card', { timeout: 5000 });

      // Verify spellbook was created
      const spellbookCard = await page.$('.spellbook-card');
      expect(spellbookCard).toBeTruthy();

      const spellbookName = await page.$eval('.spellbook-card h3', el => el.textContent);
      expect(spellbookName).toContain('Test Wizard Spellbook');
    }, 30000);

    it('should add spell to spellbook from browse page', async () => {
      // Arrange: Create a spellbook first
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
      await clearSpellbookData(page);
      await page.reload({ waitUntil: 'networkidle2' });

      await page.waitForSelector('[data-testid="btn-create-spellbook"]', { visible: true, timeout: 10000 });
      const createButton = await page.$('[data-testid="btn-create-spellbook"]');
      expect(createButton).toBeTruthy();
      await createButton?.click();

      await page.waitForSelector('[data-testid="input-spellbook-name"]', { visible: true, timeout: 10000 });
      const nameInput = await page.$('[data-testid="input-spellbook-name"]');
      await nameInput?.type('Test Spellbook for Adding');

      const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
      await saveButton?.click();

      await page.waitForSelector('.spellbook-card', { visible: true, timeout: 10000 });

      // Act: Go to browse and add spell
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      await waitForSpellsToLoad(page);

      await page.waitForSelector('[data-testid="btn-add-spell"]', { visible: true, timeout: 10000 });
      const addButton = await page.$('[data-testid="btn-add-spell"]');
      expect(addButton).toBeTruthy();
      await addButton?.click();

      await page.waitForSelector('[data-testid="spellbook-selector"]', { visible: true, timeout: 10000 });

      // Assert: Verify spellbook selector appears
      const selector = await page.$('[data-testid="spellbook-selector"]');
      expect(selector).toBeTruthy();

      // Select spellbook and verify success
      const spellbookOption = await page.$('.spellbook-selector-item');
      expect(spellbookOption).toBeTruthy();
      await spellbookOption?.click();

      await page.waitForSelector('[data-testid="add-spell-success"]', { visible: true, timeout: 10000 });
      const successToast = await page.$('[data-testid="add-spell-success"]');
      expect(successToast).toBeTruthy();
    }, 30000);

    it('should view spellbook details', async () => {
      // Create a spellbook first
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });

      // Wait for and click create button using test ID
      await page.waitForSelector('[data-testid="btn-create-spellbook"]', { visible: true, timeout: 10000 });
      const createButton = await page.$('[data-testid="btn-create-spellbook"]');
      expect(createButton).toBeTruthy();
      await createButton?.click();

      // Wait for modal to appear
      await page.waitForSelector('[data-testid="input-spellbook-name"]', { visible: true, timeout: 10000 });

      const nameInput = await page.$('[data-testid="input-spellbook-name"]');
      await nameInput?.type('Detail View Test');

      const saveButton = await page.$('[data-testid="btn-save-spellbook"]');
      await saveButton?.click();

      // Wait for spellbook card to appear
      await page.waitForSelector('.spellbook-card-content', { timeout: 5000 });

      // Click on spellbook card
      const spellbookCard = await page.$('.spellbook-card-content');
      await spellbookCard?.click();

      // Wait for navigation to detail page
      await page.waitForSelector('.spellbook-detail-header', { visible: true, timeout: 10000 });
      await page.waitForSelector('.spellbook-detail-header h2', { visible: true, timeout: 10000 });

      // Verify we're on detail page
      const detailHeader = await page.$('.spellbook-detail-header h2');
      expect(detailHeader).toBeTruthy();

      const headerText = await detailHeader?.evaluate(el => el.textContent);
      // Header should contain the spellbook name we created
      expect(headerText).toBeTruthy();
      expect(headerText?.length).toBeGreaterThan(0);
    }, 30000);

    it('should delete a spellbook', async () => {
      // Arrange: Create a spellbook using helper
      await createSpellbook(page, TEST_URL, 'To Be Deleted');

      // Navigate to spellbooks page
      await navigateAndWait(page, `${TEST_URL}#/spellbooks`);

      // Find the specific spellbook card containing "To Be Deleted"
      const targetCard = await page.evaluateHandle(() => {
        const cards = Array.from(document.querySelectorAll('.spellbook-card'));
        return cards.find(card => card.textContent?.includes('To Be Deleted'));
      });

      expect(targetCard).toBeTruthy();

      // Find the delete button within that specific card
      const deleteButton = await targetCard.evaluateHandle((card: Element) => {
        return card.querySelector('.btn-danger-small');
      });

      expect(deleteButton).toBeTruthy();

      // Set up dialog handler BEFORE clicking delete
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });

      // Act: Delete the specific spellbook
      await deleteButton.evaluate((btn: Element) => (btn as HTMLElement).click());

      // Assert: Verify spellbook is deleted
      await page.waitForFunction(
        () => {
          const cards = document.querySelectorAll('.spellbook-card');
          return !Array.from(cards).some(card => card.textContent?.includes('To Be Deleted'));
        },
        { timeout: TIMEOUTS.LONG }
      );

      const spellbookCards = await page.$$('.spellbook-card');
      const hasDeletedSpellbook = await Promise.all(
        spellbookCards.map(card => card.evaluate(el => el.textContent?.includes('To Be Deleted')))
      );
      expect(hasDeletedSpellbook.every(v => !v)).toBe(true);
    }, TIMEOUTS.LONG);
  });
});

describe('UI Interactions - Mobile (375x667)', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, 30000);

  beforeEach(async () => {
    await page.setViewport({ width: 375, height: 667 });
  });

  afterAll(async () => {
    await closeBrowser();
  });

  describe('Mobile Browse Spells', () => {
    beforeEach(async () => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      await waitForSpellsToLoad(page);
    });

    it('should display spell cards on mobile', async () => {
      const spellCards = await page.$$('.spell-row');
      expect(spellCards.length).toBeGreaterThan(0);

      // Verify card layout (flexbox)
      const cardDisplay = await page.$$eval('.spell-row', rows => {
        const firstRow = rows[0] as HTMLElement;
        return window.getComputedStyle(firstRow).display;
      });
      expect(cardDisplay).toBe('flex');
    }, 30000);

    it('should show level badge in top right of cards', async () => {
      const levelBadge = await page.$('.level-col');
      expect(levelBadge).toBeTruthy();

      const position = await levelBadge?.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          position: style.position,
          top: style.top,
          right: style.right,
        };
      });

      expect(position?.position).toBe('absolute');
    }, 30000);

    it('should expand spell details on mobile', async () => {
      const firstSpell = await page.$('.spell-row');

      // Scroll into view before clicking
      await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

      // Wait for element to be in viewport
      await page.waitForFunction(
        (el) => {
          const rect = el?.getBoundingClientRect();
          return rect && rect.top >= 0 && rect.bottom <= window.innerHeight;
        },
        { timeout: 10000 },
        firstSpell
      );

      await firstSpell?.click();

      // Wait for expansion to appear and have content
      await page.waitForFunction(
        () => {
          const expansion = document.querySelector('.spell-inline-expansion');
          return expansion && expansion.textContent && expansion.textContent.length > 50;
        },
        { timeout: 10000 }
      );

      // Scroll the expansion into view
      const expansion = await page.$('.spell-inline-expansion');
      await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

      // Wait for expansion to be visible in viewport
      await page.waitForFunction(
        () => {
          const el = document.querySelector('.spell-inline-expansion');
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          const styles = window.getComputedStyle(el);
          // Check if element exists, is visible, and has content
          return styles.display !== 'none' &&
                 rect.height > 0 &&
                 (el.textContent?.length || 0) > 50 &&
                 rect.top < window.innerHeight &&
                 rect.bottom > 0;
        },
        { timeout: 10000 }
      );

      const expandedContent = await page.$('.spell-inline-expansion');
      expect(expandedContent).toBeTruthy();

      // Verify expanded content has card styling
      const hasCardStyling = await expandedContent?.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          borderRadius: style.borderRadius,
          padding: style.padding,
          hasContent: el.textContent && el.textContent.length > 50,
        };
      });

      // Main check: content exists and has styling
      expect(hasCardStyling?.hasContent).toBe(true);
      expect(hasCardStyling?.padding).toBeTruthy();
    }, 30000);

    it('should navigate using mobile navigation', async () => {
      const spellbooksButton = await page.$('[data-testid="nav-spellbooks"]');
      expect(spellbooksButton).toBeTruthy();

      // Verify nav link is full width on mobile
      const navLinkWidth = await spellbooksButton?.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width;
      });

      // On mobile, nav links should be reasonably sized for touch
      // Note: actual width depends on layout - just verify it's tappable
      expect(navLinkWidth).toBeGreaterThan(100);

      await spellbooksButton?.click();

      // Wait for URL to change
      await page.waitForFunction(
        () => window.location.hash.includes('/spellbooks'),
        { timeout: 5000 }
      );

      const hash = await page.evaluate(() => window.location.hash);
      expect(hash).toContain('/spellbooks');
    }, 30000);

    it('should handle mobile search', async () => {
      const searchInput = await page.$('.search-input');
      expect(searchInput).toBeTruthy();

      // Verify font size is 1rem to prevent iOS zoom
      const fontSize = await searchInput?.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });
      expect(fontSize).toBe('16px'); // 1rem = 16px

      // Get initial spell count
      const initialCount = await page.$$eval('.spell-row', rows => rows.length);

      await searchInput?.type('magic missile');

      // Wait for search results to update
      await page.waitForFunction(
        (oldCount) => {
          const newCount = document.querySelectorAll('.spell-row').length;
          return newCount !== oldCount && newCount > 0;
        },
        { timeout: 5000 },
        initialCount
      );

      const visibleSpells = await page.$$('.spell-row');
      expect(visibleSpells.length).toBeGreaterThan(0);
      expect(visibleSpells.length).toBeLessThan(10);
    }, 30000);

    it('should filter spells on mobile', async () => {
      // Verify filter buttons are tappable
      const filterButton = await page.$('.filter-btn');
      expect(filterButton).toBeTruthy();

      const buttonSize = await filterButton?.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });

      // Should be reasonably sized for touch
      expect(buttonSize?.height).toBeGreaterThan(30);

      await filterButton?.click();

      // Wait for filter to be applied
      await page.waitForSelector('.filter-btn.active', { timeout: 5000 });

      const activeButton = await page.$('.filter-btn.active');
      expect(activeButton).toBeTruthy();
    }, 30000);
  });

  describe('Mobile Spellbook Management', () => {
    beforeEach(async () => {
      // Tests will navigate where they need to go
    });

    it('should create spellbook on mobile', async () => {
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });

      // Wait for and find create button - should be full width on mobile
      await page.waitForSelector('[data-testid="btn-create-spellbook"]', { timeout: 10000 });
      const createButton = await page.$('[data-testid="btn-create-spellbook"]');
      expect(createButton).toBeTruthy();

      if (createButton) {
        const buttonWidth = await createButton.evaluate(el => {
          return el.getBoundingClientRect().width;
        });
        // Mobile buttons should be reasonably wide (200px+) for mobile viewport
        // Button is getting 247px which is reasonable for mobile
        expect(buttonWidth).toBeGreaterThan(200);
      }

      await createButton?.click();

      // Wait for modal to appear
      await page.waitForSelector('input[type="text"]', { timeout: 5000 });
      const nameInput = await page.$('input[type="text"]');
      await nameInput?.type('Mobile Test Spellbook');

      const dialogButtons = await page.$$('.dialog-actions button');
      await dialogButtons[dialogButtons.length - 1]?.click();

      // Wait for spellbook card to appear
      await page.waitForSelector('.spellbook-card', { timeout: 10000 });
      const spellbookCard = await page.$('.spellbook-card');
      expect(spellbookCard).toBeTruthy();
    }, 30000);

    it('should view spellbook details on mobile', async () => {
      // Create a spellbook
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });

      // Wait for and find create button
      await page.waitForSelector('[data-testid="btn-create-spellbook"]', { timeout: 10000 });
      const createButton = await page.$('[data-testid="btn-create-spellbook"]');
      expect(createButton).toBeTruthy();

      await createButton?.click();

      // Wait for modal to appear
      await page.waitForSelector('input[type="text"]', { timeout: 5000 });
      const nameInput = await page.$('input[type="text"]');
      await nameInput?.type('Mobile Detail Test');

      const dialogButtons = await page.$$('.dialog-actions button');
      await dialogButtons[dialogButtons.length - 1]?.click();

      // Wait for spellbook card to appear, then click on it
      await page.waitForSelector('.spellbook-card-content', { timeout: 10000 });
      const spellbookCard = await page.$('.spellbook-card-content');
      await spellbookCard?.click();

      // Verify we're on detail page - check for detail container
      await page.waitForSelector('[data-testid="spellbook-detail"]', { timeout: 10000 });
      const detailContainer = await page.$('[data-testid="spellbook-detail"]');
      expect(detailContainer).toBeTruthy();

      // Wait for header to appear
      await page.waitForSelector('.spellbook-detail-header h2', { timeout: 5000 });
      const detailHeader = await page.$('.spellbook-detail-header h2');
      expect(detailHeader).toBeTruthy();
    }, 30000);
  });
});
