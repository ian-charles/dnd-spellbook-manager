/**
 * Minimum spell level (Cantrip).
 */
export const MIN_SPELL_LEVEL = 0;

/**
 * Maximum spell level (9th level).
 */
export const MAX_SPELL_LEVEL = 9;

/**
 * Minimum spell attack modifier.
 */
export const MIN_ATTACK_MODIFIER = 0;

/**
 * Maximum spell attack modifier.
 */
export const MAX_ATTACK_MODIFIER = 18;

/**
 * Minimum spell save DC.
 */
export const MIN_SAVE_DC = 8;

/**
 * Maximum spell save DC.
 */
export const MAX_SAVE_DC = 26;

/**
 * Default spellcasting ability used when none is specified.
 * Used for:
 * 1. New spellbook creation (default selection)
 * 2. Copying spellbooks (fallback if source has no ability)
 * 3. Type safety in components requiring a valid ability
 */
export const DEFAULT_SPELLCASTING_ABILITY = 'INT';

/**
 * Maximum length for a spellbook name.
 */
export const MAX_SPELLBOOK_NAME_LENGTH = 50;

/**
 * Maximum file size for spellbook imports (5MB).
 */
export const MAX_IMPORT_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Regex for strict numeric validation (positive integers only).
 */
export const STRICT_NUMERIC_REGEX = /^\d+$/;
