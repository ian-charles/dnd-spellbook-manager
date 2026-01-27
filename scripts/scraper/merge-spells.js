import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..');

const BASE_SPELLS_PATH = join(PROJECT_ROOT, 'public', 'data', 'spells.json');
const SCRAPED_DIR = join(PROJECT_ROOT, 'data', 'scraped');

async function main() {
  console.log('Spell Merge Tool');
  console.log('================\n');

  // 1. Load base spells (Open5e output)
  let baseData;
  try {
    baseData = JSON.parse(await readFile(BASE_SPELLS_PATH, 'utf-8'));
    console.log(`Base: ${baseData.count} spells from ${BASE_SPELLS_PATH}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No base spells.json found. Run `npm run build:spells` first.');
      process.exit(1);
    }
    throw err;
  }

  // 2. Find scraped files
  let scrapedFiles;
  try {
    const files = await readdir(SCRAPED_DIR);
    scrapedFiles = files.filter(f => f.startsWith('spells-') && f.endsWith('.json'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No data/scraped/ directory found. Run `npm run scrape:spells` first.');
      process.exit(1);
    }
    throw err;
  }

  if (scrapedFiles.length === 0) {
    console.log('No scraped spell files found in data/scraped/.');
    console.log('Run `npm run scrape:spells` to generate them.');
    process.exit(0);
  }

  console.log(`Found ${scrapedFiles.length} scraped file(s): ${scrapedFiles.join(', ')}\n`);

  // 3. Merge spells (base takes priority on ID collision)
  const spellMap = new Map();

  for (const spell of baseData.spells) {
    spellMap.set(spell.id, spell);
  }

  let addedCount = 0;
  let skippedCount = 0;

  for (const file of scrapedFiles) {
    const data = JSON.parse(await readFile(join(SCRAPED_DIR, file), 'utf-8'));
    console.log(`Processing ${file}: ${data.count} spells from "${data.source}"`);

    for (const spell of data.spells) {
      if (spellMap.has(spell.id)) {
        skippedCount++;
        console.log(`  Skipped duplicate: ${spell.name} (${spell.id})`);
      } else {
        spellMap.set(spell.id, spell);
        addedCount++;
      }
    }
  }

  // 4. Sort and write
  const allSpells = Array.from(spellMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));

  const output = {
    version: baseData.version,
    generatedAt: new Date().toISOString(),
    count: allSpells.length,
    spells: allSpells,
  };

  await writeFile(BASE_SPELLS_PATH, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\nMerge complete:`);
  console.log(`  Base spells: ${baseData.count}`);
  console.log(`  Added from scraped: ${addedCount}`);
  console.log(`  Skipped duplicates: ${skippedCount}`);
  console.log(`  Total spells: ${allSpells.length}`);
  console.log(`  Output: ${BASE_SPELLS_PATH}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
