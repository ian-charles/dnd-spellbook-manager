/**
 * Unit tests for message constants
 *
 * Verifies that all user-facing messages are properly defined
 * and exported for use throughout the application.
 */

import { describe, it, expect } from 'vitest';
import { MESSAGES } from './messages';

describe('MESSAGES constants', () => {
  describe('LOADING messages', () => {
    it('should export SPELLS loading message', () => {
      expect(MESSAGES.LOADING.SPELLS).toBe('Loading spells from the archive...');
    });

    it('should export SPELLBOOKS loading message', () => {
      expect(MESSAGES.LOADING.SPELLBOOKS).toBe('Loading spellbooks...');
    });

    it('should export SPELLBOOK loading message', () => {
      expect(MESSAGES.LOADING.SPELLBOOK).toBe('Loading spellbook...');
    });
  });

  describe('SUCCESS messages', () => {
    it('should export SPELL_ADDED success message', () => {
      expect(MESSAGES.SUCCESS.SPELL_ADDED).toBe('✓ Spell added to spellbook!');
    });

    it('should export IMPORT_SUCCESS message', () => {
      expect(MESSAGES.SUCCESS.IMPORT_SUCCESS).toBe('Import Successful');
    });
  });

  describe('ERROR messages', () => {
    it('should export FAILED_TO_ADD_SPELL error message', () => {
      expect(MESSAGES.ERROR.FAILED_TO_ADD_SPELL).toBe('Failed to Add Spell');
    });

    it('should export CREATION_FAILED error message', () => {
      expect(MESSAGES.ERROR.CREATION_FAILED).toBe('Creation Failed');
    });

    it('should export DELETE_FAILED error message', () => {
      expect(MESSAGES.ERROR.DELETE_FAILED).toBe('Delete Failed');
    });

    it('should export EXPORT_FAILED error message', () => {
      expect(MESSAGES.ERROR.EXPORT_FAILED).toBe('Export Failed');
    });

    it('should export IMPORT_FAILED error message', () => {
      expect(MESSAGES.ERROR.IMPORT_FAILED).toBe('Import Failed');
    });

    it('should export IMPORT_WITH_ERRORS error message', () => {
      expect(MESSAGES.ERROR.IMPORT_WITH_ERRORS).toBe('Import Completed with Errors');
    });

    it('should export ERROR_LOADING_SPELLS message', () => {
      expect(MESSAGES.ERROR.ERROR_LOADING_SPELLS).toBe('Error loading spells');
    });

    it('should export FAILED_TO_CREATE_SPELLBOOK message', () => {
      expect(MESSAGES.ERROR.FAILED_TO_CREATE_SPELLBOOK).toBe('Failed to create spellbook. Please try again.');
    });

    it('should export FAILED_TO_DELETE_SPELLBOOK message', () => {
      expect(MESSAGES.ERROR.FAILED_TO_DELETE_SPELLBOOK).toBe('Failed to delete spellbook. Please try again.');
    });

    it('should export FAILED_TO_EXPORT_SPELLBOOKS message', () => {
      expect(MESSAGES.ERROR.FAILED_TO_EXPORT_SPELLBOOKS).toBe('Failed to export spellbooks. Please try again.');
    });

    it('should export FAILED_TO_IMPORT_SPELLBOOKS message', () => {
      expect(MESSAGES.ERROR.FAILED_TO_IMPORT_SPELLBOOKS).toBe('Failed to import spellbooks:');
    });

    it('should export FAILED_TO_ADD_SPELL_GENERIC message', () => {
      expect(MESSAGES.ERROR.FAILED_TO_ADD_SPELL_GENERIC).toBe('Failed to add spell. It might already be in this spellbook.');
    });
  });

  describe('INFO messages', () => {
    it('should export NO_SPELLBOOKS info message', () => {
      expect(MESSAGES.INFO.NO_SPELLBOOKS).toBe('No Spellbooks');
    });

    it('should export CREATE_SPELLBOOK_FIRST message', () => {
      expect(MESSAGES.INFO.CREATE_SPELLBOOK_FIRST).toBe('Create a spellbook first!');
    });
  });

  describe('IMPORT messages', () => {
    it('should export IMPORTED_LABEL', () => {
      expect(MESSAGES.IMPORT.IMPORTED_LABEL).toBe('Imported:');
    });

    it('should export SKIPPED_LABEL', () => {
      expect(MESSAGES.IMPORT.SKIPPED_LABEL).toBe('Skipped:');
    });

    it('should export ERRORS_LABEL', () => {
      expect(MESSAGES.IMPORT.ERRORS_LABEL).toBe('Errors:');
    });
  });

  describe('BUTTONS messages', () => {
    it('should export EXPORT button text', () => {
      expect(MESSAGES.BUTTONS.EXPORT).toBe('Export');
    });

    it('should export IMPORT button text', () => {
      expect(MESSAGES.BUTTONS.IMPORT).toBe('Import');
    });

    it('should export CREATE_NEW_SPELLBOOK button text', () => {
      expect(MESSAGES.BUTTONS.CREATE_NEW_SPELLBOOK).toBe('Create New Spellbook');
    });
  });

  describe('TOOLTIPS messages', () => {
    it('should export NO_SPELLBOOKS_TO_EXPORT tooltip', () => {
      expect(MESSAGES.TOOLTIPS.NO_SPELLBOOKS_TO_EXPORT).toBe('No spellbooks to export');
    });

    it('should export EXPORT_ALL_SPELLBOOKS tooltip', () => {
      expect(MESSAGES.TOOLTIPS.EXPORT_ALL_SPELLBOOKS).toBe('Export all spellbooks');
    });
  });

  describe('EMPTY_STATES messages', () => {
    it('should export NO_SPELLBOOKS_YET empty state', () => {
      expect(MESSAGES.EMPTY_STATES.NO_SPELLBOOKS_YET).toBe("You don't have any spellbooks yet.");
    });

    it('should export CLICK_NEW_SPELLBOOK empty state', () => {
      expect(MESSAGES.EMPTY_STATES.CLICK_NEW_SPELLBOOK).toBe('Click "New Spellbook" to create your first one!');
    });

    it('should export SPELLBOOK_IS_EMPTY empty state', () => {
      expect(MESSAGES.EMPTY_STATES.SPELLBOOK_IS_EMPTY).toBe('This spellbook is empty.');
    });

    it('should export GO_TO_BROWSE empty state', () => {
      expect(MESSAGES.EMPTY_STATES.GO_TO_BROWSE).toBe('Go to the Browse tab to add spells!');
    });
  });

  describe('FORMS messages', () => {
    it('should export SPELLBOOK_NAME_LABEL form label', () => {
      expect(MESSAGES.FORMS.SPELLBOOK_NAME_LABEL).toBe('Spellbook Name');
    });

    it('should export SPELLBOOK_NAME_PLACEHOLDER form placeholder', () => {
      expect(MESSAGES.FORMS.SPELLBOOK_NAME_PLACEHOLDER).toBe('e.g., My Wizard Spells');
    });
  });

  describe('DIALOG messages', () => {
    it('should export ADD_TO_SPELLBOOK dialog title', () => {
      expect(MESSAGES.DIALOG.ADD_TO_SPELLBOOK).toBe('Add to Spellbook');
    });

    it('should export SELECT_SPELLBOOK dialog prompt', () => {
      expect(MESSAGES.DIALOG.SELECT_SPELLBOOK).toBe('Select a spellbook:');
    });

    it('should export REMOVE_SPELL dialog title', () => {
      expect(MESSAGES.DIALOG.REMOVE_SPELL).toBe('Remove Spell');
    });

    it('should export REMOVE_SPELL_CONFIRM dialog message with placeholder', () => {
      expect(MESSAGES.DIALOG.REMOVE_SPELL_CONFIRM).toBe('Remove "{spellName}" from this spellbook?');
    });

    it('should export BACK_TO_SPELLBOOKS button text', () => {
      expect(MESSAGES.DIALOG.BACK_TO_SPELLBOOKS).toBe('← Back to Spellbooks');
    });

    it('should support replacing {spellName} placeholder in REMOVE_SPELL_CONFIRM', () => {
      const message = MESSAGES.DIALOG.REMOVE_SPELL_CONFIRM.replace('{spellName}', 'Fireball');
      expect(message).toBe('Remove "Fireball" from this spellbook?');
    });
  });

  describe('MESSAGES structure', () => {
    it('should be a constant object', () => {
      expect(typeof MESSAGES).toBe('object');
      expect(MESSAGES).not.toBeNull();
    });

    it('should have all top-level categories', () => {
      expect(MESSAGES).toHaveProperty('LOADING');
      expect(MESSAGES).toHaveProperty('SUCCESS');
      expect(MESSAGES).toHaveProperty('ERROR');
      expect(MESSAGES).toHaveProperty('INFO');
      expect(MESSAGES).toHaveProperty('IMPORT');
      expect(MESSAGES).toHaveProperty('BUTTONS');
      expect(MESSAGES).toHaveProperty('TOOLTIPS');
      expect(MESSAGES).toHaveProperty('EMPTY_STATES');
      expect(MESSAGES).toHaveProperty('FORMS');
      expect(MESSAGES).toHaveProperty('DIALOG');
    });

    it('should have all strings as non-empty', () => {
      const checkAllStrings = (obj: any, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'string') {
            expect(value.length, `${currentPath} should not be empty`).toBeGreaterThan(0);
          } else if (typeof value === 'object' && value !== null) {
            checkAllStrings(value, currentPath);
          }
        });
      };

      checkAllStrings(MESSAGES);
    });
  });
});
