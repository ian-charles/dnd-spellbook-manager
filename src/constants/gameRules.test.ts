/**
 * @file gameRules.test.ts
 * @description Unit tests for game rule constants.
 *
 * Testing Strategy:
 * - Verify values of critical game constants (spell levels, modifiers, DCs).
 * - Verify default spellcasting ability.
 * - Verify regex patterns for validation.
 */

import { describe, it, expect } from 'vitest';
import {
    MIN_SPELL_LEVEL,
    MAX_SPELL_LEVEL,
    MIN_ATTACK_MODIFIER,
    MAX_ATTACK_MODIFIER,
    MIN_SAVE_DC,
    MAX_SAVE_DC,
    DEFAULT_SPELLCASTING_ABILITY,
    STRICT_NUMERIC_REGEX
} from './gameRules';

describe('Game Rules Constants', () => {
    it('has correct spell level ranges', () => {
        expect(MIN_SPELL_LEVEL, 'Min spell level should be 0').toBe(0);
        expect(MAX_SPELL_LEVEL, 'Max spell level should be 9').toBe(9);
    });

    it('has correct modifier ranges', () => {
        expect(MIN_ATTACK_MODIFIER, 'Min attack modifier should be 0').toBe(0);
        expect(MAX_ATTACK_MODIFIER, 'Max attack modifier should be 18').toBe(18);
    });

    it('has correct save DC ranges', () => {
        expect(MIN_SAVE_DC, 'Min save DC should be 8').toBe(8);
        expect(MAX_SAVE_DC, 'Max save DC should be 26').toBe(26);
    });

    it('has correct default spellcasting ability', () => {
        expect(DEFAULT_SPELLCASTING_ABILITY, 'Default ability should be INT').toBe('INT');
    });

    it('validates numeric strings correctly with STRICT_NUMERIC_REGEX', () => {
        expect(STRICT_NUMERIC_REGEX.test('123'), 'Should match positive integers').toBe(true);
        expect(STRICT_NUMERIC_REGEX.test('0'), 'Should match zero').toBe(true);

        expect(STRICT_NUMERIC_REGEX.test('12abc'), 'Should not match alphanumeric').toBe(false);
        expect(STRICT_NUMERIC_REGEX.test('abc12'), 'Should not match alphanumeric').toBe(false);
        expect(STRICT_NUMERIC_REGEX.test('-5'), 'Should not match negative numbers').toBe(false);
        expect(STRICT_NUMERIC_REGEX.test('12.5'), 'Should not match decimals').toBe(false);
        expect(STRICT_NUMERIC_REGEX.test(''), 'Should not match empty string').toBe(false);
    });
});
