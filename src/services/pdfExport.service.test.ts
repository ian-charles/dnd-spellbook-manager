import { describe, it, expect } from 'vitest';
import { pdfExportService } from './pdfExport.service';
import { EnrichedSpell, SpellSlots } from '../types/spellbook';
import { Spell } from '../types/spell';

// Helper to create a minimal spell for testing
function createSpell(overrides: Partial<Spell> = {}): Spell {
  return {
    id: 'test-spell',
    name: 'Test Spell',
    level: 1,
    school: 'evocation',
    classes: ['wizard'],
    castingTime: '1 action',
    range: '60 feet',
    components: { verbal: true, somatic: true, material: false },
    materials: '',
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'A test spell description.',
    higherLevels: '',
    source: 'Test Source',
    ...overrides,
  };
}

// Helper to create an enriched spell for testing
function createEnrichedSpell(
  spellOverrides: Partial<Spell> = {},
  prepared = false,
  notes = ''
): EnrichedSpell {
  return {
    spell: createSpell(spellOverrides),
    prepared,
    notes,
  };
}

describe('pdfExportService', () => {
  describe('sortSpellsForPdf', () => {
    it('sorts cantrips before level 1 spells', () => {
      const spells = [
        createEnrichedSpell({ id: 'alarm', name: 'Alarm', level: 1 }),
        createEnrichedSpell({ id: 'firebolt', name: 'Fire Bolt', level: 0 }),
      ];

      const sorted = pdfExportService.sortSpellsForPdf(spells);

      expect(sorted[0].spell.name).toBe('Fire Bolt');
      expect(sorted[1].spell.name).toBe('Alarm');
    });

    it('sorts alphabetically within the same level', () => {
      const spells = [
        createEnrichedSpell({ id: 'shield', name: 'Shield', level: 1 }),
        createEnrichedSpell({ id: 'alarm', name: 'Alarm', level: 1 }),
        createEnrichedSpell({ id: 'magic-missile', name: 'Magic Missile', level: 1 }),
      ];

      const sorted = pdfExportService.sortSpellsForPdf(spells);

      expect(sorted[0].spell.name).toBe('Alarm');
      expect(sorted[1].spell.name).toBe('Magic Missile');
      expect(sorted[2].spell.name).toBe('Shield');
    });

    it('groups spells by level in ascending order', () => {
      const spells = [
        createEnrichedSpell({ id: 'fireball', name: 'Fireball', level: 3 }),
        createEnrichedSpell({ id: 'firebolt', name: 'Fire Bolt', level: 0 }),
        createEnrichedSpell({ id: 'shield', name: 'Shield', level: 1 }),
        createEnrichedSpell({ id: 'hold-person', name: 'Hold Person', level: 2 }),
      ];

      const sorted = pdfExportService.sortSpellsForPdf(spells);

      expect(sorted[0].spell.level).toBe(0);
      expect(sorted[1].spell.level).toBe(1);
      expect(sorted[2].spell.level).toBe(2);
      expect(sorted[3].spell.level).toBe(3);
    });

    it('does not mutate the original array', () => {
      const spells = [
        createEnrichedSpell({ id: 'shield', name: 'Shield', level: 1 }),
        createEnrichedSpell({ id: 'alarm', name: 'Alarm', level: 1 }),
      ];

      const sorted = pdfExportService.sortSpellsForPdf(spells);

      expect(spells[0].spell.name).toBe('Shield'); // Original unchanged
      expect(sorted[0].spell.name).toBe('Alarm');
      expect(sorted).not.toBe(spells);
    });
  });

  describe('sanitizeFilename', () => {
    it('converts to lowercase', () => {
      expect(pdfExportService.sanitizeFilename('My Wizard')).toBe('my-wizard');
    });

    it('replaces spaces with hyphens', () => {
      expect(pdfExportService.sanitizeFilename('spell book')).toBe('spell-book');
    });

    it('removes special characters', () => {
      expect(pdfExportService.sanitizeFilename("Gandalf's Book!")).toBe(
        'gandalf-s-book'
      );
    });

    it('collapses multiple hyphens', () => {
      expect(pdfExportService.sanitizeFilename('a---b')).toBe('a-b');
    });

    it('removes leading and trailing hyphens', () => {
      expect(pdfExportService.sanitizeFilename('---name---')).toBe('name');
    });

    it('handles complex names', () => {
      expect(
        pdfExportService.sanitizeFilename('Sir Demo the Demonstrative (L3 Wizard)')
      ).toBe('sir-demo-the-demonstrative-l3-wizard');
    });
  });

  describe('formatSpellSlots', () => {
    it('formats non-zero slots only', () => {
      const slots: SpellSlots = {
        level1: 4,
        level2: 3,
        level3: 0,
        level4: 0,
        level5: 0,
        level6: 0,
        level7: 0,
        level8: 0,
        level9: 0,
      };

      const result = pdfExportService.formatSpellSlots(slots);

      expect(result).toBe('Spell Slots: 1st: 4  2nd: 3');
    });

    it('returns empty string when all slots are zero', () => {
      const slots: SpellSlots = {
        level1: 0,
        level2: 0,
        level3: 0,
        level4: 0,
        level5: 0,
        level6: 0,
        level7: 0,
        level8: 0,
        level9: 0,
      };

      const result = pdfExportService.formatSpellSlots(slots);

      expect(result).toBe('');
    });

    it('uses ordinal suffixes correctly', () => {
      const slots: SpellSlots = {
        level1: 1,
        level2: 1,
        level3: 1,
        level4: 1,
        level5: 1,
        level6: 1,
        level7: 1,
        level8: 1,
        level9: 1,
      };

      const result = pdfExportService.formatSpellSlots(slots);

      expect(result).toContain('1st:');
      expect(result).toContain('2nd:');
      expect(result).toContain('3rd:');
      expect(result).toContain('4th:');
      expect(result).toContain('5th:');
      expect(result).toContain('6th:');
      expect(result).toContain('7th:');
      expect(result).toContain('8th:');
      expect(result).toContain('9th:');
    });
  });

  describe('formatStatsRow', () => {
    it('formats all stats when present', () => {
      const data = {
        name: 'Test',
        spellcastingAbility: 'INT' as const,
        spellAttackModifier: 7,
        spellSaveDC: 15,
        spells: [],
      };

      const result = pdfExportService.formatStatsRow(data);

      expect(result).toContain('Ability: INT');
      expect(result).toContain('Attack: +7');
      expect(result).toContain('Save DC: 15');
    });

    it('handles negative attack modifier', () => {
      const data = {
        name: 'Test',
        spellAttackModifier: -1,
        spells: [],
      };

      const result = pdfExportService.formatStatsRow(data);

      expect(result).toContain('Attack: -1');
    });

    it('handles zero attack modifier', () => {
      const data = {
        name: 'Test',
        spellAttackModifier: 0,
        spells: [],
      };

      const result = pdfExportService.formatStatsRow(data);

      expect(result).toContain('Attack: +0');
    });

    it('returns empty string when no stats present', () => {
      const data = {
        name: 'Test',
        spells: [],
      };

      const result = pdfExportService.formatStatsRow(data);

      expect(result).toBe('');
    });

    it('handles partial stats', () => {
      const data = {
        name: 'Test',
        spellSaveDC: 13,
        spells: [],
      };

      const result = pdfExportService.formatStatsRow(data);

      expect(result).toBe('Save DC: 13');
      expect(result).not.toContain('Ability');
      expect(result).not.toContain('Attack');
    });
  });
});
