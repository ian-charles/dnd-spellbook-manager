// Mobile UI E2E tests to verify responsive layout and no horizontal scrolling
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad, wait } from './setup';

describe('Mobile UI Tests', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  describe('Mobile Viewport (375x667 - iPhone SE)', () => {
    beforeEach(async () => {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      await waitForSpellsToLoad(page);
    });

    it('should not have horizontal scrolling on mobile', async () => {
      // Check that body width doesn't exceed viewport width
      const scrollWidth = await page.evaluate(() => {
        return {
          bodyScrollWidth: document.body.scrollWidth,
          bodyClientWidth: document.body.clientWidth,
          documentScrollWidth: document.documentElement.scrollWidth,
          documentClientWidth: document.documentElement.clientWidth,
          viewportWidth: window.innerWidth,
        };
      });

      // Body and document should not be wider than viewport
      expect(scrollWidth.bodyScrollWidth).toBeLessThanOrEqual(scrollWidth.viewportWidth + 1); // Allow 1px for rounding
      expect(scrollWidth.documentScrollWidth).toBeLessThanOrEqual(scrollWidth.viewportWidth + 1);

      // No elements should cause overflow
      const hasOverflow = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            console.log('Overflow element:', el.className, 'Right:', rect.right, 'ViewportWidth:', window.innerWidth);
            return true;
          }
        }
        return false;
      });

      expect(hasOverflow).toBe(false);
    }, 30000);

    it('should display spell cards instead of table on mobile', async () => {
      // Check that table structure is converted to cards
      const isCardLayout = await page.evaluate(() => {
        const thead = document.querySelector('.spell-table thead');
        const theadStyle = thead ? window.getComputedStyle(thead) : null;

        // Table header should be hidden on mobile
        return theadStyle?.display === 'none';
      });

      expect(isCardLayout).toBe(true);
    }, 30000);

    it('should have touch-friendly button sizes (minimum 44px)', async () => {
      // Check add to spellbook buttons
      const addButtons = await page.$$('.btn-add-small');
      expect(addButtons.length).toBeGreaterThan(0);

      for (const button of addButtons.slice(0, 5)) { // Check first 5
        const size = await button.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });

        expect(size.width).toBeGreaterThanOrEqual(44);
        expect(size.height).toBeGreaterThanOrEqual(44);
      }
    }, 30000);

    it('should display spell cards with level badge in top right', async () => {
      const firstCard = await page.$('.spell-table tbody tr');
      expect(firstCard).toBeTruthy();

      const cardLayout = await page.evaluate(() => {
        const row = document.querySelector('.spell-table tbody tr');
        const levelCol = row?.querySelector('.level-col');
        const actionCol = row?.querySelector('.action-col');

        if (!levelCol || !actionCol) return null;

        const style = window.getComputedStyle(levelCol);
        const levelRect = levelCol.getBoundingClientRect();
        const actionRect = actionCol.getBoundingClientRect();
        const rowRect = row.getBoundingClientRect();

        // Badge should be:
        // 1. Positioned absolutely
        // 2. In the top section (within 50px of top)
        // 3. In the right section (more than halfway across the row)
        // 4. Left of the action button (not overlapping)
        const isInTopArea = levelRect.top <= (rowRect.top + 50);
        const isInRightHalf = levelRect.left > (rowRect.left + rowRect.width / 2);
        const isLeftOfButton = levelRect.right <= actionRect.left;

        return {
          position: style.position,
          isInTopArea,
          isInRightHalf,
          isLeftOfButton,
          isValidLayout: isInTopArea && isInRightHalf && isLeftOfButton,
        };
      });

      expect(cardLayout?.position).toBe('absolute');
      expect(cardLayout?.isValidLayout).toBe(true);
    }, 30000);

    it('should display touch-friendly action buttons positioned in top right', async () => {
      const firstButton = await page.$('.spell-table .btn-add-small');
      expect(firstButton).toBeTruthy();

      const buttonInfo = await firstButton?.evaluate(el => {
        const parent = el.closest('tr');
        const actionCol = el.closest('.action-col');
        const parentRect = parent?.getBoundingClientRect();
        const buttonRect = el.getBoundingClientRect();
        const actionColStyle = actionCol ? window.getComputedStyle(actionCol) : null;

        // Button column should be:
        // 1. Touch-friendly size (44x44 minimum)
        // 2. Column positioned absolutely in top right
        // 3. Properly spaced from right edge
        const isTouchFriendly = buttonRect.width >= 44 && buttonRect.height >= 44;
        const isPositionedAbsolute = actionColStyle?.position === 'absolute';
        const distanceFromRight = (parentRect?.right || 0) - buttonRect.right;
        const isNearRightEdge = distanceFromRight >= 0 && distanceFromRight <= 20; // Within 20px of right edge

        return {
          width: buttonRect.width,
          height: buttonRect.height,
          isTouchFriendly,
          isPositionedAbsolute,
          isNearRightEdge,
          isValidButton: isTouchFriendly && isPositionedAbsolute && isNearRightEdge,
        };
      });

      expect(buttonInfo?.isValidButton).toBe(true);
    }, 30000);

    it('should show spell expanded view as card on mobile', async () => {
      // Click on first spell to expand
      const firstSpell = await page.$('.spell-row');
      expect(firstSpell).toBeTruthy();

      // Scroll into view before clicking
      await firstSpell?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await wait(400);

      await firstSpell?.click();
      await wait(500); // Wait for animation

      // Scroll the expansion into view
      const expansion = await page.$('.spell-expansion-row');
      await expansion?.evaluate((el: Element) => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      await wait(300);

      // Check expanded content exists and has content
      const expandedContent = await page.evaluate(() => {
        const expanded = document.querySelector('.spell-inline-expansion');
        if (!expanded) return null;

        const style = window.getComputedStyle(expanded);
        return {
          exists: true,
          opacity: style.opacity,
          height: parseInt(style.height),
          textLength: expanded.textContent?.length || 0,
        };
      });

      expect(expandedContent?.exists).toBe(true);
      expect(expandedContent?.opacity).toBe('1');
      expect(expandedContent?.height).toBeGreaterThan(100); // Should have height
      expect(expandedContent?.textLength).toBeGreaterThan(50); // Should have text content
    }, 30000);

    it('should handle navigation without horizontal scroll', async () => {
      // Navigate to My Spellbooks
      await page.click('[data-testid="nav-spellbooks"]');
      await wait(500);

      const spellbooksScroll = await page.evaluate(() => {
        return {
          scrollWidth: document.body.scrollWidth,
          clientWidth: document.body.clientWidth,
          viewportWidth: window.innerWidth,
        };
      });

      expect(spellbooksScroll.scrollWidth).toBeLessThanOrEqual(spellbooksScroll.viewportWidth + 1);

      // Navigate back to Browse
      const browseButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button.nav-link'));
        return buttons.find(btn => btn.textContent?.includes('Browse Spells'));
      });
      await browseButton.click();
      await waitForSpellsToLoad(page);

      const browseScroll = await page.evaluate(() => {
        return {
          scrollWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      expect(browseScroll.scrollWidth).toBeLessThanOrEqual(browseScroll.viewportWidth + 1);
    }, 30000);
  });

  describe('Tablet Viewport (768x1024 - iPad)', () => {
    beforeEach(async () => {
      await page.setViewport({ width: 768, height: 1024 });
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      await waitForSpellsToLoad(page);
    });

    it('should not have horizontal scrolling on tablet', async () => {
      const scrollWidth = await page.evaluate(() => {
        return {
          bodyScrollWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      expect(scrollWidth.bodyScrollWidth).toBeLessThanOrEqual(scrollWidth.viewportWidth + 1);
    }, 30000);

    it('should show some columns hidden on tablet (768px breakpoint)', async () => {
      const columnVisibility = await page.evaluate(() => {
        const sourceCol = document.querySelector('.source-col');
        const sourceStyle = sourceCol ? window.getComputedStyle(sourceCol) : null;

        return {
          sourceHidden: sourceStyle?.display === 'none',
        };
      });

      expect(columnVisibility.sourceHidden).toBe(true);
    }, 30000);
  });

  describe('Large Mobile Viewport (414x896 - iPhone 14 Pro Max)', () => {
    beforeEach(async () => {
      await page.setViewport({ width: 414, height: 896 });
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
      await waitForSpellsToLoad(page);
    });

    it('should not have horizontal scrolling on large mobile', async () => {
      const scrollWidth = await page.evaluate(() => {
        return {
          bodyScrollWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      expect(scrollWidth.bodyScrollWidth).toBeLessThanOrEqual(scrollWidth.viewportWidth + 1);
    }, 30000);

    it('should use card layout on large mobile devices', async () => {
      const isCardLayout = await page.evaluate(() => {
        const thead = document.querySelector('.spell-table thead');
        const theadStyle = thead ? window.getComputedStyle(thead) : null;
        return theadStyle?.display === 'none';
      });

      expect(isCardLayout).toBe(true);
    }, 30000);
  });

  describe('Spellbook Detail Mobile View', () => {
    beforeEach(async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.goto(TEST_URL, { waitUntil: 'networkidle2' });
    });

    it('should display spellbook list without horizontal scroll', async () => {
      // Navigate to spellbooks
      await page.click('[data-testid="nav-spellbooks"]');
      await wait(500);

      // Check no horizontal scroll on spellbooks page
      const listScroll = await page.evaluate(() => ({
        scrollWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
      }));

      expect(listScroll.scrollWidth).toBeLessThanOrEqual(listScroll.viewportWidth + 1);
    }, 30000);
  });
});
