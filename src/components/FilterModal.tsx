import { useEffect, useRef } from 'react';
import { SpellFilters } from './SpellFilters';
import { UseFilterReducerReturn } from '../hooks/useFilterReducer';
import './FilterModal.css';

interface FilterModalProps extends UseFilterReducerReturn {
  isOpen: boolean;
  onClose: () => void;
  schools: string[];
  classes: string[];
  sources: string[];
  filteredCount?: number;
  totalCount?: number;
  selectedCount?: number;
}

export function FilterModal({
  isOpen,
  onClose,
  schools,
  classes,
  sources,
  filteredCount,
  totalCount,
  selectedCount,
  ...filterReducer
}: FilterModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Check if any filters are active
  const hasActiveFilters =
    filterReducer.state.searchText.length > 0 ||
    (filterReducer.state.levelRange.min !== 0 || filterReducer.state.levelRange.max !== 9) ||
    filterReducer.state.selectedSchools.length > 0 ||
    filterReducer.state.selectedClasses.length > 0 ||
    filterReducer.state.selectedSources.length > 0 ||
    filterReducer.state.concentrationOnly ||
    filterReducer.state.ritualOnly ||
    filterReducer.state.verbalOnly ||
    filterReducer.state.somaticOnly ||
    filterReducer.state.materialOnly;

  // Disable body scroll when modal is open and prevent layout shift
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width before hiding it
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      // Add padding to compensate for scrollbar width
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      // Focus modal for keyboard accessibility
      if (modalRef.current) {
        modalRef.current.focus();
      }

      return () => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="filter-modal-backdrop" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className="filter-modal"
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        <div className="filter-modal-header">
          <h2 id="filter-modal-title">Filter Spells</h2>
          <button
            className="filter-modal-close"
            onClick={onClose}
            aria-label="Close filters"
          >
            ×
          </button>
        </div>
        <div className="filter-modal-body">
          <SpellFilters
            {...filterReducer}
            schools={schools}
            classes={classes}
            sources={sources}
            filteredCount={filteredCount}
            totalCount={totalCount}
            selectedCount={selectedCount}
            alwaysExpanded={true}
            hideExtras={true}
          />
        </div>
        <div className="filter-modal-footer">
          <button
            className="btn-clear-filters"
            onClick={filterReducer.clearFilters}
            disabled={!hasActiveFilters}
            aria-label="Clear all active filters"
          >
            Clear Filters
          </button>
          <button
            className="btn-primary"
            onClick={onClose}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
