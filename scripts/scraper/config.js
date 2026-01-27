import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @typedef {Object} AuthConfig
 * @property {string} cookie
 */

/**
 * @typedef {Object} SourceConfig
 * @property {number} filterId  - D&D Beyond filter-source query param
 * @property {string} canonical - Canonical source name (used in Spell.source)
 * @property {string} slug      - Short name for output file
 */

/**
 * @typedef {Object} ScrapingOptions
 * @property {number} delayBetweenRequests
 * @property {number} maxRetries
 * @property {number} timeout
 * @property {boolean} headless
 */

/**
 * @typedef {Object} ScraperConfig
 * @property {AuthConfig} auth
 * @property {SourceConfig[]} sources
 * @property {ScrapingOptions} scraping
 * @property {{ directory: string }} output
 */

const DEFAULTS = {
  scraping: {
    delayBetweenRequests: 2000,
    maxRetries: 3,
    timeout: 30000,
    headless: true,
  },
  output: {
    directory: 'data/scraped',
  },
};

const CONFIG_PATH = join(__dirname, '..', 'scraper.config.json');

/**
 * Load and validate scraper config from disk.
 * @returns {Promise<ScraperConfig>}
 */
export async function loadConfig() {
  let raw;
  try {
    raw = JSON.parse(await readFile(CONFIG_PATH, 'utf-8'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(
        'Config file not found. Copy scripts/scraper.config.example.json to scripts/scraper.config.json and fill in your settings.'
      );
    }
    throw new Error(`Failed to read config: ${err.message}`);
  }

  if (!raw.auth?.cookie) {
    throw new Error('Config missing auth.cookie. Provide your D&D Beyond session cookie.');
  }
  if (!Array.isArray(raw.sources) || raw.sources.length === 0) {
    throw new Error('Config must include at least one source.');
  }
  for (const src of raw.sources) {
    if (!src.filterId || !src.canonical || !src.slug) {
      throw new Error(`Each source needs filterId, canonical, and slug. Got: ${JSON.stringify(src)}`);
    }
  }

  return {
    auth: raw.auth,
    sources: raw.sources,
    scraping: { ...DEFAULTS.scraping, ...raw.scraping },
    output: { ...DEFAULTS.output, ...raw.output },
  };
}

/**
 * Convert a string to kebab-case, stripping punctuation.
 * Mirrors src/utils/spellId.ts toKebab() for consistency.
 */
export function toKebab(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Generate a spell ID from name and source.
 * Mirrors src/utils/spellId.ts toSpellId() for consistency.
 */
export function toSpellId(name, source) {
  return `${toKebab(name)}-${toKebab(source)}`;
}
