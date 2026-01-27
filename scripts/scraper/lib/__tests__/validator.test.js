import { describe, it, expect } from 'vitest';
import { validateSpell } from '../validator.js';

const validSpell = {
  id: 'fireball-5e-core-rules',
  name: 'Fireball',
  level: 3,
  school: 'evocation',
  classes: ['sorcerer', 'wizard'],
  castingTime: '1 action',
  range: '150 feet',
  components: { verbal: true, somatic: true, material: true },
  materials: 'A tiny ball of bat guano and sulfur.',
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: 'A bright streak flashes from your pointing finger...',
  higherLevels: 'When you cast this spell using a spell slot of 4th level or higher...',
  source: '5e Core Rules',
};

describe('validateSpell', () => {
  it('accepts a valid spell', () => {
    const result = validateSpell(validSpell);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects missing id', () => {
    const result = validateSpell({ ...validSpell, id: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('id must be a non-empty string');
  });

  it('rejects missing name', () => {
    const result = validateSpell({ ...validSpell, name: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('name must be a non-empty string');
  });

  it('rejects level out of range', () => {
    expect(validateSpell({ ...validSpell, level: -1 }).valid).toBe(false);
    expect(validateSpell({ ...validSpell, level: 10 }).valid).toBe(false);
  });

  it('accepts cantrip level 0', () => {
    expect(validateSpell({ ...validSpell, level: 0 }).valid).toBe(true);
  });

  it('rejects non-integer level', () => {
    expect(validateSpell({ ...validSpell, level: 2.5 }).valid).toBe(false);
  });

  it('rejects missing school', () => {
    const result = validateSpell({ ...validSpell, school: '' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('school must be a non-empty string');
  });

  it('rejects non-array classes', () => {
    const result = validateSpell({ ...validSpell, classes: 'wizard' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('classes must be a non-empty array of strings');
  });

  it('rejects empty classes array', () => {
    const result = validateSpell({ ...validSpell, classes: [] });
    expect(result.valid).toBe(false);
  });

  it('rejects missing castingTime', () => {
    const result = validateSpell({ ...validSpell, castingTime: '' });
    expect(result.valid).toBe(false);
  });

  it('rejects missing range', () => {
    const result = validateSpell({ ...validSpell, range: '' });
    expect(result.valid).toBe(false);
  });

  it('rejects invalid components shape', () => {
    const result = validateSpell({ ...validSpell, components: { verbal: true } });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('components must have verbal, somatic, and material booleans');
  });

  it('rejects non-boolean component values', () => {
    const result = validateSpell({
      ...validSpell,
      components: { verbal: 'yes', somatic: true, material: true },
    });
    expect(result.valid).toBe(false);
  });

  it('accepts empty materials string', () => {
    expect(validateSpell({ ...validSpell, materials: '' }).valid).toBe(true);
  });

  it('rejects missing duration', () => {
    const result = validateSpell({ ...validSpell, duration: '' });
    expect(result.valid).toBe(false);
  });

  it('rejects non-boolean concentration', () => {
    const result = validateSpell({ ...validSpell, concentration: 'yes' });
    expect(result.valid).toBe(false);
  });

  it('rejects non-boolean ritual', () => {
    const result = validateSpell({ ...validSpell, ritual: 'yes' });
    expect(result.valid).toBe(false);
  });

  it('rejects missing description', () => {
    const result = validateSpell({ ...validSpell, description: '' });
    expect(result.valid).toBe(false);
  });

  it('accepts empty higherLevels string', () => {
    expect(validateSpell({ ...validSpell, higherLevels: '' }).valid).toBe(true);
  });

  it('rejects missing source', () => {
    const result = validateSpell({ ...validSpell, source: '' });
    expect(result.valid).toBe(false);
  });

  it('collects multiple errors at once', () => {
    const result = validateSpell({ ...validSpell, id: '', name: '', level: -1 });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
