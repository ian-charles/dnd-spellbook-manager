import { EnrichedSpell } from '../../types/spellbook';
import { getLevelText, getLevelTextMobile, getSchoolAbbreviation, truncateCastingTime, formatSpellNameForWrapping, formatDurationWithNonBreakingSpaces } from '../../utils/spellFormatters';
import { useSwipe } from '../../hooks/useSwipe';
import { SwipeIndicator } from '../SwipeIndicator';
import { ComponentBadges } from '../SpellBadges';

interface SpellbookSpellRowProps {
  enrichedSpell: EnrichedSpell;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelected: (spellId: string) => void;
  onRowClick: (spellId: string) => void;
  onTouchStartLongPress: (e: React.TouchEvent) => void;
  onTouchMoveLongPress: (e: React.TouchEvent) => void;
  onTouchEndLongPress: () => void;
}

export function SpellbookSpellRow({
  enrichedSpell,
  isSelected,
  isExpanded: _isExpanded,
  onToggleSelected,
  onRowClick,
  onTouchStartLongPress,
  onTouchMoveLongPress,
  onTouchEndLongPress,
}: SpellbookSpellRowProps) {
  const { spell, prepared } = enrichedSpell;

  // Swipe handlers for mobile - either direction toggles selection
  const { swipeState, swipeHandlers } = useSwipe({
    onSwipeRight: () => {
      onToggleSelected(spell.id);
    },
    onSwipeLeft: () => {
      onToggleSelected(spell.id);
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

  const className = `spell-row swipe-container ${prepared ? 'prepared-row' : ''} ${isSelected ? 'selected-row' : ''}`;

  return (
    <tr
        onClick={() => onRowClick(spell.id)}
        className={className}
        style={rowStyle}
        data-testid={`spellbook-spell-${spell.id}`}
        onTouchStart={(e) => {
          onTouchStartLongPress(e);
          swipeHandlers.onTouchStart(e);
        }}
        onTouchMove={(e) => {
          onTouchMoveLongPress(e);
          swipeHandlers.onTouchMove(e);
        }}
        onTouchEnd={() => {
          swipeHandlers.onTouchEnd();
          onTouchEndLongPress();
        }}
        onTouchCancel={() => {
          swipeHandlers.onTouchCancel();
          onTouchEndLongPress();
        }}
      >
        {showLeftIndicator && (
          <SwipeIndicator
            action={swipeAction}
            direction="left"
            progress={swipeState.swipeProgress}
            isCommitted={isCommitted}
          />
        )}
        {showRightIndicator && (
          <SwipeIndicator
            action={swipeAction}
            direction="right"
            progress={swipeState.swipeProgress}
            isCommitted={isCommitted}
          />
        )}
        <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
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
        <td className="source-col">{spell.source}</td>
      </tr>
  );
}
