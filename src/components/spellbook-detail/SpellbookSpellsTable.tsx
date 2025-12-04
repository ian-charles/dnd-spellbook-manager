import { Fragment, useRef } from 'react';
import { EnrichedSpell } from '../../types/spellbook';
import { SortIcon } from '../SortIcon';
import { ComponentBadges } from '../SpellBadges';
import { getLevelText, truncateCastingTime } from '../../utils/spellFormatters';
import { useLongPress } from '../../hooks/useLongPress';
import { SpellExpansionRow } from '../SpellExpansionRow';
import { useContextMenu } from '../../hooks/useContextMenu';

import { useSpellbookDetail } from '../../contexts/SpellbookDetailContext';

export function SpellbookSpellsTable() {
    const {
        sortedSpells,
        expandedSpellId,
        sortColumn,
        sortDirection,
        onSort,
        onRowClick,
        onTogglePrepared,
        onRemoveSpell,
    } = useSpellbookDetail();
    // ... inside component
    // Context menu state for mobile
    const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu<{
        spellId: string;
        spellName: string;
        prepared: boolean;
    }>();

    // Long-press handlers for mobile context menu
    const pendingSpell = useRef<EnrichedSpell | null>(null);

    const {
        onTouchStart: onTouchStartHook,
        onTouchMove,
        onTouchEnd
    } = useLongPress({
        onLongPress: (e: React.TouchEvent) => {
            if (pendingSpell.current) {
                openContextMenu(e, {
                    spellId: pendingSpell.current.spell.id,
                    spellName: pendingSpell.current.spell.name,
                    prepared: pendingSpell.current.prepared,
                });
            }
        }
    });

    const handleTouchStart = (e: React.TouchEvent, spell: EnrichedSpell) => {
        pendingSpell.current = spell;
        onTouchStartHook(e);
    };

    const handleContextMenuAction = (action: 'prep' | 'remove', spellId: string, spellName: string) => {
        closeContextMenu();
        if (action === 'prep') {
            onTogglePrepared(spellId);
        } else {
            onRemoveSpell(spellId, spellName);
        }
    };

    return (
        <>
            <div className="spellbook-table-container" data-testid="spellbook-spell-list">
                <table className="spell-table spellbook-table">
                    <thead>
                        <tr>
                            <th className="prepared-col">Prep</th>
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
                            <th className="action-col">Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSpells.map((enrichedSpell) => {
                            const { spell, prepared } = enrichedSpell;
                            return (
                                <Fragment key={spell.id}>
                                    <tr
                                        className={`spell-row ${prepared ? 'prepared-row' : ''} ${expandedSpellId === spell.id ? 'expanded' : ''}`}
                                        data-testid={`spellbook-spell-${spell.id}`}
                                        onClick={() => onRowClick(spell.id)}
                                        onTouchStart={(e) => handleTouchStart(e, enrichedSpell)}
                                        onTouchMove={onTouchMove}
                                        onTouchEnd={onTouchEnd}
                                    >
                                        <td className="prepared-col" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={prepared}
                                                onChange={() => onTogglePrepared(spell.id)}
                                                data-testid="toggle-prepared"
                                                aria-label={`Toggle ${spell.name} prepared status`}
                                            />
                                        </td>
                                        <td className="spell-name">
                                            <div className="spell-name-header">
                                                {spell.name}
                                            </div>
                                        </td>
                                        <td className="level-col">{getLevelText(spell.level)}</td>
                                        <td className="time-col">
                                            <span className="cell-content">
                                                {truncateCastingTime(spell.castingTime)}
                                                {spell.ritual && <span className="badge badge-ritual">R</span>}
                                            </span>
                                        </td>
                                        <td className="range-col">{spell.range}</td>
                                        <td className="duration-col">
                                            <span className="cell-content">
                                                {spell.duration}
                                                {spell.concentration && <span className="badge badge-concentration">C</span>}
                                            </span>
                                        </td>
                                        <td className="school-col">{spell.school}</td>
                                        <td className="components-col"><ComponentBadges spell={spell} /></td>
                                        <td className="source-col">{spell.source}</td>
                                        <td className="action-col" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="btn-remove-small"
                                                onClick={() => onRemoveSpell(spell.id, spell.name)}
                                                data-testid={`btn-remove-spell-${spell.id}`}
                                                aria-label={`Remove ${spell.name}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedSpellId === spell.id && (
                                        <SpellExpansionRow
                                            spell={spell}
                                            colSpan={10}
                                            variant="full"
                                        />
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {contextMenu && (
                <div
                    className="context-menu"
                    style={{
                        position: 'fixed',
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="context-menu-item"
                        onClick={() => handleContextMenuAction('prep', contextMenu.data.spellId, contextMenu.data.spellName)}
                    >
                        {contextMenu.data.prepared ? 'Unprep' : 'Prep'}
                    </button>
                    <button
                        className="context-menu-item context-menu-item-danger"
                        onClick={() => handleContextMenuAction('remove', contextMenu.data.spellId, contextMenu.data.spellName)}
                    >
                        Remove
                    </button>
                </div>
            )}
        </>
    );
}
