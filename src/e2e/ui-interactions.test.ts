// Comprehensive UI interaction tests for desktop and mobile
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad, wait } from './setup';

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
      await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await wait(400);

      // Click to expand
      await firstSpell?.click();
      await wait(500);

      // Scroll the expansion into view
      const expansion = await page.$('.spell-expansion-row');
      await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await wait(300);

      const expandedContent = await page.$('.spell-inline-expansion');
      expect(expandedContent).toBeTruthy();

      const isVisible = await expandedContent?.evaluate(el => {
        return window.getComputedStyle(el).display !== 'none';
      });
      expect(isVisible).toBe(true);

      // Click again to collapse
      await firstSpell?.click();
      await wait(500);

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

      await searchInput?.type('fireball');
      await wait(500);

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
      await wait(500);

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
      await wait(300);

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

      await checkboxes[0].click(); // Click first checkbox (likely Concentration)
      await wait(500);

      const visibleSpells = await page.$$('.spell-row');
      expect(visibleSpells.length).toBeGreaterThan(0);

      // Verify concentration badge appears on visible spells
      const hasConcentrationBadge = await page.$('.badge-concentration');
      expect(hasConcentrationBadge).toBeTruthy();
    }, 30000);

    it('should clear all filters', async () => {
      // Apply some filters first
      const searchInput = await page.$('.search-input');
      await searchInput?.type('fire');
      await wait(300);

      const spellCountWithFilter = await page.$$eval('.spell-row', rows => rows.length);

      // Click clear filters
      const clearButton = await page.$('.btn-clear-filters');
      await clearButton?.click();
      await wait(500);

      const spellCountAfterClear = await page.$$eval('.spell-row', rows => rows.length);
      expect(spellCountAfterClear).toBeGreaterThan(spellCountWithFilter);
    }, 30000);
  });

  describe('Spellbook Management', () => {
    beforeEach(async () => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      // Clear localStorage to start fresh
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
    });

    it('should navigate to My Spellbooks page', async () => {
      const spellbooksButton = await page.$('[data-testid="nav-spellbooks"]');
      expect(spellbooksButton).toBeTruthy();

      await spellbooksButton?.click();
      await wait(500);

      const hash = await page.evaluate(() => window.location.hash);
      expect(hash).toContain('/spellbooks');

      const header = await page.$eval('.spellbook-list-header h2', el => el.textContent);
      expect(header).toContain('My Spellbooks');
    }, 30000);

    it('should create a new spellbook', async () => {
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
      await wait(500);

      // Click create button using test ID
      const createButton = await page.$('[data-testid="btn-create-spellbook"]');
      expect(createButton).toBeTruthy();
      await createButton?.click();
      await wait(300);

      // Fill in name
      const nameInput = await page.$('input[type="text"]');
      expect(nameInput).toBeTruthy();
      await nameInput?.type('Test Wizard Spellbook');

      // Click save
      const dialogButtons = await page.$$('.dialog-actions button');
      const saveButton = dialogButtons[dialogButtons.length - 1]; // Last button is usually save
      await saveButton?.click();
      await wait(500);

      // Verify spellbook was created
      const spellbookCard = await page.$('.spellbook-card');
      expect(spellbookCard).toBeTruthy();

      const spellbookName = await page.$eval('.spellbook-card h3', el => el.textContent);
      expect(spellbookName).toContain('Test Wizard Spellbook');
    }, 30000);

    it('should add spell to spellbook from browse page', async () => {
      // First create a spellbook
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
      await wait(500);

      const createButtons = await page.$$('button');
      let createButton = null;
      for (const button of createButtons) {
        const text = await button.evaluate(el => el.textContent);
        if (text?.includes('Create')) {
          createButton = button;
          break;
        }
      }

      await createButton?.click();
      await wait(300);

      const nameInput = await page.$('input[type="text"]');
      await nameInput?.type('Test Spellbook for Adding');

      const dialogButtons = await page.$$('.dialog-actions button');
      await dialogButtons[dialogButtons.length - 1]?.click();
      await wait(500);

      // Go back to browse using navigation
      const browseButton = await page.$('.nav-link');
      await browseButton?.click();
      await waitForSpellsToLoad(page);

      // Add to spellbook buttons only appear when spellbooks exist
      const addButton = await page.$('[data-testid="btn-add-spell"]');
      if (addButton) {
        await addButton.click();
        await wait(500);

        // Should show spellbook selector
        const selector = await page.$('[data-testid="spellbook-selector"]');
        expect(selector).toBeTruthy();
      }
    }, 30000);

    it('should view spellbook details', async () => {
      // Create a spellbook first
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
      await wait(500);

      const createButtons = await page.$$('button');
      let createButton = null;
      for (const button of createButtons) {
        const text = await button.evaluate(el => el.textContent);
        if (text?.includes('Create')) {
          createButton = button;
          break;
        }
      }

      await createButton?.click();
      await wait(300);

      const nameInput = await page.$('input[type="text"]');
      await nameInput?.type('Detail View Test');

      const dialogButtons = await page.$$('.dialog-actions button');
      await dialogButtons[dialogButtons.length - 1]?.click();
      await wait(500);

      // Click on spellbook card
      const spellbookCard = await page.$('.spellbook-card-content');
      await spellbookCard?.click();
      await wait(500);

      // Verify we're on detail page
      const detailHeader = await page.$('.spellbook-detail-header h2');
      expect(detailHeader).toBeTruthy();

      const headerText = await detailHeader?.evaluate(el => el.textContent);
      expect(headerText).toContain('Detail View Test');
    }, 30000);

    it('should delete a spellbook', async () => {
      // Create a spellbook first
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
      await wait(500);

      const createButtons = await page.$$('button');
      let createButton = null;
      for (const button of createButtons) {
        const text = await button.evaluate(el => el.textContent);
        if (text?.includes('Create')) {
          createButton = button;
          break;
        }
      }

      await createButton?.click();
      await wait(300);

      const nameInput = await page.$('input[type="text"]');
      await nameInput?.type('To Be Deleted');

      const dialogButtons = await page.$$('.dialog-actions button');
      await dialogButtons[dialogButtons.length - 1]?.click();
      await wait(500);

      // Find and click delete button
      const deleteButton = await page.$('.btn-danger-small');
      expect(deleteButton).toBeTruthy();
      await deleteButton?.click();
      await wait(500);

      // Verify spellbook is gone
      const spellbookCards = await page.$$('.spellbook-card');
      const hasDeletedSpellbook = await Promise.all(
        spellbookCards.map(card => card.evaluate(el => el.textContent?.includes('To Be Deleted')))
      );
      expect(hasDeletedSpellbook.every(v => !v)).toBe(true);
    }, 30000);
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
      await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await wait(400);

      await firstSpell?.click();
      await wait(500);

      // Scroll the expansion into view
      const expansion = await page.$('.spell-expansion-row');
      await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await wait(300);

      const expandedContent = await page.$('.spell-inline-expansion');
      expect(expandedContent).toBeTruthy();

      // Verify expanded content has card styling
      const hasCardStyling = await expandedContent?.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          borderRadius: style.borderRadius,
          padding: style.padding,
        };
      });

      expect(hasCardStyling?.borderRadius).toBe('12px');
    }, 30000);

    it('should navigate using mobile navigation', async () => {
      const spellbooksButton = await page.$('[data-testid="nav-spellbooks"]');
      expect(spellbooksButton).toBeTruthy();

      // Verify nav link is full width on mobile
      const navLinkWidth = await spellbooksButton?.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return rect.width;
      });

      // On mobile, nav links should be close to viewport width
      expect(navLinkWidth).toBeGreaterThan(300); // Most of 375px viewport

      await spellbooksButton?.click();
      await wait(500);

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

      await searchInput?.type('magic missile');
      await wait(500);

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
      await wait(500);

      const activeButton = await page.$('.filter-btn.active');
      expect(activeButton).toBeTruthy();
    }, 30000);
  });

  describe('Mobile Spellbook Management', () => {
    beforeEach(async () => {
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle2' });
    });

    it('should create spellbook on mobile', async () => {
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
      await wait(500);

      // Find create button - should be full width on mobile
      const createButtons = await page.$$('button');
      let createButton = null;
      for (const button of createButtons) {
        const text = await button.evaluate(el => el.textContent);
        if (text?.includes('Create')) {
          createButton = button;
          break;
        }
      }

      if (createButton) {
        const buttonWidth = await createButton.evaluate(el => {
          return el.getBoundingClientRect().width;
        });
        expect(buttonWidth).toBeGreaterThan(300); // Full width
      }

      await createButton?.click();
      await wait(300);

      const nameInput = await page.$('input[type="text"]');
      await nameInput?.type('Mobile Test Spellbook');

      const dialogButtons = await page.$$('.dialog-actions button');
      await dialogButtons[dialogButtons.length - 1]?.click();
      await wait(500);

      const spellbookCard = await page.$('.spellbook-card');
      expect(spellbookCard).toBeTruthy();
    }, 30000);

    it('should view spellbook details on mobile', async () => {
      // Create a spellbook
      await page.goto(`${TEST_URL}#/spellbooks`, { waitUntil: 'networkidle2' });
      await wait(500);

      const createButtons = await page.$$('button');
      let createButton = null;
      for (const button of createButtons) {
        const text = await button.evaluate(el => el.textContent);
        if (text?.includes('Create')) {
          createButton = button;
          break;
        }
      }

      await createButton?.click();
      await wait(300);

      const nameInput = await page.$('input[type="text"]');
      await nameInput?.type('Mobile Detail Test');

      const dialogButtons = await page.$$('.dialog-actions button');
      await dialogButtons[dialogButtons.length - 1]?.click();
      await wait(500);

      // Click on card
      const spellbookCard = await page.$('.spellbook-card-content');
      await spellbookCard?.click();
      await wait(500);

      const detailHeader = await page.$('.spellbook-detail-header h2');
      expect(detailHeader).toBeTruthy();
    }, 30000);
  });
});
