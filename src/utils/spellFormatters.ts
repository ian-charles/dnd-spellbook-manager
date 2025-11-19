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
