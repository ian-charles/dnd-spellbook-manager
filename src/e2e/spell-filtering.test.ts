// E2E tests for spell filtering functionality
// Using vitest globals (describe, it, expect, beforeAll, afterAll are globally available)
import { Page } from 'puppeteer';
import { setupBrowser, closeBrowser, TEST_URL, waitForSpellsToLoad } from './setup';
import { TIMEOUTS } from './config';

describe('Spell Filtering E2E', () => {
  let page: Page;

  beforeAll(async () => {
    const setup = await setupBrowser();
    page = setup.page;
  }, 30000);

  afterAll(async () => {
    await closeBrowser();
  });

  it('should load the application and display spells', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Check that the header shows spell count
    const headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).toContain('Browse 319 spells');
    expect(headerText).toContain('319 results');

    // Check that spell rows are present
    const spellRows = await page.$$('.spell-row');
    expect(spellRows.length).toBeGreaterThan(0);
  }, 30000);

  it('should filter spells by level', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Set level range sliders to filter only level 1
    await page.evaluate(() => {
      const minSlider = document.querySelector('[data-testid="level-range-min"]') as HTMLInputElement;
      const maxSlider = document.querySelector('[data-testid="level-range-max"]') as HTMLInputElement;
      if (minSlider && maxSlider) {
        minSlider.value = '1';
        minSlider.dispatchEvent(new Event('change', { bubbles: true }));
        maxSlider.value = '1';
        maxSlider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Wait for filter to be applied
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && !header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Check that results are filtered
    const headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).toContain('results');
    expect(headerText).not.toContain('319 results');

    // Verify all visible spells are level 1
    const levelCells = await page.$$eval('td.level-col', cells =>
      cells.map(cell => cell.textContent?.trim())
    );
    expect(levelCells.every(level => level === '1')).toBe(true);
  }, 30000);

  it('should filter spells by school', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click evocation school filter
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const evocationBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'evocation');
      if (evocationBtn) (evocationBtn as HTMLElement).click();
    });

    // Wait for filter to be applied
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
        const evocationBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'evocation');
        return evocationBtn?.classList.contains('active');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify all visible spells are evocation
    const schoolCells = await page.$$eval('.school-col', cells =>
      cells.map(cell => cell.textContent?.trim().toLowerCase())
    );
    expect(schoolCells.every(school => school === 'evocation')).toBe(true);
  }, 30000);

  it('should filter spells by class', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click wizard class filter
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const wizardBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'wizard');
      if (wizardBtn) (wizardBtn as HTMLElement).click();
    });

    // Wait for filter to be applied
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
        const wizardBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'wizard');
        return wizardBtn?.classList.contains('active');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify all visible spells include wizard
    const classesCells = await page.$$eval('.classes-col', cells =>
      cells.map(cell => cell.textContent?.toLowerCase() || '')
    );
    expect(classesCells.every(classes => classes.includes('wizard'))).toBe(true);
  }, 30000);

  it('should filter spells by concentration', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Get initial spell count
    const initialCount = await page.$$eval('.spell-row', rows => rows.length);

    // Click concentration checkbox
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('.checkbox-label'));
      const concentrationLabel = labels.find(label =>
        label.textContent?.includes('Concentration')
      );
      if (concentrationLabel) {
        const checkbox = concentrationLabel.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) checkbox.click();
      }
    });

    // Wait for filter to be applied - spell count should change
    await page.waitForFunction(
      (oldCount) => {
        const newCount = document.querySelectorAll('.spell-row').length;
        return newCount !== oldCount && newCount > 0;
      },
      { timeout: TIMEOUTS.SHORT },
      initialCount
    );

    // Verify all visible spells have concentration badge
    const spellNames = await page.$$eval('.spell-name', cells =>
      cells.map(cell => cell.textContent || '')
    );
    expect(spellNames.every(name => name.includes('C'))).toBe(true);
  }, 30000);

  it('should filter spells by ritual', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Get initial spell count
    const initialCount = await page.$$eval('.spell-row', rows => rows.length);

    // Click ritual checkbox
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('.checkbox-label'));
      const ritualLabel = labels.find(label =>
        label.textContent?.includes('Ritual')
      );
      if (ritualLabel) {
        const checkbox = ritualLabel.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) checkbox.click();
      }
    });

    // Wait for filter to be applied - spell count should change
    await page.waitForFunction(
      (oldCount) => {
        const newCount = document.querySelectorAll('.spell-row').length;
        return newCount !== oldCount && newCount > 0;
      },
      { timeout: TIMEOUTS.SHORT },
      initialCount
    );

    // Verify all visible spells have ritual badge
    const spellNames = await page.$$eval('.spell-name', cells =>
      cells.map(cell => cell.textContent || '')
    );
    expect(spellNames.every(name => name.includes('R'))).toBe(true);
  }, 30000);

  it('should filter spells by verbal component', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Get initial spell count
    const initialCount = await page.$$eval('.spell-row', rows => rows.length);

    // Click verbal component checkbox
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('.checkbox-label'));
      const verbalLabel = labels.find(label =>
        label.textContent?.includes('Verbal (V)')
      );
      if (verbalLabel) {
        const checkbox = verbalLabel.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) checkbox.click();
      }
    });

    // Wait for filter to be applied - spell count should change
    await page.waitForFunction(
      (oldCount) => {
        const newCount = document.querySelectorAll('.spell-row').length;
        return newCount !== oldCount && newCount > 0;
      },
      { timeout: TIMEOUTS.SHORT },
      initialCount
    );

    // Verify all visible spells have V component
    const componentsCells = await page.$$eval('td.components-col', cells =>
      cells.map(cell => cell.textContent || '')
    );
    expect(componentsCells.every(comp => comp.includes('V'))).toBe(true);
  }, 30000);

  it('should combine multiple filters', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Set level range to 1
    await page.evaluate(() => {
      const minSlider = document.querySelector('[data-testid="level-range-min"]') as HTMLInputElement;
      const maxSlider = document.querySelector('[data-testid="level-range-max"]') as HTMLInputElement;
      if (minSlider && maxSlider) {
        minSlider.value = '1';
        minSlider.dispatchEvent(new Event('change', { bubbles: true }));
        maxSlider.value = '1';
        maxSlider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Wait for first filter to be applied
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && !header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Click evocation
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const evocationBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'evocation');
      if (evocationBtn) (evocationBtn as HTMLElement).click();
    });

    // Wait for second filter to be applied
    await page.waitForFunction(
      () => {
        const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
        const evocationBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'evocation');
        return evocationBtn?.classList.contains('active');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify results match both filters
    const levelCells = await page.$$eval('td.level-col', cells =>
      cells.map(cell => cell.textContent?.trim())
    );
    const schoolCells = await page.$$eval('td.school-col', cells =>
      cells.map(cell => cell.textContent?.trim().toLowerCase())
    );

    expect(levelCells.every(level => level === '1')).toBe(true);
    expect(schoolCells.every(school => school === 'evocation')).toBe(true);
  }, 30000);

  it('should clear all filters', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Apply some filters - set level range
    await page.evaluate(() => {
      const minSlider = document.querySelector('[data-testid="level-range-min"]') as HTMLInputElement;
      const maxSlider = document.querySelector('[data-testid="level-range-max"]') as HTMLInputElement;
      if (minSlider && maxSlider) {
        minSlider.value = '1';
        minSlider.dispatchEvent(new Event('change', { bubbles: true }));
        maxSlider.value = '1';
        maxSlider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Wait for filter to be applied
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && !header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Click clear button
    await page.click('.btn-clear-filters');

    // Wait for all spells to be shown again
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Check that all spells are shown again
    const headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).toContain('319 results');
  }, 30000);

  it('should toggle level filter off when clicked again', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Set level range to 1-1
    await page.evaluate(() => {
      const minSlider = document.querySelector('[data-testid="level-range-min"]') as HTMLInputElement;
      const maxSlider = document.querySelector('[data-testid="level-range-max"]') as HTMLInputElement;
      if (minSlider && maxSlider) {
        minSlider.value = '1';
        minSlider.dispatchEvent(new Event('change', { bubbles: true }));
        maxSlider.value = '1';
        maxSlider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Wait for filter to be applied
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && !header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify filter is applied
    let headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).not.toContain('319 results');

    // Reset sliders to 0-9 (equivalent to toggling off)
    await page.evaluate(() => {
      const minSlider = document.querySelector('[data-testid="level-range-min"]') as HTMLInputElement;
      const maxSlider = document.querySelector('[data-testid="level-range-max"]') as HTMLInputElement;
      if (minSlider && maxSlider) {
        minSlider.value = '0';
        minSlider.dispatchEvent(new Event('change', { bubbles: true }));
        maxSlider.value = '9';
        maxSlider.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Wait for all spells to be shown again
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify all spells are shown again
    headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).toContain('319 results');
  }, 30000);

  it('should toggle school filter off when clicked again', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click evocation filter to turn it on
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const evocationBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'evocation');
      if (evocationBtn) (evocationBtn as HTMLElement).click();
    });

    // Wait for filter to be applied
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && !header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify filter is applied
    let headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).not.toContain('319 results');

    // Click the same filter again to toggle it off
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const evocationBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'evocation');
      if (evocationBtn) (evocationBtn as HTMLElement).click();
    });

    // Wait for all spells to be shown again
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify all spells are shown again
    headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).toContain('319 results');
  }, 30000);

  it('should toggle class filter off when clicked again', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click wizard filter to turn it on
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const wizardBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'wizard');
      if (wizardBtn) (wizardBtn as HTMLElement).click();
    });

    // Wait for filter to be applied
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && !header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify filter is applied
    let headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).not.toContain('319 results');

    // Click the same filter again to toggle it off
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button.filter-btn'));
      const wizardBtn = buttons.find(btn => btn.textContent?.toLowerCase() === 'wizard');
      if (wizardBtn) (wizardBtn as HTMLElement).click();
    });

    // Wait for all spells to be shown again
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify all spells are shown again
    headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).toContain('319 results');
  }, 30000);

  it('should toggle concentration checkbox off when clicked again', async () => {
    await page.goto(TEST_URL);
    await waitForSpellsToLoad(page);

    // Click concentration checkbox to turn it on
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('.checkbox-label'));
      const concentrationLabel = labels.find(label =>
        label.textContent?.includes('Concentration')
      );
      if (concentrationLabel) {
        const checkbox = concentrationLabel.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) checkbox.click();
      }
    });

    // Wait for filter to be applied
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && !header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify filter is applied
    let headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).not.toContain('319 results');

    // Click the same checkbox again to toggle it off
    await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('.checkbox-label'));
      const concentrationLabel = labels.find(label =>
        label.textContent?.includes('Concentration')
      );
      if (concentrationLabel) {
        const checkbox = concentrationLabel.querySelector('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) checkbox.click();
      }
    });

    // Wait for all spells to be shown again
    await page.waitForFunction(
      () => {
        const header = document.querySelector('.browse-header p');
        return header && header.textContent?.includes('319 results');
      },
      { timeout: TIMEOUTS.SHORT }
    );

    // Verify all spells are shown again
    headerText = await page.$eval('.browse-header p', el => el.textContent);
    expect(headerText).toContain('319 results');
  }, 30000);
});
