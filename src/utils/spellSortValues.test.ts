/**
 * Unit tests for spell sorting value extraction utilities
 *
 * Tests the parsing and conversion of casting time, range, and duration
 * strings into numeric values for tactical sorting.
 */

import { describe, it, expect } from 'vitest';
import { getCastingTimeValue, getRangeValue, getDurationValue } from './spellSortValues';

describe('spellSortValues', () => {
  describe('getCastingTimeValue', () => {
    describe('tactical speed ordering', () => {
      it('should prioritize reaction as fastest', () => {
        expect(getCastingTimeValue('1 reaction')).toBe(1);
        expect(getCastingTimeValue('1 reaction, which you take when you see a creature within 60 feet of you casting a spell')).toBe(1);
        expect(getCastingTimeValue('1 reaction, which you take in response to being damaged by a creature within 60 feet of you that you can see')).toBe(1);
      });

      it('should prioritize bonus action as second fastest', () => {
        expect(getCastingTimeValue('1 bonus action')).toBe(2);
      });

      it('should treat 1 action as standard speed', () => {
        expect(getCastingTimeValue('1 action')).toBe(3);
      });

      it('should handle time-based casting times in order', () => {
        expect(getCastingTimeValue('1 minute')).toBe(4);
        expect(getCastingTimeValue('10 minutes')).toBe(5);
        expect(getCastingTimeValue('1 hour')).toBe(6);
        expect(getCastingTimeValue('8 hours')).toBe(7);
        expect(getCastingTimeValue('12 hours')).toBe(8);
        expect(getCastingTimeValue('24 hours')).toBe(9);
      });

      it('should be case insensitive', () => {
        expect(getCastingTimeValue('1 REACTION')).toBe(1);
        expect(getCastingTimeValue('1 Bonus Action')).toBe(2);
        expect(getCastingTimeValue('1 ACTION')).toBe(3);
      });

      it('should handle unknown casting times', () => {
        expect(getCastingTimeValue('unknown')).toBe(99);
        expect(getCastingTimeValue('')).toBe(99);
      });
    });

    describe('tactical ordering verification', () => {
      it('should order reaction < bonus action < action', () => {
        const reaction = getCastingTimeValue('1 reaction');
        const bonus = getCastingTimeValue('1 bonus action');
        const action = getCastingTimeValue('1 action');

        expect(reaction).toBeLessThan(bonus);
        expect(bonus).toBeLessThan(action);
      });

      it('should order combat speeds < ritual speeds', () => {
        const action = getCastingTimeValue('1 action');
        const minute = getCastingTimeValue('1 minute');
        const hour = getCastingTimeValue('1 hour');

        expect(action).toBeLessThan(minute);
        expect(minute).toBeLessThan(hour);
      });
    });
  });

  describe('getRangeValue', () => {
    describe('distance conversion', () => {
      it('should convert Self to 0 feet', () => {
        expect(getRangeValue('Self')).toBe(0);
        expect(getRangeValue('self')).toBe(0);
      });

      it('should convert Touch to 5 feet', () => {
        expect(getRangeValue('Touch')).toBe(5);
        expect(getRangeValue('touch')).toBe(5);
      });

      it('should parse feet distances', () => {
        expect(getRangeValue('10 feet')).toBe(10);
        expect(getRangeValue('30 feet')).toBe(30);
        expect(getRangeValue('60 feet')).toBe(60);
        expect(getRangeValue('90 feet')).toBe(90);
        expect(getRangeValue('120 feet')).toBe(120);
        expect(getRangeValue('150 feet')).toBe(150);
        expect(getRangeValue('300 feet')).toBe(300);
        expect(getRangeValue('500 feet')).toBe(500);
      });

      it('should convert miles to feet', () => {
        expect(getRangeValue('1 mile')).toBe(5280);
        expect(getRangeValue('500 miles')).toBe(2640000);
      });

      it('should handle special range values', () => {
        expect(getRangeValue('Sight')).toBe(99999997);
        expect(getRangeValue('Unlimited')).toBe(99999998);
        expect(getRangeValue('Special')).toBe(99999999);
      });

      it('should be case insensitive', () => {
        expect(getRangeValue('SELF')).toBe(0);
        expect(getRangeValue('TOUCH')).toBe(5);
        expect(getRangeValue('30 FEET')).toBe(30);
      });

      it('should handle various foot formats', () => {
        expect(getRangeValue('30 ft')).toBe(30);
        expect(getRangeValue('30 foot')).toBe(30);
        expect(getRangeValue('30ft')).toBe(30);
      });

      it('should handle various mile formats', () => {
        expect(getRangeValue('1 mi')).toBe(5280);
        expect(getRangeValue('1 mile')).toBe(5280);
        expect(getRangeValue('1mi')).toBe(5280);
      });

      it('should handle unknown ranges', () => {
        expect(getRangeValue('unknown')).toBe(99999999);
        expect(getRangeValue('')).toBe(99999999);
      });
    });

    describe('tactical distance ordering', () => {
      it('should order Self < Touch < short range', () => {
        const self = getRangeValue('Self');
        const touch = getRangeValue('Touch');
        const ten = getRangeValue('10 feet');

        expect(self).toBeLessThan(touch);
        expect(touch).toBeLessThan(ten);
      });

      it('should order feet < miles', () => {
        const feet = getRangeValue('500 feet');
        const mile = getRangeValue('1 mile');

        expect(feet).toBeLessThan(mile);
      });

      it('should order measurable < special values', () => {
        const miles = getRangeValue('500 miles');
        const sight = getRangeValue('Sight');
        const unlimited = getRangeValue('Unlimited');

        expect(miles).toBeLessThan(sight);
        expect(sight).toBeLessThan(unlimited);
      });
    });
  });

  describe('getDurationValue', () => {
    describe('time conversion to seconds', () => {
      it('should convert Instantaneous to 0 seconds', () => {
        expect(getDurationValue('Instantaneous')).toBe(0);
        expect(getDurationValue('instantaneous')).toBe(0);
      });

      it('should convert rounds to seconds (6 seconds per round)', () => {
        expect(getDurationValue('1 round')).toBe(6);
        expect(getDurationValue('Up to 1 round')).toBe(6);
      });

      it('should convert minutes to seconds', () => {
        expect(getDurationValue('1 minute')).toBe(60);
        expect(getDurationValue('10 minutes')).toBe(600);
        expect(getDurationValue('Up to 1 minute')).toBe(60);
        expect(getDurationValue('Up to 10 minutes')).toBe(600);
      });

      it('should convert hours to seconds', () => {
        expect(getDurationValue('1 hour')).toBe(3600);
        expect(getDurationValue('2 hours')).toBe(7200);
        expect(getDurationValue('8 hours')).toBe(28800);
        expect(getDurationValue('24 hours')).toBe(86400);
        expect(getDurationValue('Up to 1 hour')).toBe(3600);
        expect(getDurationValue('Up to 2 hours')).toBe(7200);
        expect(getDurationValue('Up to 8 hours')).toBe(28800);
        expect(getDurationValue('Up to 24 hours')).toBe(86400);
      });

      it('should convert days to seconds', () => {
        expect(getDurationValue('7 days')).toBe(604800);
        expect(getDurationValue('10 days')).toBe(864000);
        expect(getDurationValue('30 days')).toBe(2592000);
      });

      it('should handle special duration values', () => {
        expect(getDurationValue('Until dispelled')).toBe(99999999);
        expect(getDurationValue('Until dispelled or triggered')).toBe(99999999);
        expect(getDurationValue('Special')).toBe(99999998);
      });

      it('should be case insensitive', () => {
        expect(getDurationValue('INSTANTANEOUS')).toBe(0);
        expect(getDurationValue('1 MINUTE')).toBe(60);
        expect(getDurationValue('1 HOUR')).toBe(3600);
      });

      it('should handle unknown durations', () => {
        expect(getDurationValue('unknown')).toBe(99999998);
        expect(getDurationValue('')).toBe(99999998);
      });
    });

    describe('duration ordering', () => {
      it('should order Instantaneous < timed durations', () => {
        const instant = getDurationValue('Instantaneous');
        const round = getDurationValue('1 round');
        const minute = getDurationValue('1 minute');

        expect(instant).toBeLessThan(round);
        expect(round).toBeLessThan(minute);
      });

      it('should order short durations < long durations', () => {
        const minute = getDurationValue('1 minute');
        const hour = getDurationValue('1 hour');
        const day = getDurationValue('7 days');

        expect(minute).toBeLessThan(hour);
        expect(hour).toBeLessThan(day);
      });

      it('should order timed durations < permanent', () => {
        const days = getDurationValue('30 days');
        const dispelled = getDurationValue('Until dispelled');

        expect(days).toBeLessThan(dispelled);
      });

      it('should treat "Up to X" same as "X"', () => {
        expect(getDurationValue('1 minute')).toBe(getDurationValue('Up to 1 minute'));
        expect(getDurationValue('1 hour')).toBe(getDurationValue('Up to 1 hour'));
        expect(getDurationValue('8 hours')).toBe(getDurationValue('Up to 8 hours'));
      });
    });
  });
});
