import { Fragment } from 'react';
import { Spell } from '../types/spell';
import { getLevelText, getLevelTextMobile, getSchoolAbbreviation, truncateCastingTime, formatSpellNameForWrapping } from '../utils/spellFormatters';
import { SpellExpansionRow } from './SpellExpansionRow';
import { useSwipe } from '../hooks/useSwipe';
import { ComponentBadges, ClassBadges } from './SpellBadges';

interface SpellTableRowProps {
  spell: Spell;
  isSelected: boolean;
  isExpanded: boolean;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  selectedSpellIds: Set<string>;
  onRowClick: (spellId: string) => void;
  onCheckboxToggle: (spellId: string) => void;
  onTouchStartLongPress: (e: React.TouchEvent) => void;
  onTouchMoveLongPress: (e: React.TouchEvent) => void;
  onTouchEndLongPress: (e: React.TouchEvent) => void;
}

export function SpellTableRow({
  spell,
  isSelected,
  isExpanded,
  onSelectionChange,
  selectedSpellIds,
  onRowClick,
  onCheckboxToggle,
  onTouchStartLongPress,
  onTouchMoveLongPress,
  onTouchEndLongPress,
}: SpellTableRowProps) {
  // Swipe handlers for mobile
  const { swipeState, swipeHandlers } = useSwipe({
    onSwipeRight: () => {
      if (onSelectionChange && !isSelected) {
        onCheckboxToggle(spell.id);
      }
    },
    onSwipeLeft: () => {
      if (onSelectionChange && isSelected) {
        onCheckboxToggle(spell.id);
      }
    },
  });

  const isCommitted = swipeState.swipeProgress >= 100;
  const showLeftIndicator = swipeState.isSwiping && swipeState.swipeDistance < 0;
  const showRightIndicator = swipeState.isSwiping && swipeState.swipeDistance > 0;

  const rowStyle = {
    transform: swipeState.isSwiping ? `translateX(${swipeState.swipeDistance}px)` : 'translateX(0)',
  };

  const containerClass = `spell-row swipe-container ${isSelected ? 'selected-row' : ''} ${isExpanded ? 'expanded' : ''} ${
    showLeftIndicator && onSelectionChange ? 'swiping-left' : ''
  } ${showRightIndicator && onSelectionChange ? 'swiping-right' : ''} ${isCommitted ? 'swipe-committed' : ''}`.trim();

  const containerStyle = {
    '--swipe-progress': `${swipeState.swipeProgress}%`,
  } as React.CSSProperties;

  return (
    <Fragment key={spell.id}>
      <tr
        onClick={() => onRowClick(spell.id)}
        className={containerClass}
        style={{ ...rowStyle, ...containerStyle }}
        onTouchStart={(e) => {
          onTouchStartLongPress(e);
          swipeHandlers.onTouchStart(e);
        }}
        onTouchMove={(e) => {
          onTouchMoveLongPress(e);
          swipeHandlers.onTouchMove(e);
        }}
        onTouchEnd={(e) => {
          onTouchEndLongPress(e);
          swipeHandlers.onTouchEnd(e);
        }}
        onTouchCancel={(e) => {
          swipeHandlers.onTouchCancel(e);
        }}
      >
        {onSelectionChange && (
          <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedSpellIds.has(spell.id)}
              onChange={() => onCheckboxToggle(spell.id)}
              data-testid="spell-checkbox"
            />
          </td>
        )}
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
        <td className="classes-col"><ClassBadges classes={spell.classes} /></td>
        <td className="source-col">{spell.source}</td>
      </tr>
      {isExpanded && (
        <SpellExpansionRow
          spell={spell}
          colSpan={onSelectionChange ? 10 : 9}
          variant="full"
        />
      )}
    </Fragment>
  );
}
