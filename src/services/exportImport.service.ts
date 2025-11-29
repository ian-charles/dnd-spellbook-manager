import { storageService } from './storage.service';
import { Spellbook } from '../types/spellbook';

export interface ExportData {
  version: string;
  exportDate: string;
  spellbooks: Spellbook[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Service for handling spellbook import and export operations.
 * Supports JSON format with versioning and schema validation.
 */
class ExportImportService {
  private readonly CURRENT_VERSION = '1.0';

  /**
   * Export all spellbooks to a JSON string
   */
  async exportSpellbooks(): Promise<string> {
    const spellbooks = await storageService.getSpellbooks();

    const exportData: ExportData = {
      version: this.CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      spellbooks,
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import spellbooks from a JSON string
   * Skips spellbooks with duplicate IDs
   */
  async importSpellbooks(jsonString: string): Promise<ImportResult> {
    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    try {
      const data = JSON.parse(jsonString);

      // Validate structure
      if (!data.version || !data.exportDate || !Array.isArray(data.spellbooks)) {
        throw new Error('Invalid import data format');
      }

      // Check version compatibility
      if (data.version !== this.CURRENT_VERSION) {
        throw new Error(`Unsupported export version: ${data.version}`);
      }

      // Get existing spellbook IDs
      const existing = await storageService.getSpellbooks();
      const existingIds = new Set(existing.map((sb) => sb.id));

      // Import each spellbook
      for (const spellbook of data.spellbooks) {
        try {
          // Validate spellbook schema
          if (!this.isValidSpellbook(spellbook)) {
            result.errors.push(`Invalid spellbook format: "${spellbook.name || 'Unknown'}"`);
            continue;
          }

          // Skip if ID already exists
          if (existingIds.has(spellbook.id)) {
            result.skipped++;
            continue;
          }

          // Add spellbook directly to database
          await storageService.db.spellbooks.add(spellbook);
          result.imported++;
        } catch (error) {
          result.errors.push(`Failed to import "${spellbook.name}": ${error}`);
        }
      }

      return result;
    } catch (error) {
      // Re-throw validation errors
      if (error instanceof Error && error.message.includes('Invalid import data')) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('Unsupported export version')) {
        throw error;
      }

      // Throw JSON parse errors
      throw new Error(`Failed to parse import data: ${error}`);
    }
  }

  /**
   * Validates the structure and types of a spellbook object.
   * Ensures all required fields are present and have correct types.
   * 
   * @param spellbook - The object to validate
   * @returns True if the object matches the Spellbook interface
   */
  private isValidSpellbook(spellbook: any): spellbook is Spellbook {
    if (!spellbook || typeof spellbook !== 'object') return false;

    // Check required fields
    const requiredFields = ['id', 'name', 'spells', 'created', 'updated'];
    for (const field of requiredFields) {
      if (!(field in spellbook)) return false;
    }

    // Validate types
    if (typeof spellbook.id !== 'string') return false;
    if (typeof spellbook.name !== 'string') return false;
    if (!Array.isArray(spellbook.spells)) return false;

    // Validate spells array content
    for (const spell of spellbook.spells) {
      if (!spell || typeof spell !== 'object') return false;
      if (typeof spell.spellId !== 'string') return false;
      // prepared and notes are optional in older versions? No, interface says required.
      // But let's be lenient if possible, or strict if we want to enforce schema.
      // Given this is "Missing Schema Validation", strict is better.
      if (typeof spell.prepared !== 'boolean') return false;
      // notes might be missing in very old exports if added later, but let's check if it exists
      if (typeof spell.notes !== 'string') return false;
    }

    return true;
  }

  /**
   * Trigger browser download of spellbooks export
   */
  async downloadSpellbooks(): Promise<void> {
    const jsonString = await this.exportSpellbooks();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `spellbooks-backup-${this.getDateString()}.json`;

    // Trigger download
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
  }

  /**
   * Get formatted date string for filename (YYYY-MM-DD)
   */
  private getDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export const exportImportService = new ExportImportService();
