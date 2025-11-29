import { Spellbook, CreateSpellbookInput, EnrichedSpell } from './spellbook';
import { SortColumn, SortDirection } from '../hooks/useSpellSorting';

export interface SpellbookDetailContextType {
    spellbook: Spellbook | null;
    enrichedSpells: EnrichedSpell[];
    sortedSpells: EnrichedSpell[];
    expandedSpellId: string | null;
    sortColumn: SortColumn;
    sortDirection: SortDirection;
    confirmDialog: {
        isOpen: boolean;
        spellId: string;
        spellName: string;
    };
    editModalOpen: boolean;
    showPreparedOnly: boolean;
    onBack: () => void;
    onSort: (column: SortColumn) => void;
    onTogglePrepared: (spellId: string) => void;
    onRemoveSpell: (spellId: string, spellName: string) => void;
    onConfirmRemove: () => void;
    onCancelRemove: () => void;
    onRowClick: (spellId: string) => void;
    onEdit: () => void;
    onEditClose: () => void;
    onEditSave: (input: CreateSpellbookInput) => Promise<void>;
    onToggleShowPreparedOnly: () => void;
    onSelectAllPrepared: () => void;
    onCopy: () => void;
    existingNames: string[];
}
