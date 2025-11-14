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
        <div className="spellbook-spell-list" data-testid="spellbook-spell-list">
          {enrichedSpells.map(({ spell, prepared }) => (
            <div
              key={spell.id}
              className={`spellbook-spell-item ${prepared ? 'prepared' : ''}`}
              data-testid={`spellbook-spell-${spell.id}`}
            >
              <div className="spell-item-checkbox">
                <input
                  type="checkbox"
                  checked={prepared}
                  onChange={() => handleTogglePrepared(spell.id)}
                  data-testid="toggle-prepared"
                  aria-label={`Toggle ${spell.name} prepared status`}
                />
              </div>
              <div className="spell-item-content">
                <div className="spell-item-header">
                  <h3>{spell.name}</h3>
                  <div className="spell-item-badges">
                    {spell.concentration && <span className="badge badge-concentration">C</span>}
                    {spell.ritual && <span className="badge badge-ritual">R</span>}
                  </div>
                </div>
                <div className="spell-item-info">
                  <span className="spell-level">
                    {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
                  </span>
                  <span className="spell-separator">·</span>
                  <span className="spell-school">{spell.school}</span>
                  <span className="spell-separator">·</span>
                  <span>{spell.castingTime}</span>
                  <span className="spell-separator">·</span>
                  <span>{spell.range}</span>
                </div>
                <div className="spell-item-description">
                  {spell.description.substring(0, 200)}
                  {spell.description.length > 200 ? '...' : ''}
                </div>
              </div>
              <div className="spell-item-actions">
                <button
                  className="btn-remove"
                  onClick={() => handleRemoveSpell(spell.id, spell.name)}
                  data-testid={`btn-remove-spell-${spell.id}`}
                  aria-label={`Remove ${spell.name}`}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
