import { writeFile, mkdir } from 'fs/promises';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { loadConfig } from './config.js';
import { createLogger } from './lib/logger.js';
import { createBrowser, verifyAuth } from './lib/browser.js';
import { collectSpellUrls } from './lib/listing-scraper.js';
import { scrapeSpellDetail } from './lib/detail-scraper.js';
import { saveCheckpoint, loadCheckpoint, getCheckpointPath } from './lib/checkpoint.js';
import { rateLimit } from './lib/rate-limiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..');

async function main() {
  const logger = createLogger('INFO');
  logger.info('D&D Beyond Spell Scraper');
  logger.info('========================\n');

  // Load config
  const config = await loadConfig();
  logger.info(`Loaded config with ${config.sources.length} source(s)`);

  // Resolve output directory
  const outputDir = resolve(PROJECT_ROOT, config.output.directory);
  await mkdir(outputDir, { recursive: true });

  // Launch browser
  logger.info('Launching browser...');
  const { browser, page } = await createBrowser(config);

  try {
    // Verify authentication
    logger.info('Verifying authentication...');
    const authed = await verifyAuth(page);
    if (!authed) {
      logger.error('Authentication failed. Your session cookie may be expired.');
      logger.error('Update scripts/scraper.config.json with a fresh CobaltSession cookie.');
      process.exit(1);
    }
    logger.info('Authentication verified.\n');

    // Process each source
    for (const source of config.sources) {
      logger.info(`\n--- Scraping: ${source.canonical} (filter-source=${source.filterId}) ---\n`);

      const cpPath = getCheckpointPath(outputDir, source.slug);
      let checkpoint = await loadCheckpoint(cpPath);

      // Phase 1: Collect spell URLs
      let urls;
      if (checkpoint?.phase === 'detail' && checkpoint.urls?.length > 0) {
        urls = checkpoint.urls;
        logger.info(`Resuming from checkpoint: ${urls.length} URLs, ${checkpoint.completed?.length || 0} already scraped`);
      } else {
        logger.info('Phase 1: Collecting spell URLs from listing pages...');
        urls = await collectSpellUrls(page, source.filterId, {
          delay: config.scraping.delayBetweenRequests,
          logger,
        });

        checkpoint = {
          source: source.canonical,
          phase: 'detail',
          urls,
          completed: [],
          failed: [],
          spells: [],
        };
        await saveCheckpoint(cpPath, checkpoint);
        logger.info(`Saved URL checkpoint (${urls.length} URLs)\n`);
      }

      // Phase 2: Scrape individual spell detail pages
      logger.info('Phase 2: Scraping individual spell pages...\n');
      const completedSet = new Set(checkpoint.completed || []);
      const remaining = urls.filter(u => !completedSet.has(u));
      const total = urls.length;
      let current = total - remaining.length;

      for (const spellUrl of remaining) {
        current++;
        logger.progress(current, total, `Scraping ${spellUrl}`);

        const result = await scrapeSpellDetail(page, spellUrl, source.canonical, {
          maxRetries: config.scraping.maxRetries,
          retryDelay: config.scraping.delayBetweenRequests,
          logger,
        });

        if (result.status === 'success') {
          checkpoint.spells.push(result.spell);
          checkpoint.completed.push(spellUrl);
        } else {
          checkpoint.failed.push(spellUrl);
          logger.error(`  Failed: ${result.error}`);
        }

        // Save checkpoint after each spell
        await saveCheckpoint(cpPath, checkpoint);

        // Rate limit
        await rateLimit(config.scraping.delayBetweenRequests);
      }

      // Write final output
      const output = {
        version: '2.0.0',
        generatedAt: new Date().toISOString(),
        source: source.canonical,
        count: checkpoint.spells.length,
        spells: checkpoint.spells.sort((a, b) => a.name.localeCompare(b.name)),
      };

      const outputPath = join(outputDir, `spells-${source.slug}.json`);
      await writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');

      // Print summary
      logger.info(`\nScrape complete for "${source.canonical}"`);
      logger.info(`  Total spells found: ${urls.length}`);
      logger.info(`  Successfully scraped: ${checkpoint.completed.length}`);
      logger.info(`  Failed: ${checkpoint.failed.length}`);
      if (checkpoint.failed.length > 0) {
        for (const f of checkpoint.failed) {
          logger.info(`    - ${f}`);
        }
      }
      logger.info(`  Output: ${outputPath}\n`);
    }
  } finally {
    await browser.close();
    logger.info('Browser closed.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
