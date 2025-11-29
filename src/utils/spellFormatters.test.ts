import { describe, it, expect } from 'vitest';
import { getLevelText, getComponentsText, getComponentsWithMaterials, filterClasses } from './spellFormatters';
import { Spell } from '../types/spell';

describe('spellFormatters', () => {
    describe('getLevelText', () => {
        it('should return "Cantrip" for level 0', () => {
            expect(getLevelText(0)).toBe('Cantrip');
        });

        it('should return stringified level for non-zero levels', () => {
            expect(getLevelText(1)).toBe('1');
            expect(getLevelText(9)).toBe('9');
        });
    });

    describe('getComponentsText', () => {
        it('should format V, S, M components', () => {
            const spell = {
                components: { verbal: true, somatic: true, material: true },
            } as Spell;
            expect(getComponentsText(spell)).toBe('V,S,M');
        });

        it('should format partial components', () => {
            const spell = {
                components: { verbal: true, somatic: false, material: false },
            } as Spell;
            expect(getComponentsText(spell)).toBe('V');
        });

        it('should return empty string for no components', () => {
            const spell = {
                components: { verbal: false, somatic: false, material: false },
            } as Spell;
            expect(getComponentsText(spell)).toBe('');
        });
    });

    describe('getComponentsWithMaterials', () => {
        it('should include material description', () => {
            const spell = {
                components: { verbal: true, somatic: true, material: true },
                materials: 'A pinch of sulfur',
            } as Spell;
            expect(getComponentsWithMaterials(spell)).toBe('V, S, M (A pinch of sulfur)');
        });

        it('should format without materials if not present', () => {
            const spell = {
                components: { verbal: true, somatic: true, material: false },
            } as Spell;
            expect(getComponentsWithMaterials(spell)).toBe('V, S');
        });
    });

    describe('filterClasses', () => {
        it('should remove "Ritual Caster"', () => {
            const classes = ['Wizard', 'Ritual Caster', 'Cleric'];
            expect(filterClasses(classes)).toEqual(['Wizard', 'Cleric']);
        });

        it('should be case insensitive', () => {
            const classes = ['Wizard', 'ritual caster'];
            expect(filterClasses(classes)).toEqual(['Wizard']);
        });

        it('should keep other classes', () => {
            const classes = ['Wizard', 'Cleric'];
            expect(filterClasses(classes)).toEqual(['Wizard', 'Cleric']);
        });
    });
});
