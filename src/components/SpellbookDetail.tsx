import { useState, useEffect } from 'react';
import { useSpellbooks } from '../hooks/useSpellbooks';
import { spellService } from '../services/spell.service';
import { Spell } from '../types/spell';
import './SpellbookDetail.css';

interface SpellbookDetailProps {
  spellbookId: string;
  onBack: () => void;
}

export function SpellbookDetail({ spellbookId, onBack }: SpellbookDetailProps) {
  const { getSpellbook, togglePrepared, removeSpellFromSpellbook } = useSpellbooks();
  const [spellbook, setSpellbook] = useState<any>(null);
  const [enrichedSpells, setEnrichedSpells] = useState<Array<{spell: Spell, prepared: boolean, notes: string}>>([]);

  useEffect(() => {
    loadSpellbook();
  }, [spellbookId]);

  const loadSpellbook = async () => {
    const sb = await getSpellbook(spellbookId);
    if (sb) {
      setSpellbook(sb);

      // Enrich spells with full data
      const enriched = sb.spells.map((spellEntry: any) => {
        const spell = spellService.getSpellById(spellEntry.spellId);
        return {
          spell: spell!,
          prepared: spellEntry.prepared,
          notes: spellEntry.notes || '',
        };
      }).filter((entry: any) => entry.spell !== undefined);

      setEnrichedSpells(enriched);
    }
  };

  const handleTogglePrepared = async (spellId: string) => {
    await togglePrepared(spellbookId, spellId);
    await loadSpellbook();
  };

  const handleRemoveSpell = async (spellId: string, spellName: string) => {
    if (confirm(`Remove "${spellName}" from this spellbook?`)) {
      await removeSpellFromSpellbook(spellbookId, spellId);
      await loadSpellbook();
    }
  };

  if (!spellbook) {
    return (
      <div className="spellbook-detail">
        <p>Loading spellbook...</p>
      </div>
    );
  }

  const preparedCount = enrichedSpells.filter(s => s.prepared).length;

  const getLevelText = (level: number) => {
    if (level === 0) return 'Cantrip';
    return level.toString();
  };

  const getComponentsText = (spell: Spell) => {
    const parts: string[] = [];
    if (spell.components.verbal) parts.push('V');
    if (spell.components.somatic) parts.push('S');
    if (spell.components.material) parts.push('M');
    return parts.join(', ');
  };

  return (
    <div className="spellbook-detail" data-testid="spellbook-detail">
      <div className="spellbook-detail-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Spellbooks
        </button>
        <div>
          <h2 data-testid="spellbook-detail-name">{spellbook.name}</h2>
          <p className="spellbook-stats">
            {enrichedSpells.length} spell{enrichedSpells.length !== 1 ? 's' : ''} · {preparedCount} prepared
          </p>
        </div>
      </div>

      {enrichedSpells.length === 0 ? (
        <div className="spellbook-detail-empty">
          <p>This spellbook is empty.</p>
          <p>Go to the Browse tab to add spells!</p>
        </div>
      ) : (
        <div className="spellbook-table-container" data-testid="spellbook-spell-list">
          <table className="spell-table spellbook-table">
            <thead>
              <tr>
                <th className="prepared-col">Prep</th>
                <th>Spell Name</th>
                <th className="level-col">Level</th>
                <th>School</th>
                <th>Time</th>
                <th>Range</th>
                <th className="components-col">Comp.</th>
                <th>Duration</th>
                <th>Classes</th>
                <th>Source</th>
                <th className="action-col">Remove</th>
              </tr>
            </thead>
            <tbody>
              {enrichedSpells.map(({ spell, prepared }) => (
                <tr
                  key={spell.id}
                  className={`spell-row ${prepared ? 'prepared-row' : ''}`}
                  data-testid={`spellbook-spell-${spell.id}`}
                >
                  <td className="prepared-col">
                    <input
                      type="checkbox"
                      checked={prepared}
                      onChange={() => handleTogglePrepared(spell.id)}
                      data-testid="toggle-prepared"
                      aria-label={`Toggle ${spell.name} prepared status`}
                    />
                  </td>
                  <td className="spell-name">
                    {spell.name}
                    {spell.concentration && <span className="badge badge-concentration">C</span>}
                    {spell.ritual && <span className="badge badge-ritual">R</span>}
                  </td>
                  <td className="level-col">{getLevelText(spell.level)}</td>
                  <td className="school-col">{spell.school}</td>
                  <td>{spell.castingTime}</td>
                  <td>{spell.range}</td>
                  <td className="components-col">{getComponentsText(spell)}</td>
                  <td>{spell.duration}</td>
                  <td className="classes-col">{spell.classes.join(', ')}</td>
                  <td className="source-col">{spell.source}</td>
                  <td className="action-col">
                    <button
                      className="btn-remove-small"
                      onClick={() => handleRemoveSpell(spell.id, spell.name)}
                      data-testid={`btn-remove-spell-${spell.id}`}
                      aria-label={`Remove ${spell.name}`}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
