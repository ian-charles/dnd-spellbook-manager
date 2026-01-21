import { CreateSpellbookInput, SpellbookSpell } from '../types/spellbook';

/**
 * Demo spellbook for new users.
 * Created on first page load to provide content for the Spellbooks tour.
 * Represents a Level 3 Wizard with a mix of cantrips and leveled spells.
 */

/** Unique identifier for the demo spellbook - used to detect if it exists */
export const DEMO_SPELLBOOK_NAME = 'Sir Demo the Demonstrative (L3 Wizard)';

/** Demo spellbook creation input */
export const DEMO_SPELLBOOK_INPUT: CreateSpellbookInput = {
  name: DEMO_SPELLBOOK_NAME,
  spellcastingAbility: 'INT',
  spellAttackModifier: 5,
  spellSaveDC: 13,
  maxSpellSlots: {
    level1: 4,
    level2: 2,
    level3: 0,
    level4: 0,
    level5: 0,
    level6: 0,
    level7: 0,
    level8: 0,
    level9: 0,
  },
};

/**
 * Spells for the demo spellbook.
 * Mix of cantrips and leveled spells to demonstrate filtering/sorting.
 * None are prepared - the tour will guide users through preparation.
 */
export const DEMO_SPELLBOOK_SPELLS: SpellbookSpell[] = [
  // Cantrips
  { spellId: 'fire-bolt', prepared: false, notes: '' },
  { spellId: 'prestidigitation', prepared: false, notes: '' },
  { spellId: 'mage-hand', prepared: false, notes: '' },
  // Level 1
  { spellId: 'mage-armor', prepared: false, notes: '' },
  { spellId: 'magic-missile', prepared: false, notes: '' },
  { spellId: 'shield', prepared: false, notes: '' },
  { spellId: 'find-familiar', prepared: false, notes: '' },
  // Level 2
  { spellId: 'misty-step', prepared: false, notes: '' },
  { spellId: 'scorching-ray', prepared: false, notes: '' },
];
