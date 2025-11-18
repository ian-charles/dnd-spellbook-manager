/**
 * User-facing message constants
 *
 * Centralized location for all UI text to improve maintainability
 * and enable future internationalization (i18n) support.
 */

export const MESSAGES = {
  LOADING: {
    SPELLS: 'Loading spells from the archive...',
    SPELLBOOKS: 'Loading spellbooks...',
    SPELLBOOK: 'Loading spellbook...',
  },
  SUCCESS: {
    SPELL_ADDED: '✓ Spell added to spellbook!',
    IMPORT_SUCCESS: 'Import Successful',
  },
  ERROR: {
    FAILED_TO_ADD_SPELL: 'Failed to Add Spell',
    CREATION_FAILED: 'Creation Failed',
    DELETE_FAILED: 'Delete Failed',
    EXPORT_FAILED: 'Export Failed',
    IMPORT_FAILED: 'Import Failed',
    IMPORT_WITH_ERRORS: 'Import Completed with Errors',
    ERROR_LOADING_SPELLS: 'Error loading spells',
    FAILED_TO_CREATE_SPELLBOOK: 'Failed to create spellbook. Please try again.',
    FAILED_TO_DELETE_SPELLBOOK: 'Failed to delete spellbook. Please try again.',
    FAILED_TO_EXPORT_SPELLBOOKS: 'Failed to export spellbooks. Please try again.',
    FAILED_TO_IMPORT_SPELLBOOKS: 'Failed to import spellbooks:',
    FAILED_TO_ADD_SPELL_GENERIC: 'Failed to add spell. It might already be in this spellbook.',
  },
  INFO: {
    NO_SPELLBOOKS: 'No Spellbooks',
    CREATE_SPELLBOOK_FIRST: 'Create a spellbook first!',
  },
  IMPORT: {
    IMPORTED_LABEL: 'Imported:',
    SKIPPED_LABEL: 'Skipped:',
    ERRORS_LABEL: 'Errors:',
  },
  BUTTONS: {
    EXPORT: 'Export',
    IMPORT: 'Import',
    CREATE_NEW_SPELLBOOK: 'Create New Spellbook',
  },
  TOOLTIPS: {
    NO_SPELLBOOKS_TO_EXPORT: 'No spellbooks to export',
    EXPORT_ALL_SPELLBOOKS: 'Export all spellbooks',
  },
  EMPTY_STATES: {
    NO_SPELLBOOKS_YET: "You don't have any spellbooks yet.",
    CLICK_NEW_SPELLBOOK: 'Click "New Spellbook" to create your first one!',
    SPELLBOOK_IS_EMPTY: 'This spellbook is empty.',
    GO_TO_BROWSE: 'Go to the Browse tab to add spells!',
  },
  FORMS: {
    SPELLBOOK_NAME_LABEL: 'Spellbook Name',
    SPELLBOOK_NAME_PLACEHOLDER: 'e.g., My Wizard Spells',
  },
  DIALOG: {
    ADD_TO_SPELLBOOK: 'Add to Spellbook',
    SELECT_SPELLBOOK: 'Select a spellbook:',
    REMOVE_SPELL: 'Remove Spell',
    REMOVE_SPELL_CONFIRM: 'Remove "{spellName}" from this spellbook?',
    BACK_TO_SPELLBOOKS: '← Back to Spellbooks',
  },
} as const;
