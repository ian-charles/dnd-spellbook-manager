import { Spell, SpellData, SpellFilters } from '../types/spell';

/**
 * Spell data service for loading and searching spells
 * Provides client-side search with instant performance
 */
export class SpellService {
  private spells: Spell[] = [];
  private loaded = false;

  /**
   * Load spell data from bundled JSON
   */
  async loadSpells(): Promise<void> {
    if (this.loaded) {
      return;
    }

    try {
      const basePath = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${basePath}data/spells.json`);
      if (!response.ok) {
        throw new Error(`Failed to load spells: ${response.statusText}`);
      }

      const data: SpellData = await response.json();
      this.spells = data.spells;
      this.loaded = true;


    } catch (error) {
      console.error('❌ Error loading spells:', error);
      throw error;
    }
  }

  /**
   * Get all spells
   */
  getAllSpells(): Spell[] {
    return this.spells;
  }

  /**
   * Get a single spell by ID
   */
  getSpellById(id: string): Spell | undefined {
    return this.spells.find((spell) => spell.id === id);
  }

  /**
   * Search and filter spells
   */
  searchSpells(filters: SpellFilters): Spell[] {
    let results = this.spells;

    // Text search by spell name only (case insensitive)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      results = results.filter((spell) =>
        spell.name.toLowerCase().includes(searchLower)
      );
    }

    // Filter by spell level range
    if (filters.levelRange) {
      results = results.filter(
        (spell) =>
          spell.level >= filters.levelRange!.min &&
          spell.level <= filters.levelRange!.max
      );
    }

    // Filter by schools
    if (filters.schools && filters.schools.length > 0) {
      results = results.filter((spell) =>
        filters.schools!.some(s => s.toLowerCase() === spell.school.toLowerCase())
      );
    }

    // Filter by classes
    if (filters.classes && filters.classes.length > 0) {
      results = results.filter((spell) =>
        filters.classes!.some((filterClass) =>
          spell.classes.some(c => c.toLowerCase() === filterClass.toLowerCase())
        )
      );
    }

    // Filter by sources
    if (filters.sources && filters.sources.length > 0) {
      results = results.filter((spell) =>
        filters.sources!.some(s => s.toLowerCase() === spell.source.toLowerCase())
      );
    }

    // Filter by concentration
    if (filters.concentration !== undefined) {
      results = results.filter(
        (spell) => spell.concentration === filters.concentration
      );
    }

    // Filter by ritual
    if (filters.ritual !== undefined) {
      results = results.filter((spell) => spell.ritual === filters.ritual);
    }

    // Filter by verbal component
    if (filters.componentVerbal !== undefined) {
      results = results.filter(
        (spell) => spell.components.verbal === filters.componentVerbal
      );
    }

    // Filter by somatic component
    if (filters.componentSomatic !== undefined) {
      results = results.filter(
        (spell) => spell.components.somatic === filters.componentSomatic
      );
    }

    // Filter by material component
    if (filters.componentMaterial !== undefined) {
      results = results.filter(
        (spell) => spell.components.material === filters.componentMaterial
      );
    }

    return results;
  }

  /**
   * Get unique list of schools
   */
  getSchools(): string[] {
    const schools = new Set(this.spells.map((spell) => spell.school));
    return Array.from(schools).sort();
  }

  /**
   * Get unique list of classes
   */
  getClasses(): string[] {
    const classes = new Set<string>();
    this.spells.forEach((spell) => {
      spell.classes.forEach((c) => {
        // Filter out "Ritual Caster" as it's a feat, not a class
        if (c.toLowerCase() !== 'ritual caster') {
          classes.add(c);
        }
      });
    });
    return Array.from(classes).sort();
  }

  /**
   * Get unique list of sources
   */
  getSources(): string[] {
    const sources = new Set(this.spells.map((spell) => spell.source));
    return Array.from(sources).sort();
  }

  /**
   * Get spell count by level
   */
  getSpellCountByLevel(): Record<number, number> {
    const counts: Record<number, number> = {};
    this.spells.forEach((spell) => {
      counts[spell.level] = (counts[spell.level] || 0) + 1;
    });
    return counts;
  }
}

// Export singleton instance
export const spellService = new SpellService();
