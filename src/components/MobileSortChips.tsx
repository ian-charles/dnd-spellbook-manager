import { memo } from 'react';
import { SortColumn, SortDirection } from '../hooks/useSpellSorting';
import './MobileSortChips.css';

interface MobileSortChipsProps {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
}

const SORT_OPTIONS: { column: SortColumn; label: string }[] = [
  { column: 'name', label: 'Name' },
  { column: 'level', label: 'Level' },
  { column: 'school', label: 'School' },
];

/**
 * Horizontal chip bar for sorting spells on mobile.
 * Hidden on tablet/desktop where table headers handle sorting.
 */
export const MobileSortChips = memo(function MobileSortChips({
  sortColumn,
  sortDirection,
  onSort,
}: MobileSortChipsProps) {
  return (
    <div className="mobile-sort-chips">
      <span className="mobile-sort-label">Sort:</span>
      <div className="mobile-sort-chips-row">
        {SORT_OPTIONS.map(({ column, label }) => {
          const isActive = sortColumn === column;
          const arrow = isActive ? (sortDirection === 'asc' ? ' \u2191' : ' \u2193') : '';

          return (
            <button
              key={column}
              className={`mobile-sort-chip ${isActive ? 'active' : ''}`}
              onClick={() => onSort(column)}
              aria-pressed={isActive}
              aria-label={`Sort by ${label}${isActive ? `, currently ${sortDirection === 'asc' ? 'ascending' : 'descending'}` : ''}`}
            >
              {label}{arrow}
            </button>
          );
        })}
      </div>
    </div>
  );
});
