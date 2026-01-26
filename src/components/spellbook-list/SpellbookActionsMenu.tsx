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

  // Position dropdown and reposition on scroll/resize
  useEffect(() => {
    if (!isOpen || !menuRef.current || !dropdownRef.current) return;

    const menu = menuRef.current;
    const dropdown = dropdownRef.current;

    const updatePosition = () => {
      const menuRect = menu.getBoundingClientRect();

      // Close if trigger scrolled entirely out of viewport
      const scrolledOut =
        menuRect.bottom < 0 ||
        menuRect.top > window.innerHeight ||
        menuRect.right < 0 ||
        menuRect.left > window.innerWidth;

      if (scrolledOut) {
        setIsOpen(false);
        return;
      }

      const dropdownHeight = dropdown.offsetHeight;
      const footer = document.querySelector('.app-footer');
      const footerHeight = footer ? footer.getBoundingClientRect().height : 0;
      const spaceBelow = window.innerHeight - menuRect.bottom - footerHeight;
      const spaceAbove = menuRect.top;
      const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
      setOpenUpward(shouldOpenUpward);

      if (shouldOpenUpward) {
        dropdown.style.top = `${menuRect.top - dropdownHeight - 8}px`;
      } else {
        dropdown.style.top = `${menuRect.bottom + 8}px`;
      }
      dropdown.style.left = `${menuRect.right - dropdown.offsetWidth}px`;
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, { capture: true, passive: true });
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

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
