import { jsPDF } from 'jspdf';
import { SpellbookPdfData } from '../types/pdfExport';
import { EnrichedSpell, SpellSlots } from '../types/spellbook';
import { Spell } from '../types/spell';
import { getComponentsWithMaterials } from '../utils/spellFormatters';

/**
 * Service for generating PDF exports of spellbooks.
 * Uses jsPDF for client-side PDF generation.
 */
class PdfExportService {
  // Page dimensions in mm (Letter size)
  private readonly PAGE_WIDTH = 215.9;
  private readonly PAGE_HEIGHT = 279.4;
  private readonly MARGIN = 19; // 0.75 inches
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - 2 * this.MARGIN;

  /**
   * Generate and download a PDF of the spellbook.
   */
  generateSpellbookPdf(data: SpellbookPdfData): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter',
    });

    let y = this.MARGIN;

    // Draw spellbook header on first page
    y = this.drawSpellbookHeader(doc, data, y);

    // Sort spells by level, then alphabetically
    const sortedSpells = this.sortSpellsForPdf(data.spells);

    // Track current level for section headings
    let currentLevel = -1;

    for (const enrichedSpell of sortedSpells) {
      const spell = enrichedSpell.spell;

      // New level section
      if (spell.level !== currentLevel) {
        currentLevel = spell.level;

        // Check if we need a new page for level heading
        if (y > this.PAGE_HEIGHT - 60) {
          doc.addPage();
          y = this.MARGIN;
        }

        y = this.drawLevelHeading(doc, spell.level, y);
      }

      // Draw spell entry (handles page breaks internally)
      y = this.drawSpellEntry(doc, enrichedSpell, y);
    }

    // Add page numbers and export date
    this.addPageFooters(doc);

    // Download the PDF
    const filename = this.sanitizeFilename(data.name);
    doc.save(`${filename}-spells.pdf`);
  }

  /**
   * Draw the spellbook header on the first page.
   */
  private drawSpellbookHeader(
    doc: jsPDF,
    data: SpellbookPdfData,
    y: number
  ): number {
    // Spellbook name
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(data.name, this.MARGIN, y);
    y += 8;

    // Divider line
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(this.MARGIN, y, this.PAGE_WIDTH - this.MARGIN, y);
    y += 6;

    // Stats row
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const statsText = this.formatStatsRow(data);
    if (statsText) {
      doc.text(statsText, this.MARGIN, y);
      y += 5;
    }

    // Spell slots
    if (data.maxSpellSlots) {
      const slotsText = this.formatSpellSlots(data.maxSpellSlots);
      if (slotsText) {
        doc.text(slotsText, this.MARGIN, y);
        y += 5;
      }
    }

    // Spell counts
    const preparedCount = data.spells.filter((s) => s.prepared).length;
    doc.text(
      `Spells: ${data.spells.length} total, ${preparedCount} prepared`,
      this.MARGIN,
      y
    );
    y += 5;

    // Divider line
    doc.line(this.MARGIN, y, this.PAGE_WIDTH - this.MARGIN, y);
    y += 10;

    return y;
  }

  /**
   * Draw a level section heading.
   */
  private drawLevelHeading(doc: jsPDF, level: number, y: number): number {
    const levelText = level === 0 ? 'CANTRIPS' : `LEVEL ${level}`;

    // Divider above
    doc.setDrawColor(120);
    doc.setLineWidth(0.4);
    doc.line(this.MARGIN, y, this.PAGE_WIDTH - this.MARGIN, y);
    y += 5;

    // Level text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(levelText, this.MARGIN, y);
    y += 5;

    // Divider below
    doc.line(this.MARGIN, y, this.PAGE_WIDTH - this.MARGIN, y);
    y += 8;

    return y;
  }

  /**
   * Draw a single spell entry with all its details.
   */
  private drawSpellEntry(
    doc: jsPDF,
    enrichedSpell: EnrichedSpell,
    y: number
  ): number {
    const spell = enrichedSpell.spell;

    // Estimate height needed for this spell
    const estimatedHeight = this.estimateSpellHeight(doc, spell);

    // Page break if needed
    if (y + estimatedHeight > this.PAGE_HEIGHT - this.MARGIN) {
      doc.addPage();
      y = this.MARGIN;
    }

    // Spell name + prepared indicator
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    let nameText = spell.name;
    if (enrichedSpell.prepared) {
      nameText += ' \u2605'; // Unicode filled star
    }
    doc.text(nameText, this.MARGIN, y);

    // School (right-aligned, capitalize first letter)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const schoolText = this.capitalize(spell.school);
    const schoolWidth = doc.getTextWidth(schoolText);
    doc.text(schoolText, this.PAGE_WIDTH - this.MARGIN - schoolWidth, y);
    y += 5;

    // Casting time, range, duration row
    doc.setFontSize(9);
    const detailsRow = `Casting: ${spell.castingTime}  |  Range: ${spell.range}  |  Duration: ${spell.duration}`;
    doc.text(detailsRow, this.MARGIN, y);
    y += 4;

    // Components
    const componentsText = `Components: ${getComponentsWithMaterials(spell)}`;
    const componentLines = doc.splitTextToSize(
      componentsText,
      this.CONTENT_WIDTH
    );
    doc.text(componentLines, this.MARGIN, y);
    y += componentLines.length * 3.5;

    // Concentration/Ritual tags
    const tags: string[] = [];
    if (spell.concentration) tags.push('Concentration');
    if (spell.ritual) tags.push('Ritual');
    if (tags.length > 0) {
      doc.text(tags.join('  |  '), this.MARGIN, y);
      y += 4;
    }

    y += 2; // Gap before description

    // Description
    doc.setFontSize(9);
    const descLines = doc.splitTextToSize(spell.description, this.CONTENT_WIDTH);
    doc.text(descLines, this.MARGIN, y);
    y += descLines.length * 3.5;

    // Higher levels (if present)
    if (spell.higherLevels) {
      y += 2;
      doc.setFont('helvetica', 'italic');
      const higherText = `At Higher Levels: ${spell.higherLevels}`;
      const higherLines = doc.splitTextToSize(higherText, this.CONTENT_WIDTH);
      doc.text(higherLines, this.MARGIN, y);
      y += higherLines.length * 3.5;
      doc.setFont('helvetica', 'normal');
    }

    // Source
    y += 2;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Source: ${spell.source}`, this.MARGIN, y);
    doc.setTextColor(0);
    y += 5;

    // Spell divider
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(this.MARGIN, y, this.PAGE_WIDTH - this.MARGIN, y);
    y += 6;

    return y;
  }

  /**
   * Estimate the height needed for a spell entry.
   */
  private estimateSpellHeight(doc: jsPDF, spell: Spell): number {
    // Base height for name, details, components, source, divider
    let height = 35;

    // Description lines
    doc.setFontSize(9);
    const descLines = doc.splitTextToSize(
      spell.description,
      this.CONTENT_WIDTH
    ).length;
    height += descLines * 3.5;

    // Higher levels
    if (spell.higherLevels) {
      const higherLines = doc.splitTextToSize(
        spell.higherLevels,
        this.CONTENT_WIDTH
      ).length;
      height += higherLines * 3.5 + 2;
    }

    // Concentration/Ritual row
    if (spell.concentration || spell.ritual) {
      height += 4;
    }

    return height;
  }

  /**
   * Add page numbers and export date to all pages.
   */
  private addPageFooters(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    const exportDate = new Date().toLocaleDateString();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(130);

      // Page number (right side)
      doc.text(
        `Page ${i} of ${pageCount}`,
        this.PAGE_WIDTH - this.MARGIN,
        this.PAGE_HEIGHT - 10,
        { align: 'right' }
      );

      // Export date (left side, first page only)
      if (i === 1) {
        doc.text(`Exported: ${exportDate}`, this.MARGIN, this.PAGE_HEIGHT - 10);
      }

      doc.setTextColor(0);
    }
  }

  /**
   * Sort spells by level (ascending), then alphabetically by name.
   */
  sortSpellsForPdf(spells: EnrichedSpell[]): EnrichedSpell[] {
    return [...spells].sort((a, b) => {
      if (a.spell.level !== b.spell.level) {
        return a.spell.level - b.spell.level;
      }
      return a.spell.name.localeCompare(b.spell.name);
    });
  }

  /**
   * Format the stats row (ability, attack modifier, save DC).
   */
  formatStatsRow(data: SpellbookPdfData): string {
    const parts: string[] = [];
    if (data.spellcastingAbility) {
      parts.push(`Ability: ${data.spellcastingAbility}`);
    }
    if (data.spellAttackModifier !== undefined) {
      const sign = data.spellAttackModifier >= 0 ? '+' : '';
      parts.push(`Attack: ${sign}${data.spellAttackModifier}`);
    }
    if (data.spellSaveDC !== undefined) {
      parts.push(`Save DC: ${data.spellSaveDC}`);
    }
    return parts.join('    ');
  }

  /**
   * Format spell slots as a single line.
   */
  formatSpellSlots(slots: SpellSlots): string {
    const parts: string[] = [];
    if (slots.level1) parts.push(`1st: ${slots.level1}`);
    if (slots.level2) parts.push(`2nd: ${slots.level2}`);
    if (slots.level3) parts.push(`3rd: ${slots.level3}`);
    if (slots.level4) parts.push(`4th: ${slots.level4}`);
    if (slots.level5) parts.push(`5th: ${slots.level5}`);
    if (slots.level6) parts.push(`6th: ${slots.level6}`);
    if (slots.level7) parts.push(`7th: ${slots.level7}`);
    if (slots.level8) parts.push(`8th: ${slots.level8}`);
    if (slots.level9) parts.push(`9th: ${slots.level9}`);
    return parts.length > 0 ? `Spell Slots: ${parts.join('  ')}` : '';
  }

  /**
   * Create a safe filename from the spellbook name.
   */
  sanitizeFilename(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Capitalize the first letter of a string.
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const pdfExportService = new PdfExportService();
