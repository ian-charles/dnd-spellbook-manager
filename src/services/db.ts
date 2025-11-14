import Dexie, { Table } from 'dexie';
import { Spellbook } from '../types/spellbook';

/**
 * IndexedDB database for storing spellbooks locally
 */
export class DndSpellbookDB extends Dexie {
  spellbooks!: Table<Spellbook, string>;

  constructor() {
    super('DndSpellbookDB');

    this.version(1).stores({
      spellbooks: 'id, name, created, updated',
    });
  }
}

export const db = new DndSpellbookDB();
