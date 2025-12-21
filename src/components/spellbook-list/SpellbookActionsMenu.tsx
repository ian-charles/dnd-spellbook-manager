import { useState, useRef, useEffect } from 'react';
import { EllipsisVertical, WandSparkles, SquarePen, Copy, Trash2 } from 'lucide-react';
import './SpellbookActionsMenu.css';

interface SpellbookActionsMenuProps {
  spellbookId: string;
  spellbookName: string;
  onEditSpells: () => void;
  onEditStats: () => void;
  onCopy: () => void;
  onDelete: () => void;
}

export function SpellbookActionsMenu({
  spellbookName,
  onEditSpells,
  onEditStats,
  onCopy,
  onDelete,
}: SpellbookActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Position dropdown and check if it should open upward
  useEffect(() => {
    if (isOpen && menuRef.current && dropdownRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - menuRect.bottom;
      const spaceAbove = menuRect.top;

      // Open upward if there's not enough space below but more space above
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);

      // Position dropdown using fixed positioning
      const dropdown = dropdownRef.current;
      if (openUpward) {
        dropdown.style.top = `${menuRect.top - dropdownHeight - 8}px`;
      } else {
        dropdown.style.top = `${menuRect.bottom + 8}px`;
      }
      dropdown.style.left = `${menuRect.right - dropdown.offsetWidth}px`;
    }
  }, [isOpen, openUpward]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="spellbook-actions-menu" ref={menuRef}>
      <button
        className="spellbook-actions-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-label={`Actions for ${spellbookName}`}
        title="Actions"
      >
        <EllipsisVertical size={18} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`spellbook-actions-dropdown ${openUpward ? 'spellbook-actions-dropdown-upward' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="spellbook-actions-item"
            onClick={() => handleAction(onEditSpells)}
          >
            <WandSparkles size={16} />
            <span>Edit Spells</span>
          </button>
          <button
            className="spellbook-actions-item"
            onClick={() => handleAction(onEditStats)}
          >
            <SquarePen size={16} />
            <span>Edit Stats</span>
          </button>
          <button
            className="spellbook-actions-item"
            onClick={() => handleAction(onCopy)}
          >
            <Copy size={16} />
            <span>Copy</span>
          </button>
          <button
            className="spellbook-actions-item spellbook-actions-item-danger"
            onClick={() => handleAction(onDelete)}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
