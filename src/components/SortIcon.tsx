import { memo } from 'react';
import { SortDirection } from '../hooks/useSpellSorting';
import './SortIcon.css';

interface SortIconProps {
  /** The column identifier for this icon */
  column: string;
  /** The currently sorted column identifier */
  currentColumn: string;
  /** The current sort direction ('asc' or 'desc') */
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
