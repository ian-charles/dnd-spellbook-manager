import { Fragment } from 'react';
import { EnrichedSpell } from '../../types/spellbook';
import { getLevelText, getLevelTextMobile, getSchoolAbbreviation, truncateCastingTime, formatSpellNameForWrapping } from '../../utils/spellFormatters';
import { useSwipe } from '../../hooks/useSwipe';
import { SpellExpansionRow } from '../SpellExpansionRow';
import { ComponentBadges } from '../SpellBadges';

interface SpellbookSpellRowProps {
  enrichedSpell: EnrichedSpell;
  isSelected: boolean;
  isExpanded: boolean;
  spellbookId: string;
  onToggleSelected: (spellId: string) => void;
  onRowClick: (spellId: string) => void;
  onTogglePrepared: (spellbookId: string, spellId: string) => void;
  onRemoveSpell: (spellbookId: string, spellId: string) => void;
  onTouchStartLongPress: (e: React.TouchEvent) => void;
  onTouchMoveLongPress: (e: React.TouchEvent) => void;
  onTouchEndLongPress: (e: React.TouchEvent) => void;
}

export function SpellbookSpellRow({
  enrichedSpell,
  isSelected,
  isExpanded,
  spellbookId,
  onToggleSelected,
  onRowClick,
  onTogglePrepared,
  onRemoveSpell,
  onTouchStartLongPress,
  onTouchMoveLongPress,
  onTouchEndLongPress,
}: SpellbookSpellRowProps) {
  const { spell, prepared } = enrichedSpell;

  // Swipe handlers for mobile
  const { swipeState, swipeHandlers } = useSwipe({
    onSwipeRight: () => {
      // Swipe right = Prep spell (only if unprepped)
      if (!prepared) {
        onTogglePrepared(spellbookId, spell.id);
      }
    },
    onSwipeLeft: () => {
      if (prepared) {
        // If prepared, unprep
        onTogglePrepared(spellbookId, spell.id);
      } else {
        // If unprepped, remove
        onRemoveSpell(spellbookId, spell.id);
      }
    },
  });

  const isCommitted = swipeState.swipeProgress >= 100;
  const showLeftIndicator = swipeState.isSwiping && swipeState.swipeDistance < 0;
  const showRightIndicator = swipeState.isSwiping && swipeState.swipeDistance > 0;

  // Determine which action to show for left swipe
  const leftSwipeAction = prepared ? 'unprep' : 'remove';

  const rowStyle = {
    transform: swipeState.isSwiping ? `translateX(${swipeState.swipeDistance}px)` : 'translateX(0)',
  };

  const containerClass = `spell-row swipe-container ${prepared ? 'prepared-row' : ''} ${isSelected ? 'selected-row' : ''} ${isExpanded ? 'expanded' : ''} ${
    showLeftIndicator ? `swiping-left swipe-action-${leftSwipeAction}` : ''
  } ${showRightIndicator && !prepared ? 'swiping-right swipe-action-prep' : ''} ${isCommitted ? 'swipe-committed' : ''}`.trim();

  const containerStyle = {
    '--swipe-progress': `${swipeState.swipeProgress}%`,
  } as React.CSSProperties;

  return (
    <Fragment key={spell.id}>
      <tr
        className={containerClass}
        data-testid={`spellbook-spell-${spell.id}`}
        style={{ ...rowStyle, ...containerStyle }}
        onClick={() => onRowClick(spell.id)}
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
      {isExpanded && (
        <SpellExpansionRow
          spell={spell}
          colSpan={9}
          variant="full"
        />
      )}
    </Fragment>
  );
}
