import { Spellbook } from '../../types/spellbook';
import { SortIcon } from '../SortIcon';
import { SortDirection } from '../../hooks/useSpellSorting';
import { Copy, Trash2 } from 'lucide-react';

export type SortColumn = 'name' | 'spells' | 'ability' | 'attack' | 'saveDC' | 'updated';

/**
 * Props for the SpellbookListTable component.
 */
export interface SpellbookListTableProps {
    /** List of spellbooks to display */
    spellbooks: Spellbook[];
    /** Current sort column */
    sortColumn: SortColumn;
    /** Current sort direction */
    sortDirection: SortDirection;
    /** Callback to update sort column */
    onSort: (column: SortColumn) => void;
    /** Callback when a spellbook is clicked */
    onSpellbookClick: (id: string) => void;
    /** Callback when the copy button is clicked */
    onCopy: (id: string) => void;
    /** Callback when the delete button is clicked */
    onDelete: (id: string, name: string) => void;
    /** Callback for touch start event (long press) */
    onTouchStart: (e: React.TouchEvent, spellbook: Spellbook) => void;
    /** Callback for touch move event */
    onTouchMove: (e: React.TouchEvent) => void;
    /** Callback for touch end event */
    onTouchEnd: () => void;
}

export function SpellbookListTable({
    spellbooks,
    sortColumn,
    sortDirection,
    onSort,
    onSpellbookClick,
    onCopy,
    onDelete,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
}: SpellbookListTableProps) {
    return (
        <table className="spellbooks-table" data-testid="spellbooks-table">
            <thead>
                <tr>
                    <th className="sortable-header">
                        <button onClick={() => onSort('name')} className="sort-button">
                            Spellbook Name
                            <SortIcon column="name" currentColumn={sortColumn} currentDirection={sortDirection} />
                        </button>
                    </th>
                    <th className="sortable-header">
                        <button onClick={() => onSort('spells')} className="sort-button">
                            Spells
                            <SortIcon column="spells" currentColumn={sortColumn} currentDirection={sortDirection} />
                        </button>
                    </th>
                    <th className="sortable-header">
                        <button onClick={() => onSort('ability')} className="sort-button">
                            Ability
                            <SortIcon column="ability" currentColumn={sortColumn} currentDirection={sortDirection} />
                        </button>
                    </th>
                    <th className="sortable-header">
                        <button onClick={() => onSort('attack')} className="sort-button">
                            Attack
                            <SortIcon column="attack" currentColumn={sortColumn} currentDirection={sortDirection} />
                        </button>
                    </th>
                    <th className="sortable-header">
                        <button onClick={() => onSort('saveDC')} className="sort-button">
                            Save DC
                            <SortIcon column="saveDC" currentColumn={sortColumn} currentDirection={sortDirection} />
                        </button>
                    </th>
                    <th className="sortable-header">
                        <button onClick={() => onSort('updated')} className="sort-button">
                            Last Updated
                            <SortIcon column="updated" currentColumn={sortColumn} currentDirection={sortDirection} />
                        </button>
                    </th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {spellbooks.map((spellbook) => (
                    <tr
                        key={spellbook.id}
                        className="spellbook-row"
                        data-testid={`spellbook-row-${spellbook.id}`}
                        onClick={() => onSpellbookClick(spellbook.id)}
                        onTouchStart={(e) => onTouchStart(e, spellbook)}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        <td className="spellbook-name" data-testid="spellbook-name" data-label="Name">
                            {spellbook.name}
                        </td>
                        <td className="spellbook-spell-count" data-label="Spells">
                            {spellbook.spells.length}
                        </td>
                        <td className="spellbook-ability" data-label="Ability">
                            {spellbook.spellcastingAbility || 'N/A'}
                        </td>
                        <td className="spellbook-attack" data-label="Attack">
                            {spellbook.spellAttackModifier !== undefined
                                ? `+${spellbook.spellAttackModifier}`
                                : 'N/A'}
                        </td>
                        <td className="spellbook-save-dc" data-label="Save DC">
                            {spellbook.spellSaveDC ?? 'N/A'}
                        </td>
                        <td className="spellbook-updated" data-label="Last Updated">
                            {new Date(spellbook.updated).toLocaleDateString()}
                        </td>
                        <td className="spellbook-actions" data-label="Actions" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="btn-icon-secondary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCopy(spellbook.id);
                                }}
                                data-testid={`btn-copy-spellbook-${spellbook.id}`}
                                title="Copy Spellbook"
                                aria-label={`Copy spellbook ${spellbook.name}`}
                            >
                                <Copy size={16} />
                            </button>
                            <button
                                className="btn-icon-danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(spellbook.id, spellbook.name);
                                }}
                                data-testid={`btn-delete-spellbook-${spellbook.id}`}
                                title="Delete Spellbook"
                                aria-label={`Delete spellbook ${spellbook.name}`}
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
