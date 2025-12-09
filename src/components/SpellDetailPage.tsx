import { useEffect, useState } from 'react';
import { Spell } from '../types/spell';
import { SpellService } from '../services/spell.service';
import { SpellDescription } from './SpellDescription';
import { ComponentBadges, ClassBadges } from './SpellBadges';
import { formatMaterialsWithCosts } from '../utils/spellFormatters';
import { LoadingSpinner } from './LoadingSpinner';
import './SpellDetailPage.css';

interface SpellDetailPageProps {
  spellId: string;
}

export function SpellDetailPage({ spellId }: SpellDetailPageProps) {
  const [spell, setSpell] = useState<Spell | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSpell = async () => {
      try {
        setLoading(true);
        setError(null);
        const spells = await SpellService.loadSpells();
        const foundSpell = spells.find(s => s.id === spellId);

        if (!foundSpell) {
          setError('Spell not found');
        } else {
          setSpell(foundSpell);
        }
      } catch (err) {
        setError('Failed to load spell');
        console.error('Error loading spell:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSpell();
  }, [spellId]);

  const getLevelBadgeText = (level: number) => {
    return level === 0 ? 'Cantrip' : `Level ${level}`;
  };

  const capitalizeSchool = (school: string) => {
    return school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="spell-detail-page-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !spell) {
    return (
      <div className="spell-detail-page-error">
        <h1>{error || 'Spell not found'}</h1>
        <p>
          <a href="#">← Back to Browse Spells</a>
        </p>
      </div>
    );
  }

  return (
    <div className="spell-detail-page">
      <div className="spell-detail-page-content">
        <header className="spell-detail-page-header">
          <h1>{spell.name}</h1>
          <div className="spell-detail-page-meta">
            <span className="spell-meta-badge level-badge" data-level={spell.level}>
              {getLevelBadgeText(spell.level)}
            </span>
            <span className="spell-meta-separator">•</span>
            <span className="spell-meta-badge school-badge" data-school={spell.school}>
              {capitalizeSchool(spell.school)}
            </span>
          </div>
        </header>

        <div className="spell-detail-page-details">
          <div>
            <strong>Casting Time:</strong> {spell.castingTime}
            {spell.ritual && <span className="badge badge-ritual">Ritual</span>}
          </div>
          <div><strong>Range:</strong> {spell.range}</div>
          <div>
            <strong>Duration:</strong> {spell.duration}
            {spell.concentration && <span className="badge badge-concentration">Concentration</span>}
          </div>
          <div className="spell-detail-page-components">
            <strong>Components:</strong>
            <div className="detail-badges-container">
              <ComponentBadges spell={spell} />
            </div>
          </div>
        </div>

        <div className="spell-detail-page-description">
          {spell.materials && (
            <div
              className="spell-materials"
              dangerouslySetInnerHTML={{
                __html: `<strong>Material:</strong> ${formatMaterialsWithCosts(spell.materials)}`
              }}
            />
          )}
          <SpellDescription text={spell.description} />
        </div>

        {spell.higherLevels && (
          <div className="spell-detail-page-higher-levels">
            <strong>At Higher Levels:</strong> <SpellDescription text={spell.higherLevels} />
          </div>
        )}

        <div className="spell-detail-page-footer">
          <div className="spell-detail-page-classes">
            <strong>Classes:</strong>
            <ClassBadges classes={spell.classes} />
          </div>
          <div className="spell-source">{spell.source}</div>
        </div>

        <div className="spell-detail-page-nav">
          <a href="#">← Back to Browse Spells</a>
        </div>
      </div>
    </div>
  );
}
