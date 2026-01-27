import { rateLimit } from './rate-limiter.js';

const BASE_URL = 'https://www.dndbeyond.com';
const LISTING_URL = (filterId, page) =>
  `${BASE_URL}/spells?filter-source=${filterId}&page=${page}`;

/**
 * Collect all spell detail URLs from D&D Beyond listing pages for a source.
 * Navigates through paginated listing pages, extracting links to individual spells.
 *
 * @param {import('puppeteer').Page} page - Puppeteer page instance
 * @param {number} filterId - D&D Beyond source filter ID
 * @param {object} options
 * @param {number} options.delay - Delay between page navigations
 * @param {import('./logger.js').Logger} options.logger
 * @returns {Promise<string[]>} Deduplicated array of absolute spell URLs
 */
export async function collectSpellUrls(page, filterId, { delay, logger }) {
  const allUrls = new Set();
  let pageNum = 1;
  let hasNext = true;

  while (hasNext) {
    const url = LISTING_URL(filterId, pageNum);
    logger.info(`Fetching listing page ${pageNum}: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for spell links to appear
    try {
      await page.waitForSelector('a[href*="/spells/"]', { timeout: 10000 });
    } catch {
      // No spell links found — could be empty page or end of results
      logger.warn(`No spell links found on page ${pageNum}. Stopping pagination.`);
      break;
    }

    // Extract spell URLs from the listing
    const urls = await page.evaluate((base) => {
      const links = document.querySelectorAll('a[href*="/spells/"]');
      return Array.from(links)
        .map(a => a.getAttribute('href'))
        .filter(href => {
          // Only keep direct spell links (e.g., /spells/fireball), not filter/search links
          if (!href) return false;
          const path = href.replace(/^https?:\/\/[^/]+/, '');
          return /^\/spells\/[a-z0-9-]+\/?$/.test(path);
        })
        .map(href => href.startsWith('http') ? href : `${base}${href}`);
    }, BASE_URL);

    for (const u of urls) allUrls.add(u);
    logger.info(`  Found ${urls.length} spell links (${allUrls.size} total unique)`);

    // Check for next page
    hasNext = await page.evaluate(() => {
      const nextLink = document.querySelector('.b-pagination-item a[rel="next"], a.pagination-next');
      return !!nextLink;
    });

    if (hasNext) {
      pageNum++;
      await rateLimit(delay);
    }
  }

  logger.info(`Collected ${allUrls.size} unique spell URLs across ${pageNum} pages`);
  return Array.from(allUrls);
}
