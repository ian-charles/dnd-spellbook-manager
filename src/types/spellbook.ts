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
}

export interface CreateSpellbookInput {
  name: string;
}

export interface UpdateSpellbookInput {
  name?: string;
  spells?: SpellbookSpell[];
}
