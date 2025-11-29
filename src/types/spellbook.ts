import { Spell } from './spell';

export interface SpellbookSpell {
  spellId: string;
  prepared: boolean;
  notes: string;
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
}

export interface CreateSpellbookInput {
  name: string;
  spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
  spellAttackModifier?: number;
  spellSaveDC?: number;
}

export interface UpdateSpellbookInput {
  name?: string;
  spells?: SpellbookSpell[];
  spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
  spellAttackModifier?: number;
  spellSaveDC?: number;
}

export interface EnrichedSpell {
  spell: Spell;
  prepared: boolean;
  notes: string;
}
