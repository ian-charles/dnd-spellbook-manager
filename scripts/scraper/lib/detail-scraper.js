import { parseSpellPage } from './parser.js';
import { transformScrapedSpell } from './spell-transformer.js';
import { validateSpell } from './validator.js';
import { rateLimit } from './rate-limiter.js';

/**
 * Scrape a single spell detail page, parse it, transform to schema, and validate.
 *
 * @param {import('puppeteer').Page} page
 * @param {string} url
 * @param {string} canonicalSource
 * @param {object} options
 * @param {number} options.maxRetries
 * @param {number} options.retryDelay
 * @param {import('./logger.js').Logger} options.logger
 * @returns {Promise<{ status: 'success'|'error', url: string, spell?: object, error?: string }>}
 */
export async function scrapeSpellDetail(page, url, canonicalSource, { maxRetries, retryDelay, logger }) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Wait for the spell content to render
      await page.waitForSelector('.page-title', { timeout: 15000 });

      // Parse the DOM inside the browser context, then extract in Node
      const rawHtml = await page.content();

      // Use jsdom to parse (same as our test fixtures)
      const { JSDOM } = await import('jsdom');
      const doc = new JSDOM(rawHtml).window.document;

      const raw = parseSpellPage(doc);
      const spell = transformScrapedSpell(raw, canonicalSource);
      const { valid, errors } = validateSpell(spell);

      if (!valid) {
        throw new Error(`Validation failed: ${errors.join('; ')}`);
      }

      return { status: 'success', url, spell };

    } catch (err) {
      lastError = err;
      logger.warn(`Attempt ${attempt}/${maxRetries} failed for ${url}: ${err.message}`);

      if (attempt < maxRetries) {
        const backoff = retryDelay * Math.pow(2, attempt - 1);
        await rateLimit(backoff);
      }
    }
  }

  return { status: 'error', url, error: lastError?.message || 'Unknown error' };
}
