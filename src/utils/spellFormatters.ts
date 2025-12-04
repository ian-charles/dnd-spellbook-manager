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
