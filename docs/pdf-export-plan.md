# PDF Export Feature Implementation Plan

## Overview
Add ability to export spellbook contents to a printer-friendly PDF for analog play.

## User Requirements
- **Print button** in SpellbookDetail header (alongside Edit, Copy, Delete)
- **Export dialog** with options:
  - Spell scope: All (default) | Only Prepared | Only Selected
  - Format: Text-based (Phase 1) | Card-based (disabled, future)
- **PDF format**: Reference list sorted by level then alphabetically
- **Include**: Spellbook header (name, stats, slots) + all spell details
- **Printer-friendly**: Color OK, minimal shading for white paper

---

## Progress

### Completed (Phase 1: Text-Based Export)
- [x] Install jsPDF dependency
- [x] Create type definitions (`src/types/pdfExport.ts`)
- [x] Create PDF export service (`src/services/pdfExport.service.ts`)
- [x] Create unit tests for service (`src/services/pdfExport.service.test.ts`) - 18 tests
- [x] Create ExportPdfModal component (`src/components/ExportPdfModal.tsx`)
- [x] Create modal styles (`src/components/ExportPdfModal.css`)
- [x] Integrate Print button into SpellbookDetailView
- [x] Build passes, all 624 tests pass

### Remaining Work
- [ ] Manual QA and layout refinements after testing generated PDFs
- [ ] Card-based format (Phase 2 - future)

---

## Files Created

| File | Purpose |
|------|---------|
| `src/types/pdfExport.ts` | Type definitions for export options |
| `src/services/pdfExport.service.ts` | PDF generation logic using jsPDF |
| `src/services/pdfExport.service.test.ts` | Unit tests for the service |
| `src/components/ExportPdfModal.tsx` | Export options dialog |
| `src/components/ExportPdfModal.css` | Modal styling (mobile-first) |

## Files Modified

| File | Changes |
|------|---------|
| `src/components/SpellbookDetailView.tsx` | Added Print button + ExportPdfModal |
| `package.json` | Added jsPDF dependency |

---

## PDF Layout Specification

### Page Setup
- Size: Letter (8.5" x 11")
- Margins: 0.75" all sides
- Font: Helvetica (built into jsPDF)

### First Page Header
```
[Spellbook Name]                           Page 1 of N
────────────────────────────────────────────────────────
Ability: WIS    Attack: +7    Save DC: 15
Spell Slots: 1st: 4  2nd: 3  3rd: 3
Spells: 24 total, 8 prepared
────────────────────────────────────────────────────────
```

### Spell Entry Format
```
────────────────────────────────────────────────────────
LEVEL 1
────────────────────────────────────────────────────────

Shield ★                                      Abjuration
Casting: 1 reaction  |  Range: Self  |  Duration: 1 round
Components: V, S
────────────────────────────────────────────────────────
[Full description text, wrapped to fit page width]

At Higher Levels: [If applicable, in italics]

Source: PHB
════════════════════════════════════════════════════════
```

### Typography
- Spellbook name: 18pt bold
- Level headings: 12pt bold, uppercase
- Spell name: 11pt bold + gold star (★) if prepared
- Details: 9-10pt regular
- Source: 8pt gray

---

## Testing Approach

### Unit Tests (`pdfExport.service.test.ts`)
- `sortSpellsForPdf()` - Sorts cantrips first, then by level, then alphabetically
- `sanitizeFilename()` - Creates valid filenames from spellbook names
- `formatSpellSlots()` - Only includes non-zero slots
- `formatStatsRow()` - Handles present/missing/negative values

### Manual Testing
- Test with spellbooks of varying sizes (1 spell, 50 spells)
- Print the generated PDF to verify layout
- Check page breaks don't split spell entries awkwardly

---

## Future: Card-Based Format (Phase 2)

Not implemented in Phase 1, but keep in mind:
- Grid layout with 4-6 cards per page
- Each card: fixed size with spell name, level badge, key stats
- May need different library or more complex jsPDF usage
- Button visible but disabled with "coming soon" tooltip
