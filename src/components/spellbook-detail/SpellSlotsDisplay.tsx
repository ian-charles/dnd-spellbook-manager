import { SpellSlots } from '../../types/spellbook';
import './SpellSlotsDisplay.css';

interface SpellSlotsDisplayProps {
    slots: SpellSlots;
}

export function SpellSlotsDisplay({ slots }: SpellSlotsDisplayProps) {
    // Filter out spell levels with 0 slots
    const activeSlots = Object.entries(slots)
        .filter(([_, count]) => count > 0)
        .map(([key, count]) => ({
            level: parseInt(key.replace('level', '')),
            count
        }))
        .sort((a, b) => a.level - b.level);

    if (activeSlots.length === 0) {
        return null;
    }

    // Dynamic grid columns: N for active slots (no label column)
    // Grid has 3 rows: header label, level badges, slot counts
    const gridStyle = {
        gridTemplateColumns: `repeat(${activeSlots.length}, min-content)`
    };

    return (
        <div className="spell-slots-display">
            <div className="spell-slots-grid" style={gridStyle}>
                <strong className="spell-slots-header">Spell Slots</strong>
                {activeSlots.map(({ level }) => (
                    <span key={`badge-${level}`} className="level-badge" data-level={level}>
                        {level}
                    </span>
                ))}
                {activeSlots.map(({ level, count }) => (
                    <span key={`count-${level}`} className="spell-slot-count">{count}</span>
                ))}
            </div>
        </div>
    );
}
