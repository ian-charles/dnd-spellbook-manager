import { toSpellId } from '../config.js';

/**
 * Transform raw scraped spell data into the app's Spell schema.
 * @param {object} raw - Raw scraped data from D&D Beyond
 * @param {string} canonicalSource - Canonical source name
 * @returns {import('../../../src/types/spell').Spell}
 */
export function transformScrapedSpell(raw, canonicalSource) {
  return {
    id: toSpellId(raw.name, canonicalSource),
    name: raw.name,
    level: raw.level,
    school: raw.school.toLowerCase(),
    classes: raw.classes
      .map(c => c.toLowerCase())
      .filter(c => c !== 'ritual caster'),
    castingTime: raw.castingTime,
    range: raw.range,
    components: raw.components,
    materials: raw.materials || '',
    duration: raw.duration,
    concentration: raw.concentration,
    ritual: raw.ritual,
    description: raw.description,
    higherLevels: raw.higherLevels || '',
    source: canonicalSource,
  };
}
