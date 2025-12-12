import { SpellSlots } from '../../types/spellbook';
import './SpellSlotsDisplay.css';

interface SpellSlotsDisplayProps {
    slots: SpellSlots;
}

export function SpellSlotsDisplay({ slots }: SpellSlotsDisplayProps) {
    // Filter out spell levels with 0 slots
    const activeSlots = Object.entries(slots)
        .filter(([_, count]) => count > 0)
        .map(([level, count]) => ({
            level: parseInt(level),
            count
        }))
        .sort((a, b) => a.level - b.level);

    if (activeSlots.length === 0) {
        return null;
    }

    return (
        <div className="spell-slots-display">
            {activeSlots.map(({ level, count }) => (
                <div key={level} className="spell-slot-item">
                    <span className="level-badge" data-level={level}>
                        {level}
                    </span>
                    <span className="spell-slot-count">{count}</span>
                </div>
            ))}
        </div>
    );
}
