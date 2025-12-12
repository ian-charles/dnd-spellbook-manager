import { Spell } from './spell';

export interface SpellbookSpell {
  spellId: string;
  prepared: boolean;
  notes: string;
}

/**
 * Spell slots for levels 1-9 (cantrips don't require slots)
 * Represents how many spells of each level can be cast before a long rest
 */
export interface SpellSlots {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  level6: number;
  level7: number;
  level8: number;
  level9: number;
}

export interface Spellbook {
  id: string;
  name: string;
  spells: SpellbookSpell[];
  created: string;
  updated: string;
  spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
  spellAttackModifier?: number;
  spellSaveDC?: number;
  maxSpellSlots?: SpellSlots;
}

export interface CreateSpellbookInput {
  name: string;
  spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
  spellAttackModifier?: number;
  spellSaveDC?: number;
  maxSpellSlots?: SpellSlots;
}

export interface UpdateSpellbookInput {
  name?: string;
  spells?: SpellbookSpell[];
  spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
  spellAttackModifier?: number;
  spellSaveDC?: number;
  maxSpellSlots?: SpellSlots;
}

export interface EnrichedSpell {
  spell: Spell;
  prepared: boolean;
  notes: string;
}
