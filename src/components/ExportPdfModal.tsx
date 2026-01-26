import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { lockScroll, unlockScroll } from '../utils/modalScrollLock';
import { pdfExportService } from '../services/pdfExport.service';
import { SpellExportScope } from '../types/pdfExport';
import { EnrichedSpell, Spellbook } from '../types/spellbook';
import './ExportPdfModal.css';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  spellbook: Spellbook;
  enrichedSpells: EnrichedSpell[];
  selectedSpellIds: Set<string>;
}

export function ExportPdfModal({
  isOpen,
  onClose,
  spellbook,
  enrichedSpells,
  selectedSpellIds,
}: ExportPdfModalProps) {
  const [scope, setScope] = useState<SpellExportScope>('all');
  const [isGenerating, setIsGenerating] = useState(false);

  const modalRef = useFocusTrap(isOpen);

  // Calculate counts for option labels
  const preparedCount = enrichedSpells.filter((s) => s.prepared).length;
  const selectedCount = selectedSpellIds.size;

  // Scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      lockScroll();
    }
    return () => {
      if (isOpen) {
        unlockScroll();
      }
    };
  }, [isOpen]);

  // Reset to valid scope when counts change
  useEffect(() => {
    if (scope === 'prepared' && preparedCount === 0) {
      setScope('all');
    }
    if (scope === 'selected' && selectedCount === 0) {
      setScope('all');
    }
  }, [preparedCount, selectedCount, scope]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isGenerating) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isGenerating, onClose]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsGenerating(true);

    try {
      // Filter spells based on selected scope
      let spellsToExport: EnrichedSpell[];

      switch (scope) {
        case 'prepared':
          spellsToExport = enrichedSpells.filter((s) => s.prepared);
          break;
        case 'selected':
          spellsToExport = enrichedSpells.filter((s) =>
            selectedSpellIds.has(s.spell.id)
          );
          break;
        default:
          spellsToExport = enrichedSpells;
      }

      pdfExportService.generateSpellbookPdf({
        name: spellbook.name,
        spellcastingAbility: spellbook.spellcastingAbility,
        spellAttackModifier: spellbook.spellAttackModifier,
        spellSaveDC: spellbook.spellSaveDC,
        maxSpellSlots: spellbook.maxSpellSlots,
        spells: spellsToExport,
      });

      onClose();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isGenerating) {
      onClose();
    }
  };

  return (
    <div className="dialog-overlay" onClick={handleOverlayClick}>
      <div
        className="dialog export-pdf-modal"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        data-testid="export-pdf-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-pdf-title"
      >
        <h3 id="export-pdf-title" className="export-pdf-title">
          <Printer size={20} aria-hidden="true" />
          Export to PDF
        </h3>

        <div className="export-options">
          <fieldset className="form-group">
            <legend>Which spells to export?</legend>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                />
                <span className="radio-label">
                  All spells ({enrichedSpells.length})
                </span>
              </label>

              <label
                className={`radio-option ${preparedCount === 0 ? 'disabled' : ''}`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="prepared"
                  checked={scope === 'prepared'}
                  onChange={() => setScope('prepared')}
                  disabled={preparedCount === 0}
                />
                <span className="radio-label">
                  Only prepared ({preparedCount})
                </span>
              </label>

              <label
                className={`radio-option ${selectedCount === 0 ? 'disabled' : ''}`}
              >
                <input
                  type="radio"
                  name="scope"
                  value="selected"
                  checked={scope === 'selected'}
                  onChange={() => setScope('selected')}
                  disabled={selectedCount === 0}
                />
                <span className="radio-label">
                  Only selected ({selectedCount})
                </span>
              </label>
            </div>
          </fieldset>

          <fieldset className="form-group">
            <legend>Format</legend>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="format"
                  value="text"
                  checked={true}
                  readOnly
                />
                <span className="radio-label">Reference list</span>
              </label>

              <label className="radio-option disabled">
                <input type="radio" name="format" value="cards" disabled />
                <span className="radio-label">
                  Spell cards{' '}
                  <span className="coming-soon">(coming soon)</span>
                </span>
              </label>
            </div>
          </fieldset>
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleExport}
            disabled={isGenerating || enrichedSpells.length === 0}
            data-testid="export-pdf-button"
          >
            {isGenerating ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
