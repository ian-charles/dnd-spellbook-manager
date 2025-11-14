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
      const response = await fetch('/data/spells.json');
      if (!response.ok) {
        throw new Error(`Failed to load spells: ${response.statusText}`);
      }

      const data: SpellData = await response.json();
      this.spells = data.spells;
      this.loaded = true;

      console.log(`✅ Loaded ${this.spells.length} spells`);
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

    // Text search across name and description
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      results = results.filter(
        (spell) =>
          spell.name.toLowerCase().includes(searchLower) ||
          spell.description.toLowerCase().includes(searchLower) ||
          spell.school.toLowerCase().includes(searchLower) ||
          spell.classes.some((c) => c.toLowerCase().includes(searchLower))
      );
    }

    // Filter by spell levels
    if (filters.levels && filters.levels.length > 0) {
      results = results.filter((spell) => filters.levels!.includes(spell.level));
    }

    // Filter by schools
    if (filters.schools && filters.schools.length > 0) {
      results = results.filter((spell) =>
        filters.schools!.includes(spell.school.toLowerCase())
      );
    }

    // Filter by classes
    if (filters.classes && filters.classes.length > 0) {
      results = results.filter((spell) =>
        filters.classes!.some((filterClass) =>
          spell.classes.includes(filterClass.toLowerCase())
        )
      );
    }

    // Filter by sources
    if (filters.sources && filters.sources.length > 0) {
      results = results.filter((spell) =>
        filters.sources!.includes(spell.source)
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
      spell.classes.forEach((c) => classes.add(c));
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
