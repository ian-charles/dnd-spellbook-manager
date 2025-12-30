import { useState, useEffect } from 'react';
import { ArrowUpToLine, BookPlus } from 'lucide-react';
import '../styles/back-to-top.css';

interface BackToTopButtonProps {
  selectedCount?: number;
  onAddSpells?: () => void;
}

export function BackToTopButton({ selectedCount = 0, onAddSpells }: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when the spell table scrolls off screen
      const spellTable = document.querySelector('.spell-table');
      if (spellTable) {
        const rect = spellTable.getBoundingClientRect();
        setIsVisible(rect.top < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else if (shouldRender) {
      // Wait for fade-out animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!shouldRender) {
    return null;
  }

  const showAddSpells = selectedCount > 0 && onAddSpells;

  return (
    <div className={`floating-action-container ${isVisible ? 'visible' : 'hidden'}`}>
      {showAddSpells && (
        <div className="floating-add-spells-wrapper">
          <button
            className="floating-action-btn"
            onClick={onAddSpells}
            aria-label={`Add ${selectedCount} ${selectedCount === 1 ? 'spell' : 'spells'}`}
          >
            <BookPlus className="floating-action-icon" size={33} strokeWidth={2} />
          </button>
          <span className="floating-action-label">
            Add {selectedCount} {selectedCount === 1 ? 'Spell' : 'Spells'}
          </span>
        </div>
      )}
      <div className="floating-back-to-top-wrapper">
        <button
          className="floating-action-btn"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUpToLine className="floating-action-icon" size={33} strokeWidth={2.5} />
        </button>
        <span className="floating-action-label">Back to Top</span>
      </div>
    </div>
  );
}
