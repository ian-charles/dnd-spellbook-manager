import { Spell } from '../types/spell';
import { filterClasses } from '../utils/spellFormatters';

export function ComponentBadges({ spell }: { spell: Spell }) {
    return (
        <div className="component-badges">
            {spell.components.verbal && <span className="component-badge badge-verbal">V</span>}
            {spell.components.somatic && <span className="component-badge badge-somatic">S</span>}
            {spell.components.material && <span className="component-badge badge-material">M</span>}
        </div>
    );
}

export function ClassBadges({ classes }: { classes: string[] }) {
    const filteredClasses = filterClasses(classes);
    return (
        <div className="class-badges">
            {filteredClasses.map((className) => (
                <span key={className} className={`class-badge class-badge-${className.toLowerCase()}`}>
                    {className.substring(0, 3).toUpperCase()}
                </span>
            ))}
        </div>
    );
}
