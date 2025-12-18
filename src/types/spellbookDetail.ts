import { Spellbook, CreateSpellbookInput, EnrichedSpell } from './spellbook';
import { SortColumn, SortDirection } from '../hooks/useSpellSorting';
import { UseFilterReducerReturn } from '../hooks/useFilterReducer';

export interface SpellbookDetailContextType {
    spellbook: Spellbook | null;
    enrichedSpells: EnrichedSpell[];
    sortedSpells: EnrichedSpell[];
    expandedSpellId: string | null;
    modalSpellId: string | null;
    sortColumn: SortColumn;
    sortDirection: SortDirection;
    selectedSpellIds: Set<string>;
    confirmDialog: {
        isOpen: boolean;
        spellIds: string[];
        message: string;
    };
    deleteSpellbookDialog: {
        isOpen: boolean;
    };
    editModalOpen: boolean;
    copyModalOpen: boolean;
    showPreparedOnly: boolean;
    allPrepared: boolean;
    filterReducer: UseFilterReducerReturn;
    schools: string[];
    classes: string[];
    sources: string[];
    onBack: () => void;
    onSort: (column: SortColumn) => void;
    onToggleSelected: (spellId: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onPrepSelected: () => void;
    onRemoveSelected: () => void;
    onConfirmRemove: () => void;
    onCancelRemove: () => void;
    onRowClick: (spellId: string) => void;
    onCloseModal: () => void;
    onEdit: () => void;
    onEditClose: () => void;
    onEditSave: (input: CreateSpellbookInput) => Promise<void>;
    onToggleShowPreparedOnly: () => void;
    onClearAllFilters: () => void;
    onCopy: () => void;
    onCopyClose: () => void;
    onCopySave: (input: CreateSpellbookInput) => Promise<void>;
    onTogglePrepared: (spellbookId: string, spellId: string) => Promise<void>;
    onRemoveSpell: (spellbookId: string, spellId: string) => Promise<void>;
    onRequestRemoveSpell: (spellId: string) => void;
    onDelete: () => void;
    onConfirmDelete: () => Promise<void>;
    onCancelDelete: () => void;
    existingNames: string[];
}
