import { useState, useEffect } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { Spellbook } from '../types/spellbook';
import './SelectSpellbookModal.css';

interface SelectSpellbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExisting: (spellbookId: string) => void;
  onCreateNew: () => void;
  spellbooks: Spellbook[];
  spellCount: number;
}

export function SelectSpellbookModal({
  isOpen,
  onClose,
  onSelectExisting,
  onCreateNew,
  spellbooks,
  spellCount,
}: SelectSpellbookModalProps) {
  const [selectedSpellbookId, setSelectedSpellbookId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const modalRef = useFocusTrap(isOpen);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedSpellbook = spellbooks.find(sb => sb.id === selectedSpellbookId);

  // Sort spellbooks alphabetically by name
  const sortedSpellbooks = [...spellbooks].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  // Filter spellbooks based on search query
  const filteredSpellbooks = sortedSpellbooks.filter(sb =>
    sb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpellbookId) {
      onSelectExisting(selectedSpellbookId);
    }
  };

  const handleSpellbookClick = (spellbookId: string) => {
    setSelectedSpellbookId(spellbookId);
  };

  const handleCreateNew = () => {
    onClose();
    onCreateNew();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog select-spellbook-modal"
        onClick={(e) => e.stopPropagation()}
        data-testid="select-spellbook-dialog"
        ref={modalRef}
      >
        <h3>Add {spellCount} {spellCount === 1 ? 'Spell' : 'Spells'}</h3>
        <p className="modal-description">
          Select a spellbook to add the selected spells to:
        </p>

        <form onSubmit={handleSubmit} data-testid="select-spellbook-form">
          <button
            type="button"
            className="btn-create-new"
            onClick={handleCreateNew}
            data-testid="create-new-spellbook-button"
            tabIndex={-1}
          >
            + Create New Spellbook
          </button>

          <div className="search-filter">
            <input
              type="text"
              className="search-input"
              placeholder="Search spellbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="spellbook-search-input"
            />
          </div>

          <div className="spellbook-selector-list">
            {filteredSpellbooks.map((spellbook) => (
              <button
                key={spellbook.id}
                type="button"
                className={`spellbook-selector-item ${
                  selectedSpellbookId === spellbook.id ? 'selected' : ''
                }`}
                onClick={() => handleSpellbookClick(spellbook.id)}
                data-testid={`spellbook-option-${spellbook.id}`}
              >
                <strong>{spellbook.name}</strong>
                <span>{spellbook.spells.length} spells</span>
              </button>
            ))}
          </div>

          <div className="dialog-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              data-testid="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!selectedSpellbookId}
              data-testid="add-button"
            >
              {selectedSpellbook ? `Add to ${selectedSpellbook.name}` : 'Add to Spellbook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
