import { db } from './db';
import {
  Spellbook,
  CreateSpellbookInput,
  UpdateSpellbookInput,
  SpellbookSpell,
} from '../types/spellbook';
import {
  DEMO_SPELLBOOK_NAME,
  DEMO_SPELLBOOK_INPUT,
  DEMO_SPELLBOOK_SPELLS,
} from '../constants/demoSpellbook';

// Module-level initialization promise to prevent race conditions
let initPromise: Promise<void> | null = null;

/**
 * Storage service for managing spellbooks in IndexedDB
 * Provides CRUD operations with async/await interface
 */
export class StorageService {
  /**
   * Expose db for advanced operations (like bulk import)
   */
  public db = db;

  /**
   * Create a new spellbook
   */
  async createSpellbook(input: CreateSpellbookInput): Promise<Spellbook> {
    const now = new Date().toISOString();
    const spellbook: Spellbook = {
      id: crypto.randomUUID(),
      name: input.name,
      spells: [],
      created: now,
      updated: now,
      spellcastingAbility: input.spellcastingAbility,
      spellAttackModifier: input.spellAttackModifier,
      spellSaveDC: input.spellSaveDC,
      maxSpellSlots: input.maxSpellSlots,
    };

    await db.spellbooks.add(spellbook);
    return spellbook;
  }

  /**
   * Get all spellbooks
   */
  async getSpellbooks(): Promise<Spellbook[]> {
    return await db.spellbooks.toArray();
  }

  /**
   * Get a single spellbook by ID
   */
  async getSpellbook(id: string): Promise<Spellbook | undefined> {
    return await db.spellbooks.get(id);
  }

  /**
   * Update a spellbook
   */
  async updateSpellbook(
    id: string,
    updates: UpdateSpellbookInput
  ): Promise<void> {
    await db.spellbooks.update(id, {
      ...updates,
      updated: new Date().toISOString(),
    });
  }

  /**
   * Delete a spellbook
   */
  async deleteSpellbook(id: string): Promise<void> {
    await db.spellbooks.delete(id);
  }

  /**
   * Add a spell to a spellbook
   * Uses atomic update to avoid race conditions when adding multiple spells in parallel
   */
  async addSpellToSpellbook(spellbookId: string, spellId: string): Promise<void> {
    // Use Dexie's update method for atomic read-modify-write
    const updateCount = await db.spellbooks.update(spellbookId, (spellbook: Spellbook) => {
      // Check if spell already exists
      if (spellbook.spells.some((s: SpellbookSpell) => s.spellId === spellId)) {
        return; // Already exists, no-op (return undefined means no update)
      }

      const newSpell: SpellbookSpell = {
        spellId,
        prepared: false,
        notes: '',
      };

      // Atomic update: modify the spells array in place
      spellbook.spells = [...spellbook.spells, newSpell];
      spellbook.updated = new Date().toISOString();
    });

    // If update() returns 0, the spellbook wasn't found
    if (updateCount === 0) {
      throw new Error(`Spellbook ${spellbookId} not found`);
    }
  }

  /**
   * Add multiple spells to a spellbook
   * Uses atomic update to avoid race conditions
   */
  async addSpellsToSpellbook(spellbookId: string, spellIds: string[]): Promise<void> {
    const updateCount = await db.spellbooks.update(spellbookId, (spellbook: Spellbook) => {
      const existingIds = new Set(spellbook.spells.map(s => s.spellId));
      const newSpells: SpellbookSpell[] = [];

      for (const spellId of spellIds) {
        if (!existingIds.has(spellId)) {
          newSpells.push({
            spellId,
            prepared: false,
            notes: '',
          });
          existingIds.add(spellId);
        }
      }

      if (newSpells.length > 0) {
        spellbook.spells = [...spellbook.spells, ...newSpells];
        spellbook.updated = new Date().toISOString();
      }
    });

    if (updateCount === 0) {
      throw new Error(`Spellbook ${spellbookId} not found`);
    }
  }

  /**
   * Remove a spell from a spellbook
   */
  async removeSpellFromSpellbook(
    spellbookId: string,
    spellId: string
  ): Promise<void> {
    // Use Dexie's atomic update
    const updateCount = await db.spellbooks.update(spellbookId, (spellbook: Spellbook) => {
      spellbook.spells = spellbook.spells.filter((s) => s.spellId !== spellId);
      spellbook.updated = new Date().toISOString();
    });

    if (updateCount === 0) {
      throw new Error(`Spellbook ${spellbookId} not found`);
    }
  }

