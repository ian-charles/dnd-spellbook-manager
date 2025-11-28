import { Fragment, useState, useRef, useEffect } from 'react';
import { EnrichedSpell } from '../../types/spellbook';
import { SortColumn, SortDirection } from '../../hooks/useSpellSorting';
import { SortIcon } from '../SortIcon';
import { SpellDescription } from '../SpellDescription';
import { ComponentBadges, ClassBadges } from '../SpellBadges';
import { getLevelText } from '../../utils/spellFormatters';
import { useLongPress } from '../../hooks/useLongPress';

interface SpellbookSpellsTableProps {
    sortedSpells: EnrichedSpell[];
    expandedSpellId: string | null;
    sortColumn: SortColumn;
    sortDirection: SortDirection;
    onSort: (column: SortColumn) => void;
    onRowClick: (spellId: string) => void;
    onTogglePrepared: (spellId: string) => void;
    onRemoveSpell: (spellId: string, spellName: string) => void;
}

export function SpellbookSpellsTable({
    sortedSpells,
    expandedSpellId,
    sortColumn,
    sortDirection,
    onSort,
    onRowClick,
    onTogglePrepared,
    onRemoveSpell,
}: SpellbookSpellsTableProps) {
    // Context menu state for mobile
    const [contextMenu, setContextMenu] = useState<{
        spellId: string;
        spellName: string;
        prepared: boolean;
        x: number;
        y: number;
    } | null>(null);


    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        if (contextMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [contextMenu]);

    // Long-press handlers for mobile context menu
    const pendingSpell = useRef<EnrichedSpell | null>(null);

    const {
        onTouchStart: onTouchStartHook,
        onTouchMove,
        onTouchEnd
    } = useLongPress({
        onLongPress: (e: React.TouchEvent) => {
            if (pendingSpell.current) {
                const touch = e.touches[0];
                setContextMenu({
                    spellId: pendingSpell.current.spell.id,
                    spellName: pendingSpell.current.spell.name,
                    prepared: pendingSpell.current.prepared,
                    x: touch.clientX,
                    y: touch.clientY,
                });
            }
        }
    });

    const handleTouchStart = (e: React.TouchEvent, spell: EnrichedSpell) => {
        pendingSpell.current = spell;
        onTouchStartHook(e);
    };

    const handleContextMenuAction = (action: 'prep' | 'remove', spellId: string, spellName: string) => {
        setContextMenu(null);
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
                                    Time
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
                            <th className="components-col">Comp.</th>
                            <th onClick={() => onSort('school')} className="sortable school-col">
                                <div className="th-content">
                                    School
                                    <SortIcon column="school" currentColumn={sortColumn} currentDirection={sortDirection} />
                                </div>
                            </th>
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
                                                {spell.concentration && <span className="badge badge-concentration">C</span>}
                                                {spell.ritual && <span className="badge badge-ritual">R</span>}
                                            </div>
                                        </td>
                                        <td className="level-col">{getLevelText(spell.level)}</td>
                                        <td className="time-col">{spell.castingTime}</td>
                                        <td className="range-col">{spell.range}</td>
                                        <td className="duration-col">{spell.duration}</td>
                                        <td className="components-col"><ComponentBadges spell={spell} /></td>
                                        <td className="school-col">{spell.school}</td>
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
                                        <tr key={`${spell.id}-expansion`} className="spell-expansion-row">
                                            <td colSpan={10} className="spell-expansion-cell">
                                                <div className="spell-inline-expansion">
                                                    <div className="spell-expanded-description">
                                                        {/* SpellDescription highlights dice notation (e.g., 1d6, 2d8) in spell text */}
                                                        <SpellDescription text={spell.description} />
                                                    </div>
                                                    {spell.higherLevels && (
                                                        <div className="spell-expanded-higher-levels">
                                                            {/* SpellDescription highlights dice notation (e.g., 1d6, 2d8) in spell text */}
                                                            <strong>At Higher Levels:</strong> <SpellDescription text={spell.higherLevels} />
                                                        </div>
                                                    )}
                                                    <div className="spell-expanded-footer">
                                                        <div>
                                                            <strong>Classes:</strong> <ClassBadges classes={spell.classes} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Context Menu for Mobile */}
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
                        onClick={() => handleContextMenuAction('prep', contextMenu.spellId, contextMenu.spellName)}
                    >
                        {contextMenu.prepared ? 'Unprep' : 'Prep'}
                    </button>
                    <button
                        className="context-menu-item context-menu-item-danger"
                        onClick={() => handleContextMenuAction('remove', contextMenu.spellId, contextMenu.spellName)}
                    >
                        Remove
                    </button>
                </div>
            )}
        </>
    );
}
