import { Spell } from '../types/spell';
import './SpellList.css';

interface SpellListProps {
  spells: Spell[];
  onSpellClick?: (spell: Spell) => void;
  onAddToSpellbook?: (spellId: string) => void;
}

export function SpellList({ spells, onSpellClick, onAddToSpellbook }: SpellListProps) {
  const getLevelText = (level: number) => {
    if (level === 0) return 'Cantrip';
    return `Level ${level}`;
  };

  const getComponentsText = (spell: Spell) => {
    const parts: string[] = [];
    if (spell.components.verbal) parts.push('V');
    if (spell.components.somatic) parts.push('S');
    if (spell.components.material) parts.push('M');
    return parts.join(', ');
  };

  if (spells.length === 0) {
    return (
      <div className="spell-list-empty">
        <p>No spells found matching your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="spell-list">
      {spells.map((spell) => (
        <div
          key={spell.id}
          className="spell-card"
          onClick={() => onSpellClick?.(spell)}
        >
          <div className="spell-card-header">
            <h3 className="spell-name">{spell.name}</h3>
            <span className="spell-level">{getLevelText(spell.level)}</span>
          </div>

          <div className="spell-meta">
            <span className="spell-school">{spell.school}</span>
            {spell.concentration && <span className="spell-tag">Concentration</span>}
            {spell.ritual && <span className="spell-tag">Ritual</span>}
          </div>

          <div className="spell-details">
            <div className="spell-detail">
              <strong>Casting Time:</strong> {spell.castingTime}
            </div>
            <div className="spell-detail">
              <strong>Range:</strong> {spell.range}
            </div>
            <div className="spell-detail">
              <strong>Components:</strong> {getComponentsText(spell)}
            </div>
            <div className="spell-detail">
              <strong>Duration:</strong> {spell.duration}
            </div>
          </div>

          <div className="spell-classes">
            <strong>Classes:</strong> {spell.classes.join(', ')}
          </div>

          <div className="spell-source">
            <strong>Source:</strong> {spell.source}
          </div>

          {onAddToSpellbook && (
            <button
              className="btn-add-spell"
              onClick={(e) => {
                e.stopPropagation();
                onAddToSpellbook(spell.id);
              }}
            >
              Add to Spellbook
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
