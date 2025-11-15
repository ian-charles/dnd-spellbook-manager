import { Spell } from '../types/spell';
import { getLevelText, getComponentsWithMaterials, filterClasses } from '../utils/spellFormatters';
import './ExpandableSpellRow.css';

interface ExpandableSpellRowProps {
  spell: Spell;
  isExpanded: boolean;
  colSpan: number;
}

export function ExpandableSpellRow({ spell, isExpanded, colSpan }: ExpandableSpellRowProps) {
  if (!isExpanded) return null;

  return (
    <tr className="spell-expanded-row">
      <td colSpan={colSpan}>
        <div className="spell-expanded-content">
          <div className="spell-expanded-header">
            <h3>{spell.name}</h3>
            <p className="spell-meta">
              {getLevelText(spell.level)} {spell.school}
              {spell.concentration && <span className="badge badge-concentration">Concentration</span>}
              {spell.ritual && <span className="badge badge-ritual">Ritual</span>}
            </p>
          </div>
          <div className="spell-expanded-details">
            <div><strong>Casting Time:</strong> {spell.castingTime}</div>
            <div><strong>Range:</strong> {spell.range}</div>
            <div><strong>Duration:</strong> {spell.duration}</div>
            <div>
              <strong>Components:</strong> {getComponentsWithMaterials(spell)}
            </div>
          </div>
          <div className="spell-expanded-description">
            {spell.description}
          </div>
          {spell.higherLevels && (
            <div className="spell-expanded-higher-levels">
              <strong>At Higher Levels:</strong> {spell.higherLevels}
            </div>
          )}
          <div className="spell-expanded-footer">
            <div><strong>Classes:</strong> {filterClasses(spell.classes).join(', ')}</div>
            <div className="spell-source">{spell.source}</div>
          </div>
        </div>
      </td>
    </tr>
  );
}
