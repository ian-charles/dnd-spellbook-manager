/**
 * Spell Sorting Value Utilities
 *
 * Converts spell casting time, range, and duration strings into numeric values
 * for tactical sorting. Uses D&D 5e gameplay mechanics to prioritize spells
 * by combat utility rather than alphabetical order.
 */

/**
 * Converts a casting time string to a numeric value for sorting.
 * Lower values = faster casting (more tactically useful).
 *
 * Priority Order:
 * 1. Reaction (can interrupt, fastest)
 * 2. Bonus Action (swift, allows combos)
 * 3. 1 Action (standard combat spell)
 * 4. 1 Minute (10 rounds, still in combat)
 * 5. 10 Minutes (post-combat buff)
 * 6. 1 Hour (ritual/preparation)
 * 7. 8 Hours (long ritual)
 * 8. 12 Hours (very long ritual)
 * 9. 24 Hours (extremely long ritual)
 *
 * @param castingTime - The casting time string (e.g., "1 action", "1 reaction", "10 minutes")
 * @returns Numeric value for sorting (lower = faster)
 */
export function getCastingTimeValue(castingTime: string): number {
  const lower = castingTime.toLowerCase();

  // Tactical priority: fastest/most flexible first
  if (lower.includes('reaction')) return 1;
  if (lower.includes('bonus action')) return 2;
  if (lower.includes('1 action')) return 3;

  // Time-based casting (rituals, longer casts)
  if (lower.includes('1 minute')) return 4;
  if (lower.includes('10 minutes')) return 5;
  if (lower.includes('1 hour')) return 6;
  if (lower.includes('8 hours')) return 7;
  if (lower.includes('12 hours')) return 8;
  if (lower.includes('24 hours')) return 9;

  // Unknown/undefined casting times
  return 99;
}

/**
 * Converts a range string to a numeric value (in feet) for sorting.
 * Lower values = shorter range (closer to caster).
 *
 * Special Values:
 * - Self: 0 feet (affects only caster)
 * - Touch: 5 feet (melee range)
 * - Sight: 99999997 (very long, but limited by vision)
 * - Unlimited: 99999998 (infinite range)
 * - Special: 99999999 (undefined/varies)
 *
 * @param range - The range string (e.g., "Self", "Touch", "60 feet", "1 mile")
 * @returns Numeric value in feet for sorting
 */
export function getRangeValue(range: string): number {
  const lower = range.toLowerCase();

  // Special range types
  if (lower === 'self') return 0;
  if (lower === 'touch') return 5;
  if (lower === 'sight') return 99999997;
  if (lower === 'unlimited') return 99999998;
  if (lower === 'special') return 99999999;

  // Parse numeric distance with unit
  // Handles: "30 feet", "30 ft", "30 foot", "30feet", "30ft", "1 mile", "1mi", etc.
  const match = range.match(/(\d+)\s*(feet?|foot|ft|miles?|mile|mi)/i);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    // Convert miles to feet (1 mile = 5280 feet)
    if (unit.startsWith('mi') || unit === 'mile') {
      return value * 5280;
    }

    // Already in feet (handles feet, foot, ft)
    return value;
  }

  // Unknown range types
  return 99999999;
}

/**
 * Converts a duration string to a numeric value (in seconds) for sorting.
 * Lower values = shorter duration.
 *
 * Time Conversions:
 * - 1 round = 6 seconds (D&D 5e standard)
 * - 1 minute = 60 seconds (10 rounds)
 * - 1 hour = 3600 seconds
 * - 1 day = 86400 seconds
 *
 * Special Values:
 * - Instantaneous: 0 seconds (immediate effect, no lingering)
 * - Until dispelled: 99999999 (permanent until dispelled)
 * - Special: 99999998 (undefined/varies)
 *
 * @param duration - The duration string (e.g., "Instantaneous", "1 minute", "Until dispelled")
 * @returns Numeric value in seconds for sorting
 */
export function getDurationValue(duration: string): number {
  const lower = duration.toLowerCase();

  // Instantaneous effects (no duration)
  if (lower.includes('instantaneous')) return 0;

  // Permanent/special durations
  if (lower.includes('until dispelled')) return 99999999;
  if (lower.includes('special')) return 99999998;

  // Extract number and time unit
  // Handles "1 minute", "Up to 10 minutes", "2 hours", etc.
  const match = duration.match(/(\d+)\s*(round|minute|hour|day)/i);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    // Convert to seconds based on unit
    if (unit.startsWith('round')) return value * 6;
    if (unit.startsWith('minute')) return value * 60;
    if (unit.startsWith('hour')) return value * 3600;
    if (unit.startsWith('day')) return value * 86400;
  }

  // Unknown duration types
  return 99999998;
}
