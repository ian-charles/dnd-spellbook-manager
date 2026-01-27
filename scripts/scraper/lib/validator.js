/**
 * Validate a spell object against the expected schema.
 * @param {object} spell
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSpell(spell) {
  const errors = [];

  if (!spell.id || typeof spell.id !== 'string') {
    errors.push('id must be a non-empty string');
  }
  if (!spell.name || typeof spell.name !== 'string') {
    errors.push('name must be a non-empty string');
  }
  if (typeof spell.level !== 'number' || !Number.isInteger(spell.level) || spell.level < 0 || spell.level > 9) {
    errors.push('level must be an integer from 0 to 9');
  }
  if (!spell.school || typeof spell.school !== 'string') {
    errors.push('school must be a non-empty string');
  }
  if (!Array.isArray(spell.classes) || spell.classes.length === 0 || !spell.classes.every(c => typeof c === 'string')) {
    errors.push('classes must be a non-empty array of strings');
  }
  if (!spell.castingTime || typeof spell.castingTime !== 'string') {
    errors.push('castingTime must be a non-empty string');
  }
  if (!spell.range || typeof spell.range !== 'string') {
    errors.push('range must be a non-empty string');
  }

  const c = spell.components;
  if (!c || typeof c.verbal !== 'boolean' || typeof c.somatic !== 'boolean' || typeof c.material !== 'boolean') {
    errors.push('components must have verbal, somatic, and material booleans');
  }

  if (typeof spell.materials !== 'string') {
    errors.push('materials must be a string');
  }
  if (!spell.duration || typeof spell.duration !== 'string') {
    errors.push('duration must be a non-empty string');
  }
  if (typeof spell.concentration !== 'boolean') {
    errors.push('concentration must be a boolean');
  }
  if (typeof spell.ritual !== 'boolean') {
    errors.push('ritual must be a boolean');
  }
  if (!spell.description || typeof spell.description !== 'string') {
    errors.push('description must be a non-empty string');
  }
  if (typeof spell.higherLevels !== 'string') {
    errors.push('higherLevels must be a string');
  }
  if (!spell.source || typeof spell.source !== 'string') {
    errors.push('source must be a non-empty string');
  }

  return { valid: errors.length === 0, errors };
}
