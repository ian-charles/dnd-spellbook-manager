/**
 * Spell Formatters Utility Tests
 *
 * Testing Strategy:
 * - Unit tests for pure utility functions.
 * - Verifies output for various input scenarios (edge cases, typical usage).
 * - Tests formatting of spell levels, components, and class lists.
 */
import { describe, it, expect } from 'vitest';
import { getLevelText, getComponentsText, getComponentsWithMaterials, filterClasses, truncateCastingTime, formatMaterialsWithCosts } from './spellFormatters';
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

    describe('truncateCastingTime', () => {
        it('should return unchanged text when no comma present', () => {
            expect(truncateCastingTime('1 action')).toBe('1 action');
            expect(truncateCastingTime('1 bonus action')).toBe('1 bonus action');
            expect(truncateCastingTime('1 minute')).toBe('1 minute');
        });

        it('should truncate at first comma for reaction spells', () => {
            expect(truncateCastingTime('1 reaction, which you take when you see a creature within 60 feet of you casting a spell'))
                .toBe('1 reaction');
            expect(truncateCastingTime('1 reaction, which you take in response to being damaged by a creature within 60 feet of you that you can see'))
                .toBe('1 reaction');
        });

        it('should handle empty string', () => {
            expect(truncateCastingTime('')).toBe('');
        });
    });

    describe('formatMaterialsWithCosts', () => {
        it('should normalize costs without spaces to include space', () => {
            expect(formatMaterialsWithCosts('Gold dust worth at least 25gp'))
                .toBe('Gold dust worth at least <strong class="material-cost">25 gp</strong>');
        });

        it('should keep costs with spaces unchanged', () => {
            expect(formatMaterialsWithCosts('A miniature platinum sword worth 250 gp'))
                .toBe('A miniature platinum sword worth <strong class="material-cost">250 gp</strong>');
        });

        it('should handle costs with commas', () => {
            expect(formatMaterialsWithCosts('A diamond worth at least 1,000gp'))
                .toBe('A diamond worth at least <strong class="material-cost">1,000 gp</strong>');
            expect(formatMaterialsWithCosts('Diamonds worth at least 25,000 gp'))
                .toBe('Diamonds worth at least <strong class="material-cost">25,000 gp</strong>');
        });

        it('should handle multiple costs in one string', () => {
            expect(formatMaterialsWithCosts('One jacinth worth at least 1,000gp and one bar of silver worth at least 100gp'))
                .toBe('One jacinth worth at least <strong class="material-cost">1,000 gp</strong> and one bar of silver worth at least <strong class="material-cost">100 gp</strong>');
        });

        it('should be case insensitive', () => {
            expect(formatMaterialsWithCosts('Ruby dust worth 50 GP'))
                .toBe('Ruby dust worth <strong class="material-cost">50 gp</strong>');
            expect(formatMaterialsWithCosts('Jade dust worth 25gp'))
                .toBe('Jade dust worth <strong class="material-cost">25 gp</strong>');
        });

        it('should handle text without costs', () => {
            expect(formatMaterialsWithCosts('A sprig of mistletoe'))
                .toBe('A sprig of mistletoe');
        });
    });
});
