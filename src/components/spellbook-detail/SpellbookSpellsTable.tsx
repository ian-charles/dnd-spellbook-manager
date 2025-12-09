import { useRef } from 'react';
import { EnrichedSpell } from '../../types/spellbook';
import { SortIcon } from '../SortIcon';
import { useLongPress } from '../../hooks/useLongPress';
import { SpellbookSpellRow } from './SpellbookSpellRow';

import { useSpellbookDetail } from '../../contexts/SpellbookDetailContext';

export function SpellbookSpellsTable() {
    const {
        sortedSpells,
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
    } = useSpellbookDetail();

    // Long-press handlers for mobile selection
    const pendingSpell = useRef<EnrichedSpell | null>(null);

    const {
        onTouchStart: onTouchStartHook,
        onTouchMove,
        onTouchEnd
    } = useLongPress({
        onLongPress: () => {
            if (pendingSpell.current) {
                onToggleSelected(pendingSpell.current.spell.id);
            }
        }
    });

    const handleTouchStart = (e: React.TouchEvent, spell: EnrichedSpell) => {
        pendingSpell.current = spell;
        onTouchStartHook(e);
    };

    return (
        <>
            <div className="spellbook-table-container" data-testid="spellbook-spell-list">
                <table className="spell-table spellbook-table">
                    <thead>
                        <tr>
                            <th className="prepared-col">Select</th>
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
                                spellbookId={spellbook?.id || ''}
                                onToggleSelected={onToggleSelected}
                                onRowClick={onRowClick}
                                onTogglePrepared={onTogglePrepared}
                                onRequestRemoveSpell={onRequestRemoveSpell}
                                onTouchStartLongPress={(e) => handleTouchStart(e, enrichedSpell)}
                                onTouchMoveLongPress={onTouchMove}
                                onTouchEndLongPress={onTouchEnd}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
