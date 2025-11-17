import { memo } from 'react';
import { SortColumn, SortDirection } from '../hooks/useSpellSorting';
import './SortIcon.css';

interface SortIconProps {
  column: SortColumn;
  currentColumn: SortColumn;
  currentDirection: SortDirection;
}

/**
 * Icon component for sortable table headers.
 * Shows ⇅ for inactive columns and ↑/↓ for active sort direction.
 *
 * Memoized to prevent unnecessary re-renders when parent re-renders
 * but props haven't changed.
 */
export const SortIcon = memo(function SortIcon({ column, currentColumn, currentDirection }: SortIconProps) {
  if (currentColumn !== column) {
    return <span className="sort-icon">⇅</span>;
  }
  return <span className="sort-icon">{currentDirection === 'asc' ? '↑' : '↓'}</span>;
});
