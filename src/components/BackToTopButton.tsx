import { useState, useEffect } from 'react';
import { ArrowUpToLine } from 'lucide-react';
import '../styles/back-to-top.css';

export function BackToTopButton() {
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

  return (
    <div className={`back-to-top-container ${isVisible ? 'visible' : 'hidden'}`}>
      <button
        className="back-to-top-button"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUpToLine className="back-to-top-arrow" size={33} strokeWidth={2.5} />
      </button>
      <span className="back-to-top-label">Back to Top</span>
    </div>
  );
}
