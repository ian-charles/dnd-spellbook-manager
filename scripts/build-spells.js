import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OPEN5E_API_BASE = 'https://api.open5e.com';
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'spells.json');

/**
 * Fetch all spells from Open5e API with pagination
 */
async function fetchAllSpells() {
  console.log('📚 Fetching spells from Open5e API...');

  const allSpells = [];
  let nextUrl = `${OPEN5E_API_BASE}/spells/?format=json&limit=100`;
  let pageCount = 0;

  while (nextUrl) {
    pageCount++;
    console.log(`  Fetching page ${pageCount}...`);

    try {
      const response = await fetch(nextUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      allSpells.push(...data.results);

      nextUrl = data.next;

      // Small delay to be nice to the API
      if (nextUrl) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`❌ Error fetching page ${pageCount}:`, error.message);
      throw error;
    }
  }

  console.log(`✅ Fetched ${allSpells.length} spells from ${pageCount} pages`);
  return allSpells;
}

/**
 * Transform Open5e spell data to our optimized format
 */
function transformSpell(spell) {
  return {
    id: spell.slug,
    name: spell.name,
    level: spell.level_int || 0,
    school: spell.school?.toLowerCase() || 'unknown',
    classes: Array.isArray(spell.dnd_class)
      ? spell.dnd_class.split(',').map(c => c.trim().toLowerCase())
      : typeof spell.dnd_class === 'string'
      ? spell.dnd_class.split(',').map(c => c.trim().toLowerCase())
      : [],
    castingTime: spell.casting_time || 'Unknown',
    range: spell.range || 'Unknown',
    components: {
      verbal: spell.components?.includes('V') || false,
      somatic: spell.components?.includes('S') || false,
      material: spell.components?.includes('M') || false,
    },
    materials: spell.material || '',
    duration: spell.duration || 'Unknown',
    concentration: spell.concentration?.toLowerCase() === 'yes' || false,
    ritual: spell.ritual?.toLowerCase() === 'yes' || false,
    description: spell.desc || '',
    higherLevels: spell.higher_level || '',
    source: spell.document__title || 'Unknown',
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🎲 D&D Spellbook - Spell Data Pipeline\n');

    // Ensure output directory exists
    await mkdir(OUTPUT_DIR, { recursive: true });

    // Fetch all spells
    const rawSpells = await fetchAllSpells();

    // Transform spells
    console.log('\n🔄 Transforming spell data...');
    const transformedSpells = rawSpells.map(transformSpell);

    // Create output object
    const output = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      count: transformedSpells.length,
      spells: transformedSpells,
    };

    // Write to file
    console.log(`\n💾 Writing to ${OUTPUT_FILE}...`);
    await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

    // Calculate file size
    const stats = await import('fs').then(fs =>
      fs.promises.stat(OUTPUT_FILE)
    );
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(`✅ Success! Generated spell data file (${sizeKB} KB)`);
    console.log(`   Total spells: ${transformedSpells.length}`);

    // Print some stats
    const schoolCounts = transformedSpells.reduce((acc, spell) => {
      acc[spell.school] = (acc[spell.school] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Spells by school:');
    Object.entries(schoolCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([school, count]) => {
        console.log(`   ${school}: ${count}`);
      });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
