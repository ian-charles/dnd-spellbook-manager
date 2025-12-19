import { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { NavItem } from '../hooks/usePriorityNav';
import './NavMoreMenu.css';

interface NavMoreMenuProps {
  items: NavItem[];
  className?: string;
}

export function NavMoreMenu({ items, className }: NavMoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  if (items.length === 0) return null;

  return (
    <div className={`nav-more-menu ${className || ''}`} ref={menuRef}>
      <button
        className="nav-link nav-more-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="More navigation items"
      >
        <Menu size={20} />
      </button>

      {isOpen && (
        <div className="nav-more-dropdown">
          {items.map((item) => {
            if (item.href) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.target}
                  rel={item.rel}
                  className={`nav-more-item ${item.className || ''}`}
                  aria-label={item.ariaLabel}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={`nav-more-item ${item.className || ''}`}
                aria-label={item.ariaLabel}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
