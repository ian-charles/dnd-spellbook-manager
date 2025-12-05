import { Fragment, useRef } from 'react';
import { EnrichedSpell } from '../../types/spellbook';
import { SortIcon } from '../SortIcon';
import { ComponentBadges } from '../SpellBadges';
import { getLevelText, getLevelTextMobile, getSchoolAbbreviation, truncateCastingTime, formatSpellNameForWrapping } from '../../utils/spellFormatters';
import { useLongPress } from '../../hooks/useLongPress';
import { useSwipe } from '../../hooks/useSwipe';
import { SwipeIndicator } from '../SwipeIndicator';
import { SpellExpansionRow } from '../SpellExpansionRow';

import { useSpellbookDetail } from '../../contexts/SpellbookDetailContext';
import { useSpellbooks } from '../../hooks/useSpellbooks';

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
    } = useSpellbookDetail();

    const { togglePrepared, removeSpellFromSpellbook } = useSpellbooks();

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
                        {sortedSpells.map((enrichedSpell) => {
                            const { spell, prepared } = enrichedSpell;
                            const isSelected = selectedSpellIds.has(spell.id);

                            // Swipe handlers for mobile
                            const { swipeState, swipeHandlers } = useSwipe({
                                onSwipeRight: () => {
                                    // Swipe right = Prep spell (only if unprepped)
                                    if (!prepared && spellbook) {
                                        togglePrepared(spellbook.id, spell.id);
                                    }
                                },
                                onSwipeLeft: () => {
                                    if (!spellbook) return;

                                    if (prepared) {
                                        // If prepared, unprep
                                        togglePrepared(spellbook.id, spell.id);
                                    } else {
                                        // If unprepped, remove
                                        removeSpellFromSpellbook(spellbook.id, spell.id);
                                    }
                                },
                            });

                            const isCommitted = swipeState.swipeProgress >= 100;
                            const showLeftIndicator = swipeState.isSwiping && swipeState.swipeDistance < 0;
                            const showRightIndicator = swipeState.isSwiping && swipeState.swipeDistance > 0;

                            // Determine which action to show for left swipe
                            const leftSwipeAction = prepared ? 'unprep' : 'remove';

                            return (
                                <Fragment key={spell.id}>
                                    <tr
                                        className={`spell-row swipe-container ${prepared ? 'prepared-row' : ''} ${isSelected ? 'selected-row' : ''} ${expandedSpellId === spell.id ? 'expanded' : ''}`}
                                        data-testid={`spellbook-spell-${spell.id}`}
                                        onClick={() => onRowClick(spell.id)}
                                        onTouchStart={(e) => {
                                            handleTouchStart(e, enrichedSpell);
                                            swipeHandlers.onTouchStart(e);
                                        }}
                                        onTouchMove={(e) => {
                                            onTouchMove(e);
                                            swipeHandlers.onTouchMove(e);
                                        }}
                                        onTouchEnd={(e) => {
                                            onTouchEnd(e);
                                            swipeHandlers.onTouchEnd(e);
                                        }}
                                        onTouchCancel={(e) => {
                                            swipeHandlers.onTouchCancel(e);
                                        }}
                                    >
                                        {showLeftIndicator && (
                                            <SwipeIndicator
                                                action={leftSwipeAction}
                                                direction="left"
                                                progress={swipeState.swipeProgress}
                                                isCommitted={isCommitted}
                                            />
                                        )}
                                        {showRightIndicator && !prepared && (
                                            <SwipeIndicator
                                                action="prep"
                                                direction="right"
                                                progress={swipeState.swipeProgress}
                                                isCommitted={isCommitted}
                                            />
                                        )}
                                        <td className="prepared-col" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onToggleSelected(spell.id)}
                                                data-testid="toggle-selected"
                                                aria-label={`Select ${spell.name}`}
                                            />
                                        </td>
                                        <td className="spell-name">
                                            <div className="spell-name-header">
                                                {formatSpellNameForWrapping(spell.name)}
                                            </div>
                                            <span className="level-col mobile-badge" data-level={spell.level}>{getLevelTextMobile(spell.level)}</span>
                                            <span className="school-col mobile-badge" data-school={spell.school}>{getSchoolAbbreviation(spell.school)}</span>
                                        </td>
                                        <td className="level-col desktop-only">
                                            <span className="desktop-badge level-badge" data-level={spell.level}>
                                                {getLevelText(spell.level)}
                                            </span>
                                        </td>
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
                                        <td className="school-col desktop-only" data-school={spell.school}>
                                            {spell.school}
                                        </td>
                                        <td className="components-col"><ComponentBadges spell={spell} /></td>
                                        <td className="source-col">{spell.source}</td>
                                    </tr>
                                    {expandedSpellId === spell.id && (
                                        <SpellExpansionRow
                                            spell={spell}
                                            colSpan={9}
                                            variant="full"
                                        />
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
}
