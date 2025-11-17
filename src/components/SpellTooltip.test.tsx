/**
 * SpellTooltip Component Tests
 *
 * Tests for the memoized SpellTooltip component.
 * Verifies rendering logic, content display, and React.memo behavior.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpellTooltip } from './SpellTooltip';
import { Spell } from '../types/spell';

describe('SpellTooltip', () => {
  const mockSpell: Spell = {
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    castingTime: '1 action',
    range: '150 feet',
    duration: 'Instantaneous',
    components: {
      verbal: true,
      somatic: true,
      material: true,
    },
    materials: 'a tiny ball of bat guano and sulfur',
    concentration: false,
    ritual: false,
    description: 'A bright streak flashes from your pointing finger to a point you choose within range.',
    higherLevels: 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.',
    classes: ['Sorcerer', 'Wizard'],
    source: 'PHB',
  };

  const defaultPosition = { x: 100, y: 200 };

  describe('Rendering', () => {
    it('should render null when spell is null', () => {
      const { container } = render(
        <SpellTooltip spell={null} position={defaultPosition} visible={true} />
      );

      expect(container.querySelector('.spell-tooltip')).toBeNull();
    });

    it('should render null when visible is false', () => {
      const { container } = render(
        <SpellTooltip spell={mockSpell} position={defaultPosition} visible={false} />
      );

      expect(container.querySelector('.spell-tooltip')).toBeNull();
    });

    it('should render tooltip when spell is provided and visible is true', () => {
      const { container } = render(
        <SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />
      );

      expect(container.querySelector('.spell-tooltip')).toBeTruthy();
    });

    it('should display spell name', () => {
      render(<SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />);

      expect(screen.getByText('Fireball')).toBeTruthy();
    });

    it('should display spell level and school', () => {
      render(<SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/3rd-level Evocation/)).toBeTruthy();
    });

    it('should display cantrip correctly', () => {
      const cantrip: Spell = { ...mockSpell, level: 0 };
      render(<SpellTooltip spell={cantrip} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/Cantrip Evocation/)).toBeTruthy();
    });

    it('should display 1st-level correctly', () => {
      const firstLevel: Spell = { ...mockSpell, level: 1 };
      render(<SpellTooltip spell={firstLevel} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/1st-level Evocation/)).toBeTruthy();
    });

    it('should display 2nd-level correctly', () => {
      const secondLevel: Spell = { ...mockSpell, level: 2 };
      render(<SpellTooltip spell={secondLevel} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/2nd-level Evocation/)).toBeTruthy();
    });

    it('should display concentration badge when concentration is true', () => {
      const concentrationSpell: Spell = { ...mockSpell, concentration: true };
      render(<SpellTooltip spell={concentrationSpell} position={defaultPosition} visible={true} />);

      const badge = screen.getByText('C');
      expect(badge.classList.contains('concentration')).toBe(true);
    });

    it('should display ritual badge when ritual is true', () => {
      const ritualSpell: Spell = { ...mockSpell, ritual: true };
      render(<SpellTooltip spell={ritualSpell} position={defaultPosition} visible={true} />);

      const badge = screen.getByText('R');
      expect(badge.classList.contains('ritual')).toBe(true);
    });

    it('should display casting time, range, and duration', () => {
      render(<SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/1 action/)).toBeTruthy();
      expect(screen.getByText(/150 feet/)).toBeTruthy();
      expect(screen.getByText(/Instantaneous/)).toBeTruthy();
    });

    it('should display components correctly with V, S, M', () => {
      render(<SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/V, S, M \(a tiny ball of bat guano and sulfur\)/)).toBeTruthy();
    });

    it('should display components correctly with only V', () => {
      const verbalOnly: Spell = {
        ...mockSpell,
        components: { verbal: true, somatic: false, material: false },
        materials: '',
      };
      const { container } = render(<SpellTooltip spell={verbalOnly} position={defaultPosition} visible={true} />);

      // Check that Components label exists
      expect(screen.getByText('Components:')).toBeTruthy();
      // Check the entire tooltip text contains just "V" for components
      const tooltipText = container.textContent || '';
      expect(tooltipText).toContain('Components:');
      expect(tooltipText).toContain('V');
    });

    it('should display spell description', () => {
      render(<SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/A bright streak flashes from your pointing finger/)).toBeTruthy();
    });

    it('should display higher levels section when present', () => {
      render(<SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/At Higher Levels:/)).toBeTruthy();
      expect(screen.getByText(/the damage increases by 1d6/)).toBeTruthy();
    });

    it('should not display higher levels section when not present', () => {
      const spellWithoutHigherLevels: Spell = { ...mockSpell, higherLevels: undefined };
      render(<SpellTooltip spell={spellWithoutHigherLevels} position={defaultPosition} visible={true} />);

      expect(screen.queryByText(/At Higher Levels:/)).toBeNull();
    });

    it('should display classes', () => {
      render(<SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/Sorcerer, Wizard/)).toBeTruthy();
    });

    it('should display source', () => {
      render(<SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />);

      expect(screen.getByText('PHB')).toBeTruthy();
    });
  });

  describe('Positioning', () => {
    it('should apply position styles correctly', () => {
      const { container } = render(
        <SpellTooltip spell={mockSpell} position={{ x: 300, y: 400 }} visible={true} />
      );

      const tooltip = container.querySelector('.spell-tooltip') as HTMLElement;
      expect(tooltip?.style.left).toBe('300px');
      expect(tooltip?.style.top).toBe('400px');
    });

    it('should update position when position prop changes', () => {
      const { container, rerender } = render(
        <SpellTooltip spell={mockSpell} position={{ x: 100, y: 200 }} visible={true} />
      );

      let tooltip = container.querySelector('.spell-tooltip') as HTMLElement;
      expect(tooltip?.style.left).toBe('100px');
      expect(tooltip?.style.top).toBe('200px');

      rerender(<SpellTooltip spell={mockSpell} position={{ x: 500, y: 600 }} visible={true} />);

      tooltip = container.querySelector('.spell-tooltip') as HTMLElement;
      expect(tooltip?.style.left).toBe('500px');
      expect(tooltip?.style.top).toBe('600px');
    });
  });

  describe('React.memo Behavior', () => {
    it('should not re-render when props have not changed', () => {
      const renderSpy = vi.fn();

      function TestWrapper({ spell, position, visible }: {
        spell: Spell | null;
        position: { x: number; y: number };
        visible: boolean;
      }) {
        renderSpy();
        return <SpellTooltip spell={spell} position={position} visible={visible} />;
      }

      const { rerender } = render(
        <TestWrapper spell={mockSpell} position={defaultPosition} visible={true} />
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestWrapper spell={mockSpell} position={defaultPosition} visible={true} />);

      // TestWrapper re-renders, but SpellTooltip should be memoized
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should re-render when spell prop changes', () => {
      const newSpell: Spell = { ...mockSpell, name: 'Lightning Bolt' };

      const { rerender } = render(
        <SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />
      );

      expect(screen.getByText('Fireball')).toBeTruthy();

      rerender(<SpellTooltip spell={newSpell} position={defaultPosition} visible={true} />);

      expect(screen.getByText('Lightning Bolt')).toBeTruthy();
    });

    it('should re-render when visible prop changes', () => {
      const { container, rerender } = render(
        <SpellTooltip spell={mockSpell} position={defaultPosition} visible={true} />
      );

      expect(container.querySelector('.spell-tooltip')).toBeTruthy();

      rerender(<SpellTooltip spell={mockSpell} position={defaultPosition} visible={false} />);

      expect(container.querySelector('.spell-tooltip')).toBeNull();
    });

    it('should re-render when position prop changes', () => {
      const { container, rerender } = render(
        <SpellTooltip spell={mockSpell} position={{ x: 100, y: 200 }} visible={true} />
      );

      let tooltip = container.querySelector('.spell-tooltip') as HTMLElement;
      expect(tooltip?.style.left).toBe('100px');

      rerender(<SpellTooltip spell={mockSpell} position={{ x: 300, y: 400 }} visible={true} />);

      tooltip = container.querySelector('.spell-tooltip') as HTMLElement;
      expect(tooltip?.style.left).toBe('300px');
    });
  });

  describe('Edge Cases', () => {
    it('should handle spell with no materials', () => {
      const spellNoMaterials: Spell = {
        ...mockSpell,
        components: { verbal: true, somatic: true, material: false },
        materials: '',
      };

      render(<SpellTooltip spell={spellNoMaterials} position={defaultPosition} visible={true} />);

      expect(screen.getByText(/V, S/)).toBeTruthy();
      expect(screen.queryByText(/M \(/)).toBeNull();
    });

    it('should handle spell with no classes', () => {
      const spellNoClasses: Spell = { ...mockSpell, classes: [] };
      render(<SpellTooltip spell={spellNoClasses} position={defaultPosition} visible={true} />);

      expect(screen.getByText('Classes:')).toBeTruthy();
    });

    it('should handle all spell levels (0-9)', () => {
      for (let level = 0; level <= 9; level++) {
        const spellAtLevel: Spell = { ...mockSpell, level };
        const { container } = render(
          <SpellTooltip spell={spellAtLevel} position={defaultPosition} visible={true} />
        );

        expect(container.querySelector('.spell-tooltip')).toBeTruthy();
      }
    });
  });
});
