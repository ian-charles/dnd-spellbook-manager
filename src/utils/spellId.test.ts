import { describe, it, expect } from 'vitest';
import { toKebab, toSpellId } from './spellId';

describe('toKebab', () => {
  it('should convert a simple string to kebab-case', () => {
    expect(toKebab('Fireball')).toBe('fireball');
  });

  it('should convert multi-word strings to kebab-case', () => {
    expect(toKebab('Magic Missile')).toBe('magic-missile');
  });

  it('should strip apostrophes', () => {
    expect(toKebab("Tasha's Hideous Laughter")).toBe('tashas-hideous-laughter');
  });

  it('should strip slashes and collapse resulting gaps', () => {
    expect(toKebab('Antipathy/Sympathy')).toBe('antipathysympathy');
  });

  it('should strip colons', () => {
    expect(toKebab('Mordenkainen: Great Spell')).toBe('mordenkainen-great-spell');
  });

  it('should handle possessive with trailing s', () => {
    expect(toKebab("Heroes' Feast")).toBe('heroes-feast');
  });

  it('should convert source names to kebab-case', () => {
    expect(toKebab('5e Core Rules')).toBe('5e-core-rules');
  });

  it('should handle source names with apostrophes', () => {
    expect(toKebab("Player's Handbook")).toBe('players-handbook');
  });

  it('should collapse multiple hyphens', () => {
    expect(toKebab('Some -- Thing')).toBe('some-thing');
  });

  it('should trim leading and trailing whitespace', () => {
    expect(toKebab('  Fireball  ')).toBe('fireball');
  });
});

describe('toSpellId', () => {
  it('should combine name and source into a kebab-case ID', () => {
    expect(toSpellId('Fireball', '5e Core Rules')).toBe('fireball-5e-core-rules');
  });

  it('should handle spell names with apostrophes', () => {
    expect(toSpellId("Tasha's Hideous Laughter", '5e Core Rules')).toBe('tashas-hideous-laughter-5e-core-rules');
  });

  it('should handle spell names with slashes', () => {
    expect(toSpellId('Antipathy/Sympathy', '5e Core Rules')).toBe('antipathysympathy-5e-core-rules');
  });

  it('should handle spell names with slashes and spaces', () => {
    expect(toSpellId('Blindness/Deafness', '5e Core Rules')).toBe('blindnessdeafness-5e-core-rules');
  });

  it('should handle possessive names', () => {
    expect(toSpellId("Arcanist's Magic Aura", '5e Core Rules')).toBe('arcanists-magic-aura-5e-core-rules');
  });

  it('should handle trailing possessive', () => {
    expect(toSpellId("Heroes' Feast", '5e Core Rules')).toBe('heroes-feast-5e-core-rules');
  });

  it('should handle different sources', () => {
    expect(toSpellId('Fireball', "Player's Handbook")).toBe('fireball-players-handbook');
  });

  it('should handle source with numbers', () => {
    expect(toSpellId('Shield', '5e Core Rules')).toBe('shield-5e-core-rules');
  });
});
