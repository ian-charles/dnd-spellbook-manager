import { Spell } from '../types/spell';
import { SpellDescription } from './SpellDescription';
import { ComponentBadges, ClassBadges } from './SpellBadges';
import { formatMaterialsWithCosts } from '../utils/spellFormatters';
import './SpellTable.css'; // Reusing existing styles

interface SpellExpansionRowProps {
    spell: Spell;
    colSpan: number;
    variant?: 'full' | 'compact';
}

export function SpellExpansionRow({ spell, colSpan, variant = 'full' }: SpellExpansionRowProps) {
    const getLevelBadgeText = (level: number) => {
        return level === 0 ? 'Cantrip' : `Level ${level}`;
    };

    const capitalizeSchool = (school: string) => {
        return school.charAt(0).toUpperCase() + school.slice(1).toLowerCase();
    };

    return (
        <tr className="spell-expansion-row">
            <td colSpan={colSpan} className="spell-expansion-cell">
                <div className="spell-inline-expansion">
                    {variant === 'full' && (
                        <>
                            <div className="spell-meta">
                                <span className="spell-meta-badge level-badge" data-level={spell.level}>
                                    {getLevelBadgeText(spell.level)}
                                </span>
                                <span className="spell-meta-separator">•</span>
                                <span className="spell-meta-badge school-badge" data-school={spell.school}>
                                    {capitalizeSchool(spell.school)}
                                </span>
                            </div>
                            <div className="spell-expanded-details">
                                <div>
                                    <strong>Casting Time:</strong> {spell.castingTime}
                                    {spell.ritual && <span className="badge badge-ritual">Ritual</span>}
                                </div>
                                <div><strong>Range:</strong> {spell.range}</div>
                                <div>
                                    <strong>Duration:</strong> {spell.duration}
                                    {spell.concentration && <span className="badge badge-concentration">Concentration</span>}
                                </div>
                                <div className="spell-expanded-components">
                                    <strong>Components:</strong>
                                    <div className="expanded-badges-container">
                                        <ComponentBadges spell={spell} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="spell-expanded-description">
                        {spell.materials && (
                            <div
                                className="spell-materials"
                                dangerouslySetInnerHTML={{
                                    __html: `<strong>Material:</strong> ${formatMaterialsWithCosts(spell.materials)}`
                                }}
                            />
                        )}
                        {/* SpellDescription highlights dice notation (e.g., 1d6, 2d8) in spell text */}
                        <SpellDescription text={spell.description} />
                    </div>

                    {spell.higherLevels && (
                        <div className="spell-expanded-higher-levels">
                            {/* SpellDescription highlights dice notation (e.g., 1d6, 2d8) in spell text */}
                            <strong>At Higher Levels:</strong> <SpellDescription text={spell.higherLevels} />
                        </div>
                    )}

                    <div className="spell-expanded-footer">
                        <div className="spell-expanded-classes">
                            <strong>Classes:</strong>
                            <ClassBadges classes={spell.classes} />
                        </div>
                        {variant === 'full' && (
                            <div className="spell-source">{spell.source}</div>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
}
