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
