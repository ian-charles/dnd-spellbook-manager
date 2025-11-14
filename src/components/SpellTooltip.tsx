import { Spell } from '../types/spell';
import './SpellTooltip.css';

interface SpellTooltipProps {
  spell: Spell | null;
  position: { x: number; y: number };
  visible: boolean;
}

export function SpellTooltip({ spell, position, visible }: SpellTooltipProps) {
  if (!spell || !visible) {
    return null;
  }

  const getLevelText = (level: number) => {
    if (level === 0) return 'Cantrip';
    const suffix = level === 1 ? 'st' : level === 2 ? 'nd' : level === 3 ? 'rd' : 'th';
    return `${level}${suffix}-level`;
  };

  return (
    <div
      className="spell-tooltip"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="tooltip-header">
        <h3 className="tooltip-title">
          {spell.name}
          {spell.concentration && <span className="tooltip-badge concentration">C</span>}
          {spell.ritual && <span className="tooltip-badge ritual">R</span>}
        </h3>
        <p className="tooltip-subtitle">
          {getLevelText(spell.level)} {spell.school}
        </p>
      </div>

      <div className="tooltip-meta">
        <div className="tooltip-meta-item">
          <strong>Casting Time:</strong> {spell.castingTime}
        </div>
        <div className="tooltip-meta-item">
          <strong>Range:</strong> {spell.range}
        </div>
        <div className="tooltip-meta-item">
          <strong>Duration:</strong> {spell.duration}
        </div>
        <div className="tooltip-meta-item">
          <strong>Components:</strong>{' '}
          {[
            spell.components.verbal && 'V',
            spell.components.somatic && 'S',
            spell.components.material && `M (${spell.materials})`
          ].filter(Boolean).join(', ')}
        </div>
      </div>

      <div className="tooltip-description">
        {spell.description}
      </div>

      {spell.higherLevels && (
        <div className="tooltip-higher-levels">
          <strong>At Higher Levels:</strong> {spell.higherLevels}
        </div>
      )}

      <div className="tooltip-footer">
        <div className="tooltip-classes">
          <strong>Classes:</strong> {spell.classes.join(', ')}
        </div>
        <div className="tooltip-source">{spell.source}</div>
      </div>
    </div>
  );
}
