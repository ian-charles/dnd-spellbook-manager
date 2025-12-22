import { Spell } from '../types/spell';
import { getLevelText, getLevelTextMobile, getSchoolAbbreviation, truncateCastingTime, formatSpellNameForWrapping, formatDurationWithNonBreakingSpaces } from '../utils/spellFormatters';
import { useSwipe } from '../hooks/useSwipe';
import { SwipeIndicator } from './SwipeIndicator';
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
  isExpanded: _isExpanded,
  onSelectionChange,
  selectedSpellIds,
  onRowClick,
  onCheckboxToggle,
  onTouchStartLongPress,
  onTouchMoveLongPress,
  onTouchEndLongPress,
}: SpellTableRowProps) {
  // Swipe handlers for mobile - either direction toggles selection
  const { swipeState, swipeHandlers } = useSwipe({
    onSwipeRight: () => {
      if (onSelectionChange) {
        onCheckboxToggle(spell.id);
      }
    },
    onSwipeLeft: () => {
      if (onSelectionChange) {
        onCheckboxToggle(spell.id);
      }
    },
  });

  const isCommitted = swipeState.swipeProgress >= 100;
  const showLeftIndicator = swipeState.isSwiping && swipeState.swipeDistance < 0;
  const showRightIndicator = swipeState.isSwiping && swipeState.swipeDistance > 0;
  // Action depends on current selection state, not swipe direction
  const swipeAction = isSelected ? 'deselect' : 'select';

  const rowStyle = {
    transform: swipeState.isSwiping ? `translateX(${swipeState.swipeDistance}px)` : 'translateX(0)',
  };

  return (
    <tr
        onClick={() => onRowClick(spell.id)}
        className={`spell-row swipe-container ${isSelected ? 'selected-row' : ''}`}
        style={rowStyle}
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
          swipeHandlers.onTouchEnd();
        }}
        onTouchCancel={() => {
          swipeHandlers.onTouchCancel();
        }}
      >
        {showLeftIndicator && onSelectionChange && (
          <SwipeIndicator
            action={swipeAction}
            direction="left"
            progress={swipeState.swipeProgress}
            isCommitted={isCommitted}
          />
        )}
        {showRightIndicator && onSelectionChange && (
          <SwipeIndicator
            action={swipeAction}
            direction="right"
            progress={swipeState.swipeProgress}
            isCommitted={isCommitted}
          />
        )}
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
          <span className="level-badge mobile-badge" data-level={spell.level}>{getLevelTextMobile(spell.level)}</span>
          <span className="school-badge mobile-badge" data-school={spell.school}>{getSchoolAbbreviation(spell.school)}</span>
        </td>
        <td className="level-col">
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
            {spell.concentration && <span className="badge badge-concentration">C</span>}
            {formatDurationWithNonBreakingSpaces(spell.duration)}
          </span>
        </td>
        <td className="school-col" data-school={spell.school}>
          {spell.school}
        </td>
        <td className="components-col"><ComponentBadges spell={spell} /></td>
        <td className="classes-col"><ClassBadges classes={spell.classes} /></td>
        <td className="source-col">{spell.source}</td>
      </tr>
  );
}
