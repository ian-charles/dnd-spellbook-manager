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
 * Core spells are prepared, additional spells are unprepped for tour demonstration.
 */
export const DEMO_SPELLBOOK_SPELLS: SpellbookSpell[] = [
  // Cantrips (prepared)
  { spellId: 'fire-bolt-5e-core-rules', prepared: true, notes: '' },
  { spellId: 'prestidigitation-5e-core-rules', prepared: true, notes: '' },
  { spellId: 'mage-hand-5e-core-rules', prepared: true, notes: '' },
  // Level 1 (prepared)
  { spellId: 'mage-armor-5e-core-rules', prepared: true, notes: '' },
  { spellId: 'magic-missile-5e-core-rules', prepared: true, notes: '' },
  { spellId: 'shield-5e-core-rules', prepared: true, notes: '' },
  { spellId: 'find-familiar-5e-core-rules', prepared: true, notes: '' },
  { spellId: 'feather-fall-5e-core-rules', prepared: false, notes: '' },
  { spellId: 'thunderwave-5e-core-rules', prepared: false, notes: '' },
  // Level 2 (prepared)
  { spellId: 'misty-step-5e-core-rules', prepared: true, notes: '' },
  { spellId: 'scorching-ray-5e-core-rules', prepared: true, notes: '' },
  { spellId: 'hold-person-5e-core-rules', prepared: false, notes: '' },
  { spellId: 'shatter-5e-core-rules', prepared: false, notes: '' },
];
