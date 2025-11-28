// SpellService tests
// Using vitest globals (describe, it, expect, beforeEach, vi are globally available)

import { SpellService } from './spell.service';
import { mockSpells } from '../test/mockData';

describe('SpellService', () => {
  let service;

  beforeEach(() => {
    // Create a fresh instance for each test
    service = new SpellService();

    // Mock fetch to return our test data
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ spells: mockSpells }),
      })
    );
  });

  describe('loadSpells', () => {
    it('should load spells from the API', async () => {
      await service.loadSpells();
      const spells = service.getAllSpells();

      expect(spells).toHaveLength(6);
      expect(spells).toEqual(mockSpells);
    });

    it('should only load spells once', async () => {
      await service.loadSpells();
      await service.loadSpells();

      // fetch should only be called once
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error if fetch fails', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Not Found',
        })
      );

      await expect(service.loadSpells()).rejects.toThrow('Failed to load spells: Not Found');
    });

    it('should throw error if JSON parsing fails', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.reject(new Error('Invalid JSON')),
        })
      );

      await expect(service.loadSpells()).rejects.toThrow('Invalid JSON');
    });
  });

  describe('getAllSpells', () => {
    it('should return all loaded spells', async () => {
      await service.loadSpells();
      const spells = service.getAllSpells();

      expect(spells).toHaveLength(6);
      expect(spells[0].name).toBe('Fireball');
    });

    it('should return empty array when no spells loaded', () => {
      const spells = service.getAllSpells();
      expect(spells).toEqual([]);
    });
  });

  describe('getSpellById', () => {
    beforeEach(async () => {
      await service.loadSpells();
    });

    it('should return spell by ID', () => {
      const spell = service.getSpellById('fireball');

      expect(spell).toBeDefined();
      expect(spell.name).toBe('Fireball');
      expect(spell.level).toBe(3);
    });

    it('should return undefined for non-existent ID', () => {
      const spell = service.getSpellById('non-existent');
      expect(spell).toBeUndefined();
    });
  });

  describe('searchSpells', () => {
    beforeEach(async () => {
      await service.loadSpells();
    });

    describe('text search', () => {
      it('should search by spell name', () => {
        const results = service.searchSpells({ searchText: 'fireball' });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Fireball');
      });

      it('should search case-insensitively', () => {
        const results = service.searchSpells({ searchText: 'SHIELD' });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Shield');
      });

      it('should search in description', () => {
        const results = service.searchSpells({ searchText: 'magical force' });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Shield');
      });

      it('should search by school', () => {
        const results = service.searchSpells({ searchText: 'evocation' });

        expect(results.length).toBeGreaterThanOrEqual(3);
        expect(results.some(s => s.name === 'Fireball')).toBe(true);
      });

      it('should search by class', () => {
        const results = service.searchSpells({ searchText: 'warlock' });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Eldritch Blast');
      });

      it('should return all spells for empty search', () => {
        const results = service.searchSpells({ searchText: '' });
        expect(results).toHaveLength(6);
      });

      it('should return empty array for non-matching search', () => {
        const results = service.searchSpells({ searchText: 'zzzznonexistent' });
        expect(results).toHaveLength(0);
      });
    });

    describe('level filtering', () => {
      it('should filter by single level', () => {
        const results = service.searchSpells({ levelRange: { min: 1, max: 1 } });

        expect(results).toHaveLength(4); // shield, detect-magic, healing-word, arcane-weapon
        expect(results.every(s => s.level === 1)).toBe(true);
      });

      it('should filter by multiple levels', () => {
        const results = service.searchSpells({ levelRange: { min: 0, max: 1 } });

        expect(results).toHaveLength(5); // All level 0 and 1 spells
        expect(results.every(s => s.level === 0 || s.level === 1)).toBe(true);
      });

      it('should filter cantrips (level 0)', () => {
        const results = service.searchSpells({ levelRange: { min: 0, max: 0 } });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Eldritch Blast');
      });
    });

    describe('school filtering', () => {
      it('should filter by single school', () => {
        const results = service.searchSpells({ schools: ['evocation'] });

        expect(results).toHaveLength(3); // Fireball, Healing Word, Eldritch Blast
        expect(results.every(s => s.school === 'evocation')).toBe(true);
      });

      it('should filter by multiple schools', () => {
        const results = service.searchSpells({ schools: ['evocation', 'abjuration'] });

        expect(results).toHaveLength(4);
        expect(results.every(s => ['evocation', 'abjuration'].includes(s.school))).toBe(true);
      });
    });

    describe('class filtering', () => {
      it('should filter by single class', () => {
        const results = service.searchSpells({ classes: ['wizard'] });

        expect(results).toHaveLength(3); // Fireball, Shield, Detect Magic
        expect(results.every(s => s.classes.includes('wizard'))).toBe(true);
      });

      it('should filter by multiple classes', () => {
        const results = service.searchSpells({ classes: ['cleric', 'bard'] });

        expect(results).toHaveLength(2); // Detect Magic, Healing Word
      });

      it('should filter warlock-only spells', () => {
        const results = service.searchSpells({ classes: ['warlock'] });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Eldritch Blast');
      });
    });

    describe('concentration filtering', () => {
      it('should filter concentration spells', () => {
        const results = service.searchSpells({ concentration: true });

        expect(results).toHaveLength(2); // Detect Magic, Arcane Weapon
        expect(results.every(s => s.concentration)).toBe(true);
      });

      it('should filter non-concentration spells', () => {
        const results = service.searchSpells({ concentration: false });

        expect(results).toHaveLength(4);
        expect(results.every(s => !s.concentration)).toBe(true);
      });
    });

    describe('ritual filtering', () => {
      it('should filter ritual spells', () => {
        const results = service.searchSpells({ ritual: true });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Detect Magic');
      });

      it('should filter non-ritual spells', () => {
        const results = service.searchSpells({ ritual: false });

        expect(results).toHaveLength(5);
        expect(results.every(s => !s.ritual)).toBe(true);
      });
    });

    describe('component filtering', () => {
      it('should filter spells requiring verbal component', () => {
        const results = service.searchSpells({ componentVerbal: true });

        expect(results).toHaveLength(6); // All mock spells have verbal
        expect(results.every(s => s.components.verbal)).toBe(true);
      });

      it('should filter spells NOT requiring verbal component', () => {
        const results = service.searchSpells({ componentVerbal: false });

        expect(results).toHaveLength(0); // All our mocks have verbal
      });

      it('should filter spells requiring somatic component', () => {
        const results = service.searchSpells({ componentSomatic: true });

        expect(results).toHaveLength(5); // All except Healing Word
        expect(results.every(s => s.components.somatic)).toBe(true);
      });

      it('should filter spells NOT requiring somatic component', () => {
        const results = service.searchSpells({ componentSomatic: false });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Healing Word');
      });

      it('should filter spells requiring material component', () => {
        const results = service.searchSpells({ componentMaterial: true });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Fireball');
      });

      it('should filter spells NOT requiring material component', () => {
        const results = service.searchSpells({ componentMaterial: false });

        expect(results).toHaveLength(5);
        expect(results.every(s => !s.components.material)).toBe(true);
      });

      it('should filter V-only spells (V but not S or M)', () => {
        const results = service.searchSpells({
          componentVerbal: true,
          componentSomatic: false,
          componentMaterial: false,
        });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Healing Word');
      });
    });

    describe('combined filtering', () => {
      it('should combine text search and level filter', () => {
        const results = service.searchSpells({
          searchText: 'wizard',
          levelRange: { min: 1, max: 1 },
        });

        expect(results).toHaveLength(2); // Shield, Detect Magic
      });

      it('should combine multiple filters', () => {
        const results = service.searchSpells({
          levelRange: { min: 1, max: 1 },
          schools: ['divination'],
          ritual: true,
        });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Detect Magic');
      });

      it('should return empty array when no spells match all filters', () => {
        const results = service.searchSpells({
          levelRange: { min: 0, max: 0 },
          concentration: true,
        });

        expect(results).toHaveLength(0);
      });

      it('should handle complex filter combinations', () => {
        const results = service.searchSpells({
          classes: ['wizard'],
          componentMaterial: false,
          concentration: false,
        });

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Shield');
      });
    });

    it('should return all spells for empty filters', () => {
      const results = service.searchSpells({});
      expect(results).toHaveLength(6);
    });
  });

  describe('getSchools', () => {
    beforeEach(async () => {
      await service.loadSpells();
    });

    it('should return unique list of schools', () => {
      const schools = service.getSchools();

      expect(schools).toContain('evocation');
      expect(schools).toContain('abjuration');
      expect(schools).toContain('divination');
      expect(schools).toContain('transmutation');
      expect(schools.length).toBe(4);
    });

    it('should return sorted schools', () => {
      const schools = service.getSchools();

      expect(schools).toEqual(['abjuration', 'divination', 'evocation', 'transmutation']);
    });

    it('should return empty array when no spells loaded', () => {
      const emptyService = new SpellService();
      const schools = emptyService.getSchools();

      expect(schools).toEqual([]);
    });
  });

  describe('getClasses', () => {
    beforeEach(async () => {
      await service.loadSpells();
    });

    it('should return unique list of classes', () => {
      const classes = service.getClasses();

      expect(classes).toContain('wizard');
      expect(classes).toContain('sorcerer');
      expect(classes).toContain('cleric');
      expect(classes).toContain('bard');
      expect(classes).toContain('druid');
      expect(classes).toContain('warlock');
      expect(classes).toContain('artificer');
    });

    it('should return sorted classes', () => {
      const classes = service.getClasses();

      expect(classes).toEqual(['artificer', 'bard', 'cleric', 'druid', 'sorcerer', 'warlock', 'wizard']);
    });

    it('should handle spells with multiple classes', () => {
      const classes = service.getClasses();

      // Each class should only appear once despite multiple spells having it
      const wizardCount = classes.filter(c => c === 'wizard').length;
      expect(wizardCount).toBe(1);
    });
  });

  describe('getSources', () => {
    beforeEach(async () => {
      await service.loadSpells();
    });

    it('should return unique list of sources', () => {
      const sources = service.getSources();

      expect(sources).toContain('5e Core Rules');
      expect(sources).toContain('Deep Magic');
      expect(sources.length).toBe(2);
    });

    it('should return sorted sources', () => {
      const sources = service.getSources();

      expect(sources).toEqual(['5e Core Rules', 'Deep Magic']);
    });
  });

  describe('getSpellCountByLevel', () => {
    beforeEach(async () => {
      await service.loadSpells();
    });

    it('should return count of spells by level', () => {
      const counts = service.getSpellCountByLevel();

      expect(counts[0]).toBe(1); // Eldritch Blast
      expect(counts[1]).toBe(4); // Shield, Detect Magic, Healing Word, Arcane Weapon
      expect(counts[3]).toBe(1); // Fireball
    });

    it('should not include levels with zero spells', () => {
      const counts = service.getSpellCountByLevel();

      expect(counts[2]).toBeUndefined();
      expect(counts[4]).toBeUndefined();
    });
  });
});
