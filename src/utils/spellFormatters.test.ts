/**
 * Spell Formatters Utility Tests
 *
 * Testing Strategy:
 * - Unit tests for pure utility functions.
 * - Verifies output for various input scenarios (edge cases, typical usage).
 * - Tests formatting of spell levels, components, and class lists.
 */
import { describe, it, expect } from 'vitest';
import { getLevelText, getComponentsText, getComponentsWithMaterials, filterClasses } from './spellFormatters';
import { Spell } from '../types/spell';

describe('spellFormatters', () => {
    describe('getLevelText', () => {
        it('should return "Cantrip" for level 0', () => {
            expect(getLevelText(0), 'Level 0 should be "Cantrip"').toBe('Cantrip');
        });

        it('should return stringified level for non-zero levels', () => {
            expect(getLevelText(1), 'Level 1 should be "1"').toBe('1');
            expect(getLevelText(9), 'Level 9 should be "9"').toBe('9');
        });
    });

    describe('getComponentsText', () => {
        it('should format V, S, M components', () => {
            const spell = {
                components: { verbal: true, somatic: true, material: true },
            } as Spell;
            expect(getComponentsText(spell), 'Should format all components').toBe('V,S,M');
        });

        it('should format partial components', () => {
            const spell = {
                components: { verbal: true, somatic: false, material: false },
            } as Spell;
            expect(getComponentsText(spell), 'Should format only verbal component').toBe('V');
        });

        it('should return empty string for no components', () => {
            const spell = {
                components: { verbal: false, somatic: false, material: false },
            } as Spell;
            expect(getComponentsText(spell), 'Should return empty string').toBe('');
        });
    });

    describe('getComponentsWithMaterials', () => {
        it('should include material description', () => {
            const spell = {
                components: { verbal: true, somatic: true, material: true },
                materials: 'A pinch of sulfur',
            } as Spell;
            expect(getComponentsWithMaterials(spell), 'Should include materials in parentheses').toBe('V, S, M (A pinch of sulfur)');
        });

        it('should format without materials if not present', () => {
            const spell = {
                components: { verbal: true, somatic: true, material: false },
            } as Spell;
            expect(getComponentsWithMaterials(spell), 'Should not include parentheses if no materials').toBe('V, S');
        });
    });

    describe('filterClasses', () => {
        it('should remove "Ritual Caster"', () => {
            const classes = ['Wizard', 'Ritual Caster', 'Cleric'];
            expect(filterClasses(classes), 'Should remove "Ritual Caster"').toEqual(['Wizard', 'Cleric']);
        });

        it('should be case insensitive', () => {
            const classes = ['Wizard', 'ritual caster'];
            expect(filterClasses(classes), 'Should remove "ritual caster" (case insensitive)').toEqual(['Wizard']);
        });

        it('should keep other classes', () => {
            const classes = ['Wizard', 'Cleric'];
            expect(filterClasses(classes), 'Should keep other classes').toEqual(['Wizard', 'Cleric']);
        });
    });
});
