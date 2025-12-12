import { ChevronUp, ChevronDown } from 'lucide-react';
import { SpellSlots } from '../types/spellbook';
import { MIN_SPELL_SLOTS, MAX_SPELL_SLOTS, STRICT_NUMERIC_REGEX } from '../constants/gameRules';
import './SpellSlotsInput.css';

interface SpellSlotsInputProps {
  value?: SpellSlots;
  onChange: (slots: SpellSlots | undefined) => void;
}

const SPELL_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function SpellSlotsInput({ value, onChange }: SpellSlotsInputProps) {
  const handleSlotChange = (level: number, val: string) => {
    if (val === '' || STRICT_NUMERIC_REGEX.test(val)) {
      const numVal = val === '' ? 0 : parseInt(val);

      if (numVal < MIN_SPELL_SLOTS || numVal > MAX_SPELL_SLOTS) {
        return;
      }

      updateSlots(level, numVal);
    }
  };

  const updateSlots = (level: number, numVal: number) => {
    const newSlots: SpellSlots = {
      level1: value?.level1 ?? 0,
      level2: value?.level2 ?? 0,
      level3: value?.level3 ?? 0,
      level4: value?.level4 ?? 0,
      level5: value?.level5 ?? 0,
      level6: value?.level6 ?? 0,
      level7: value?.level7 ?? 0,
      level8: value?.level8 ?? 0,
      level9: value?.level9 ?? 0,
    };

    newSlots[`level${level}` as keyof SpellSlots] = numVal;

    // Check if all slots are 0 - if so, set to undefined (optional field)
    const allZero = Object.values(newSlots).every(v => v === 0);
    onChange(allZero ? undefined : newSlots);
  };

  const increment = (level: number) => {
    const current = getSlotValue(level);
    if (current < MAX_SPELL_SLOTS) {
      updateSlots(level, current + 1);
    }
  };

  const decrement = (level: number) => {
    const current = getSlotValue(level);
    if (current > MIN_SPELL_SLOTS) {
      updateSlots(level, current - 1);
    }
  };

  const getSlotValue = (level: number): number => {
    return value?.[`level${level}` as keyof SpellSlots] ?? 0;
  };

  return (
    <div className="spell-slots-input">
      <div className="spell-slots-grid">
        {SPELL_LEVELS.map(level => (
          <div key={level} className="spell-slot-item">
            <label htmlFor={`slot-level-${level}`} className="level-badge" data-level={level}>
              {level}
            </label>
            <div className="spell-slot-controls">
              <button
                type="button"
                className="spell-slot-btn spell-slot-btn-up"
                onClick={() => increment(level)}
                disabled={getSlotValue(level) >= MAX_SPELL_SLOTS}
                aria-label={`Increment level ${level} slots`}
              >
                <ChevronUp size={12} />
              </button>
              <input
                type="number"
                id={`slot-level-${level}`}
                value={getSlotValue(level)}
                onChange={(e) => handleSlotChange(level, e.target.value)}
                min={MIN_SPELL_SLOTS}
                max={MAX_SPELL_SLOTS}
                className={`spell-slot-input ${getSlotValue(level) === 0 ? 'zero-value' : ''}`}
                data-testid={`spell-slot-${level}`}
              />
              <button
                type="button"
                className="spell-slot-btn spell-slot-btn-down"
                onClick={() => decrement(level)}
                disabled={getSlotValue(level) <= MIN_SPELL_SLOTS}
                aria-label={`Decrement level ${level} slots`}
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
