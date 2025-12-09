import { useState, useEffect } from 'react';
import { ArrowUpToLine } from 'lucide-react';
import '../styles/back-to-top.css';

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 2 viewport heights
      const scrollThreshold = window.innerHeight * 2;
      setIsVisible(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="back-to-top-container">
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
