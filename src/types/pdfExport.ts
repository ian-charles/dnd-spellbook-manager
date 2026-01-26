import { EnrichedSpell, SpellSlots } from './spellbook';

/**
 * Which spells to include in the PDF export
 */
export type SpellExportScope = 'all' | 'prepared' | 'selected';

/**
 * PDF layout format
 * - 'text': Reference list style, spells listed vertically
 * - 'cards': Card grid layout (future feature)
 */
export type ExportFormat = 'text' | 'cards';

/**
 * User-selected options for PDF export
 */
export interface PdfExportOptions {
  scope: SpellExportScope;
  format: ExportFormat;
}

/**
 * All data needed to generate a spellbook PDF
 */
export interface SpellbookPdfData {
  name: string;
  spellcastingAbility?: 'INT' | 'WIS' | 'CHA';
  spellAttackModifier?: number;
  spellSaveDC?: number;
  maxSpellSlots?: SpellSlots;
  spells: EnrichedSpell[];
}