  /**
   * Toggle prepared status of a spell
   */
  async toggleSpellPrepared(spellbookId: string, spellId: string): Promise<void> {
    const updateCount = await db.spellbooks.update(spellbookId, (spellbook: Spellbook) => {
      spellbook.spells = spellbook.spells.map((s) => {
        if (s.spellId === spellId) {
          return { ...s, prepared: !s.prepared };
        }
        return s;
      });
      spellbook.updated = new Date().toISOString();
    });

    if (updateCount === 0) {
      throw new Error(`Spellbook ${spellbookId} not found`);
    }
  }

  /**
   * Set prepared status for multiple spells at once
   * Uses atomic update to avoid race conditions
   */
  async setSpellsPrepared(spellbookId: string, spellIds: string[], prepared: boolean): Promise<void> {
    const spellIdSet = new Set(spellIds);
    const updateCount = await db.spellbooks.update(spellbookId, (spellbook: Spellbook) => {
      spellbook.spells = spellbook.spells.map((s) => {
        if (spellIdSet.has(s.spellId)) {
          return { ...s, prepared };
        }
        return s;
      });
      spellbook.updated = new Date().toISOString();
    });

    if (updateCount === 0) {
      throw new Error(`Spellbook ${spellbookId} not found`);
    }
  }

  /**
   * Update spell notes
   */
  async updateSpellNotes(
    spellbookId: string,
    spellId: string,
    notes: string
  ): Promise<void> {
    // Use Dexie's atomic update
    const updateCount = await db.spellbooks.update(spellbookId, (spellbook: Spellbook) => {
      spellbook.spells = spellbook.spells.map((s) =>
        s.spellId === spellId ? { ...s, notes } : s
      );
      spellbook.updated = new Date().toISOString();
    });

    if (updateCount === 0) {
      throw new Error(`Spellbook ${spellbookId} not found`);
    }
  }

  /**
   * Check if demo spellbook exists by name
   */
  async hasDemoSpellbook(): Promise<boolean> {
    const spellbooks = await this.getSpellbooks();
    return spellbooks.some(sb => sb.name === DEMO_SPELLBOOK_NAME);
  }

  /**
   * Create demo spellbook with predefined spells for new users.
   * Returns the created spellbook, or null if it already exists.
   */
  async createDemoSpellbook(): Promise<Spellbook | null> {
    // Don't create if demo already exists
    if (await this.hasDemoSpellbook()) {
      return null;
    }

    // Create the spellbook with pre-populated spells
    const now = new Date().toISOString();
    const spellbook: Spellbook = {
      id: crypto.randomUUID(),
      name: DEMO_SPELLBOOK_INPUT.name,
      spells: DEMO_SPELLBOOK_SPELLS,
      created: now,
      updated: now,
      spellcastingAbility: DEMO_SPELLBOOK_INPUT.spellcastingAbility,
      spellAttackModifier: DEMO_SPELLBOOK_INPUT.spellAttackModifier,
      spellSaveDC: DEMO_SPELLBOOK_INPUT.spellSaveDC,
      maxSpellSlots: DEMO_SPELLBOOK_INPUT.maxSpellSlots,
    };

    await db.spellbooks.add(spellbook);
    return spellbook;
  }

  /**
   * Initialize storage for new users.
   * Creates demo spellbook if no spellbooks exist.
   * Uses singleton pattern to ensure this only runs once,
   * preventing race conditions when multiple components call this.
   */
  async initializeForNewUser(): Promise<void> {
    // If already initialized or initializing, return the same promise
    if (initPromise) {
      return initPromise;
    }

    // Create and store the promise
    initPromise = (async () => {
      const spellbooks = await this.getSpellbooks();
      if (spellbooks.length === 0) {
        await this.createDemoSpellbook();
      }
    })();

    return initPromise;
  }

  /**
   * Export all data for backup
   */
  async exportData(): Promise<string> {
    const spellbooks = await this.getSpellbooks();
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      spellbooks,
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import data from backup
   */
  async importData(jsonData: string, replace = false): Promise<void> {
    try {
      const data = JSON.parse(jsonData);

      if (replace) {
        await db.spellbooks.clear();
      }

      for (const spellbook of data.spellbooks) {
        await db.spellbooks.put(spellbook);
      }
    } catch (error) {
      throw new Error(`Failed to import data: ${error}`);
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
