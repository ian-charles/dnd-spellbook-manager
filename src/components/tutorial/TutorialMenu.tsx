import { useEffect } from 'react';
import { X, Check, ChevronRight } from 'lucide-react';
import { useTutorial } from './TutorialProvider';
import { TOURS, TOUR_ORDER } from '../../constants/tours';
import { TourId } from '../../types/tutorial';
import { lockScroll, unlockScroll } from '../../utils/modalScrollLock';

export function TutorialMenu() {
  const {
    state,
    isMenuOpen,
    closeMenu,
    startTour,
    acceptTour,
    declineTour,
  } = useTutorial();

  // Show welcome variant if user hasn't dismissed the welcome yet
  const isWelcome = !state.hasSeenWelcome;

  useEffect(() => {
    if (isMenuOpen) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  if (!isMenuOpen) {
    return null;
  }

  const handleClose = () => {
    if (isWelcome) {
      declineTour();
    } else {
      closeMenu();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleStartTour = (tourId: TourId) => {
    startTour(tourId);
  };

  const availableTours = TOUR_ORDER.filter(id => TOURS[id].steps.length > 0);

  return (
    <div
      className="tutorial-menu-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-menu-title"
    >
      <div className="tutorial-menu">
        <button
          className="tutorial-menu-close"
          onClick={handleClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        <div className="tutorial-menu-header">
          <h2 id="tutorial-menu-title" className="tutorial-menu-title">
            {isWelcome ? 'Welcome to The Spellbookery!' : 'Learn The Spellbookery'}
          </h2>
          {isWelcome && (
            <p className="tutorial-menu-subtitle">
              Would you like a quick tour of how to use the app?
            </p>
          )}
        </div>

        <div className="tutorial-menu-content">
          {isWelcome ? (
            // Welcome: binary choice instead of tour list
            <div className="tutorial-welcome-choice">
              <button
                className="tutorial-welcome-btn tutorial-welcome-btn-primary"
                onClick={acceptTour}
              >
                Take the Tour
              </button>
              <button
                className="tutorial-welcome-btn tutorial-welcome-btn-secondary"
                onClick={declineTour}
              >
                Skip
              </button>
            </div>
          ) : availableTours.length === 0 ? (
            <p className="tutorial-menu-empty">
              No tours available yet. Check back soon!
            </p>
          ) : (
            // Help menu: show tour list
            <ul className="tutorial-menu-list">
              {availableTours.map(tourId => {
                const tour = TOURS[tourId];
                const isCompleted = state.completedTours.includes(tourId);

                return (
                  <li key={tourId}>
                    <button
                      className="tutorial-menu-item"
                      onClick={() => handleStartTour(tourId)}
                    >
                      <div className="tutorial-menu-item-content">
                        <span className="tutorial-menu-item-name">
                          {tour.name}
                          {isCompleted && (
                            <Check
                              size={16}
                              className="tutorial-menu-item-check"
                              aria-label="Completed"
                            />
                          )}
                        </span>
                        <span className="tutorial-menu-item-description">
                          {tour.description}
                        </span>
                      </div>
                      <ChevronRight size={20} className="tutorial-menu-item-arrow" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!isWelcome && (
          <div className="tutorial-menu-footer">
            <button
              className="tutorial-menu-skip"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
