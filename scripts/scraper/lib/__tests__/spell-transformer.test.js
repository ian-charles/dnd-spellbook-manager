import { describe, it, expect } from 'vitest';
import { transformScrapedSpell } from '../spell-transformer.js';

const rawSpell = {
  name: 'Fireball',
  level: 3,
  school: 'Evocation',
  classes: ['Sorcerer', 'Wizard'],
  castingTime: '1 action',
  range: '150 feet',
  components: { verbal: true, somatic: true, material: true },
  materials: 'A tiny ball of bat guano and sulfur.',
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: 'A bright streak flashes from your pointing finger.',
  higherLevels: 'When you cast this spell using a spell slot of 4th level or higher...',
};

describe('transformScrapedSpell', () => {
  it('generates correct ID from name and source', () => {
    const spell = transformScrapedSpell(rawSpell, "Xanathar's Guide to Everything");
    expect(spell.id).toBe('fireball-xanathars-guide-to-everything');
  });

  it('preserves name as-is', () => {
    const spell = transformScrapedSpell(rawSpell, 'Test Source');
    expect(spell.name).toBe('Fireball');
  });

  it('lowercases school', () => {
    const spell = transformScrapedSpell(rawSpell, 'Test Source');
    expect(spell.school).toBe('evocation');
  });

  it('lowercases classes', () => {
    const spell = transformScrapedSpell(rawSpell, 'Test Source');
    expect(spell.classes).toEqual(['sorcerer', 'wizard']);
  });

  it('filters out Ritual Caster from classes', () => {
    const raw = { ...rawSpell, classes: ['Wizard', 'Ritual Caster', 'Sorcerer'] };
    const spell = transformScrapedSpell(raw, 'Test Source');
    expect(spell.classes).toEqual(['wizard', 'sorcerer']);
  });

  it('sets source to canonical value', () => {
    const spell = transformScrapedSpell(rawSpell, "Tasha's Cauldron of Everything");
    expect(spell.source).toBe("Tasha's Cauldron of Everything");
  });

  it('handles empty materials', () => {
    const raw = { ...rawSpell, materials: undefined };
    const spell = transformScrapedSpell(raw, 'Test Source');
    expect(spell.materials).toBe('');
  });

  it('handles empty higherLevels', () => {
    const raw = { ...rawSpell, higherLevels: undefined };
    const spell = transformScrapedSpell(raw, 'Test Source');
    expect(spell.higherLevels).toBe('');
  });

  it('passes through boolean fields', () => {
    const raw = { ...rawSpell, concentration: true, ritual: true };
    const spell = transformScrapedSpell(raw, 'Test Source');
    expect(spell.concentration).toBe(true);
    expect(spell.ritual).toBe(true);
  });

  it('passes through components object', () => {
    const spell = transformScrapedSpell(rawSpell, 'Test Source');
    expect(spell.components).toEqual({ verbal: true, somatic: true, material: true });
  });

  it('handles spell names with apostrophes', () => {
    const raw = { ...rawSpell, name: "Tasha's Hideous Laughter" };
    const spell = transformScrapedSpell(raw, '5e Core Rules');
    expect(spell.id).toBe('tashas-hideous-laughter-5e-core-rules');
  });

  it('handles cantrip level 0', () => {
    const raw = { ...rawSpell, level: 0 };
    const spell = transformScrapedSpell(raw, 'Test Source');
    expect(spell.level).toBe(0);
  });
});
