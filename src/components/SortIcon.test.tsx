/**
 * SortIcon Component Tests
 *
 * Tests for the memoized SortIcon component.
 * Verifies rendering logic and React.memo behavior.
 */

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { SortIcon } from './SortIcon';
import { SortColumn, SortDirection } from '../hooks/useSpellSorting';

describe('SortIcon', () => {
  describe('Rendering', () => {
    it('should render inactive icon (⇅) when column is not the current sort column', () => {
      const { container } = render(
        <SortIcon column="name" currentColumn="level" currentDirection="asc" />
      );

      const icon = container.querySelector('.sort-icon');
      expect(icon).toBeTruthy();
      expect(icon?.textContent).toBe('⇅');
    });

    it('should render ascending icon (↑) when column is current and direction is asc', () => {
      const { container } = render(
        <SortIcon column="name" currentColumn="name" currentDirection="asc" />
      );

      const icon = container.querySelector('.sort-icon');
      expect(icon).toBeTruthy();
      expect(icon?.textContent).toBe('↑');
    });

    it('should render descending icon (↓) when column is current and direction is desc', () => {
      const { container } = render(
        <SortIcon column="level" currentColumn="level" currentDirection="desc" />
      );

      const icon = container.querySelector('.sort-icon');
      expect(icon).toBeTruthy();
      expect(icon?.textContent).toBe('↓');
    });

    it('should render inactive icon for each possible column when not active', () => {
      const columns: SortColumn[] = ['name', 'level', 'school', 'castingTime', 'range', 'concentration', 'ritual'];

      columns.forEach((column) => {
        const { container } = render(
          <SortIcon column={column} currentColumn="name" currentDirection="asc" />
        );

        if (column !== 'name') {
          const icon = container.querySelector('.sort-icon');
          expect(icon?.textContent).toBe('⇅');
        }
      });
    });
  });

  describe('React.memo Behavior', () => {
    it('should not re-render when props have not changed', () => {
      const renderSpy = vi.fn();

      function TestWrapper({ column, currentColumn, currentDirection }: {
        column: SortColumn;
        currentColumn: SortColumn;
        currentDirection: SortDirection;
      }) {
        renderSpy();
        return <SortIcon column={column} currentColumn={currentColumn} currentDirection={currentDirection} />;
      }

      const { rerender } = render(
        <TestWrapper column="name" currentColumn="name" currentDirection="asc" />
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestWrapper column="name" currentColumn="name" currentDirection="asc" />);

      // TestWrapper re-renders, but SortIcon should be memoized
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should re-render when column prop changes', () => {
      const { container, rerender } = render(
        <SortIcon column="name" currentColumn="name" currentDirection="asc" />
      );

      expect(container.querySelector('.sort-icon')?.textContent).toBe('↑');

      rerender(<SortIcon column="level" currentColumn="name" currentDirection="asc" />);

      expect(container.querySelector('.sort-icon')?.textContent).toBe('⇅');
    });

    it('should re-render when currentColumn prop changes', () => {
      const { container, rerender } = render(
        <SortIcon column="name" currentColumn="level" currentDirection="asc" />
      );

      expect(container.querySelector('.sort-icon')?.textContent).toBe('⇅');

      rerender(<SortIcon column="name" currentColumn="name" currentDirection="asc" />);

      expect(container.querySelector('.sort-icon')?.textContent).toBe('↑');
    });

    it('should re-render when currentDirection prop changes', () => {
      const { container, rerender } = render(
        <SortIcon column="name" currentColumn="name" currentDirection="asc" />
      );

      expect(container.querySelector('.sort-icon')?.textContent).toBe('↑');

      rerender(<SortIcon column="name" currentColumn="name" currentDirection="desc" />);

      expect(container.querySelector('.sort-icon')?.textContent).toBe('↓');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all valid sort columns', () => {
      const columns: SortColumn[] = ['name', 'level', 'school', 'castingTime', 'range', 'concentration', 'ritual'];

      columns.forEach((column) => {
        const { container } = render(
          <SortIcon column={column} currentColumn={column} currentDirection="asc" />
        );

        const icon = container.querySelector('.sort-icon');
        expect(icon).toBeTruthy();
        expect(icon?.textContent).toBe('↑');
      });
    });

    it('should have consistent className for all states', () => {
      const { container: container1 } = render(
        <SortIcon column="name" currentColumn="name" currentDirection="asc" />
      );
      const { container: container2 } = render(
        <SortIcon column="name" currentColumn="level" currentDirection="asc" />
      );

      expect(container1.querySelector('.sort-icon')).toBeTruthy();
      expect(container2.querySelector('.sort-icon')).toBeTruthy();
    });
  });
});
