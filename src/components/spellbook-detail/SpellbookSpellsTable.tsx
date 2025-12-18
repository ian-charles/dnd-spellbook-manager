import { useRef, useEffect } from 'react';
import { EnrichedSpell } from '../../types/spellbook';
import { SortIcon } from '../SortIcon';
import { useLongPress } from '../../hooks/useLongPress';
import { useContextMenu } from '../../hooks/useContextMenu';
import { SpellbookSpellRow } from './SpellbookSpellRow';
import { SpellContextMenu } from './SpellContextMenu';

import { useSpellbookDetail } from '../../contexts/SpellbookDetailContext';

export function SpellbookSpellsTable() {
    const {
        sortedSpells,
        enrichedSpells,
        expandedSpellId,
        sortColumn,
        sortDirection,
        selectedSpellIds,
        spellbook,
        onSort,
        onRowClick,
        onToggleSelected,
        onTogglePrepared,
        onRequestRemoveSpell,
        onSelectAll,
        onDeselectAll,
    } = useSpellbookDetail();

    const masterCheckboxRef = useRef<HTMLInputElement>(null);

    // Calculate selection state for master checkbox
    const selectedCount = selectedSpellIds.size;
    const totalCount = enrichedSpells.length;
    const allSelected = totalCount > 0 && selectedCount === totalCount;
    const someSelected = selectedCount > 0 && selectedCount < totalCount;

    // Update master checkbox indeterminate state
    useEffect(() => {
        if (masterCheckboxRef.current) {
            masterCheckboxRef.current.indeterminate = someSelected;
        }
    }, [someSelected]);

    const handleMasterCheckboxChange = () => {
        // If any spells are selected, deselect all (including filtered)
        // If none selected, select all visible (filtered) spells
        if (selectedCount > 0) {
            onDeselectAll();
        } else {
            onSelectAll();
        }
    };

    // Context menu state for long-press
    const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu<EnrichedSpell>();

    // Long-press handlers for mobile context menu
    const pendingSpell = useRef<EnrichedSpell | null>(null);
    const touchStartEvent = useRef<React.TouchEvent | null>(null);

    const {
        onTouchStart: onTouchStartHook,
        onTouchMove,
        onTouchEnd
    } = useLongPress({
        onLongPress: () => {
            if (pendingSpell.current && touchStartEvent.current) {
                openContextMenu(touchStartEvent.current, pendingSpell.current);
            }
        }
    });

    const handleTouchStart = (e: React.TouchEvent, spell: EnrichedSpell) => {
        pendingSpell.current = spell;
        touchStartEvent.current = e;
        onTouchStartHook(e);
    };

    return (
        <>
            <div className="spellbook-table-container" data-testid="spellbook-spell-list">
                <table className="spell-table spellbook-table">
                    <thead>
                        <tr>
                            <th className="checkbox-col">
                                <input
                                    type="checkbox"
                                    ref={masterCheckboxRef}
                                    checked={allSelected}
                                    onChange={handleMasterCheckboxChange}
                                    aria-label={allSelected ? "Deselect all spells" : "Select all spells"}
                                    title={allSelected ? "Deselect all spells" : "Select all spells"}
                                />
                            </th>
                            <th onClick={() => onSort('name')} className="sortable">
                                <div className="th-content">
                                    Spell Name
                                    <SortIcon column="name" currentColumn={sortColumn} currentDirection={sortDirection} />
                                </div>
                            </th>
                            <th onClick={() => onSort('level')} className="sortable level-col">
                                <div className="th-content">
                                    Level
                                    <SortIcon column="level" currentColumn={sortColumn} currentDirection={sortDirection} />
                                </div>
                            </th>
                            <th onClick={() => onSort('castingTime')} className="sortable time-col">
                                <div className="th-content">
                                    Cast Time
                                    <SortIcon column="castingTime" currentColumn={sortColumn} currentDirection={sortDirection} />
                                </div>
                            </th>
                            <th onClick={() => onSort('range')} className="sortable range-col">
                                <div className="th-content">
                                    Range
                                    <SortIcon column="range" currentColumn={sortColumn} currentDirection={sortDirection} />
                                </div>
                            </th>
                            <th onClick={() => onSort('duration')} className="sortable duration-col">
                                <div className="th-content">
                                    Duration
                                    <SortIcon column="duration" currentColumn={sortColumn} currentDirection={sortDirection} />
                                </div>
                            </th>
                            <th onClick={() => onSort('school')} className="sortable school-col">
                                <div className="th-content">
                                    School
                                    <SortIcon column="school" currentColumn={sortColumn} currentDirection={sortDirection} />
                                </div>
                            </th>
                            <th className="components-col">Comp.</th>
                            <th onClick={() => onSort('source')} className="sortable source-col">
                                <div className="th-content">
                                    Source
                                    <SortIcon column="source" currentColumn={sortColumn} currentDirection={sortDirection} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSpells.map((enrichedSpell) => (
                            <SpellbookSpellRow
                                key={enrichedSpell.spell.id}
                                enrichedSpell={enrichedSpell}
                                isSelected={selectedSpellIds.has(enrichedSpell.spell.id)}
                                isExpanded={expandedSpellId === enrichedSpell.spell.id}
                                onToggleSelected={onToggleSelected}
                                onRowClick={onRowClick}
                                onTouchStartLongPress={(e) => handleTouchStart(e, enrichedSpell)}
                                onTouchMoveLongPress={onTouchMove}
                                onTouchEndLongPress={onTouchEnd}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            {contextMenu && spellbook && (
                <SpellContextMenu
                    spell={contextMenu.data}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    isSelected={selectedSpellIds.has(contextMenu.data.spell.id)}
                    onToggleSelected={() => onToggleSelected(contextMenu.data.spell.id)}
                    onTogglePrepared={() => onTogglePrepared(spellbook.id, contextMenu.data.spell.id)}
                    onRemove={() => onRequestRemoveSpell(contextMenu.data.spell.id)}
                    onClose={closeContextMenu}
                />
            )}
        </>
    );
}
