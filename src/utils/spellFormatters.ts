import { Spell } from '../types/spell';

/**
 * Formats spell level as text.
 * Returns "Cantrip" for level 0, otherwise returns the level number as a string.
 */
export function getLevelText(level: number): string {
  if (level === 0) return 'Cantrip';
  return level.toString();
}

/**
 * Formats spell level as text for mobile display.
 * Returns "0" for level 0 (cantrips), otherwise returns the level number as a string.
 */
export function getLevelTextMobile(level: number): string {
  return level.toString();
}

/**
 * Abbreviates school name to first 3 characters for mobile display.
 * Examples: "Evocation" -> "Evo", "Abjuration" -> "Abj"
 */
export function getSchoolAbbreviation(school: string): string {
  return school.substring(0, 3);
}

/**
 * Adds zero-width space after "/" to allow line breaks at that point.
 * Useful for spell names like "Antipathy/Sympathy" or "Antimagic/Magic" on mobile.
 */
export function formatSpellNameForWrapping(name: string): string {
  // Insert zero-width space (U+200B) after forward slash
  return name.replace(/\//g, '/\u200B');
}

/**
 * Formats duration text for better wrapping in narrow columns.
 * Adds zero-width spaces after spaces to allow line breaks at word boundaries.
 * Useful for long durations like "Until dispelled or triggered".
 */
export function formatDurationForWrapping(duration: string): string {
  // Insert zero-width space (U+200B) after each space to allow breaks
  return duration.replace(/ /g, ' \u200B');
}

/**
 * Formats duration text with non-breaking spaces after numerals.
 * Prevents line breaks between numbers and their units (e.g., "10 minutes" stays together).
 * Examples: "10 minutes" -> "10\u00A0minutes", "1 hour" -> "1\u00A0hour"
 */
export function formatDurationWithNonBreakingSpaces(duration: string): string {
  // Replace space after digits with non-breaking space (U+00A0)
  return duration.replace(/(\d+)\s+/g, '$1\u00A0');
}

/**
 * Formats spell components as a compact string (e.g., "V,S,M").
 */
export function getComponentsText(spell: Spell): string {
  const parts: string[] = [];
  if (spell.components.verbal) parts.push('V');
  if (spell.components.somatic) parts.push('S');
  if (spell.components.material) parts.push('M');
  return parts.join(',');
}

/**
 * Formats spell components with material details in parentheses.
 * Used in expanded spell views where we show the actual materials.
 */
export function getComponentsWithMaterials(spell: Spell): string {
  const parts: string[] = [];
  if (spell.components.verbal) parts.push('V');
  if (spell.components.somatic) parts.push('S');
  if (spell.components.material) {
    parts.push(`M (${spell.materials})`);
  }
  return parts.join(', ');
}

/**
 * Filters out "Ritual Caster" from a class list.
 * "Ritual Caster" is a feat, not a class, so we don't want to display it.
 */
export function filterClasses(classes: string[]): string[] {
  return classes.filter(c => c.toLowerCase() !== 'ritual caster');
}

/**
 * Truncates casting time at the first comma for table display.
 * Used to shorten reaction spells like "1 reaction, which you take when..."
 * Returns only the part before the comma.
 */
export function truncateCastingTime(castingTime: string): string {
  const commaIndex = castingTime.indexOf(',');
  if (commaIndex === -1) {
    return castingTime;
  }
  return castingTime.substring(0, commaIndex);
}

/**
 * Formats materials text by normalizing monetary costs to "X gp" format
 * and wrapping them in <strong class="material-cost"> tags for styling.
 * Handles various formats like "25gp", "25 gp", "1,000gp", "1,000 gp".
 * Returns HTML string that should be rendered with dangerouslySetInnerHTML.
 */
export function formatMaterialsWithCosts(materials: string): string {
  // Replace all variations of gold piece costs with normalized bold format
  // Matches: digits (with optional commas) followed by optional space and "gp" (case insensitive)
  return materials.replace(/(\d{1,3}(?:,\d{3})*)\s*gp/gi, '<strong class="material-cost">$1 gp</strong>');
}
