import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { TutorialContextValue, TutorialState, TourId, Tour, NavigationHandler, BeforeStepAction } from '../../types/tutorial';
import { View } from '../../hooks/useHashRouter';
import { TOURS } from '../../constants/tours';

const STORAGE_KEY = 'spellbookery-tutorial';

const defaultState: TutorialState = {
  completedTours: [],
  hasSeenWelcome: false,
  wantsTour: false,
  seenPageTours: [],
};

function loadState(): TutorialState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing fields from older versions
      return {
        ...defaultState,
        ...parsed,
      };
    }
  } catch (e) {
    console.error('Failed to load tutorial state:', e);
  }
  return defaultState;
}

function saveState(state: TutorialState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save tutorial state:', e);
  }
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

interface TutorialProviderProps {
  children: ReactNode;
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [state, setState] = useState<TutorialState>(loadState);
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View | null>(null);
  const [targetSpellbookId, setTargetSpellbookId] = useState<string | null>(null);

  // Use ref for navigation handler to avoid dependency in startTour
  const navigationHandlerRef = useRef<NavigationHandler | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setNavigationHandler = useCallback((handler: NavigationHandler) => {
    navigationHandlerRef.current = handler;
  }, []);

  const startTour = useCallback((tourId: TourId) => {
    const tour = TOURS[tourId];
    if (!tour || tour.steps.length === 0) return;

    // Check if navigation is needed
    if (tour.requiredView && currentView !== tour.requiredView) {
      // Navigate to the required view
      if (navigationHandlerRef.current) {
        // For spellbook-detail, pass the target spellbook ID
        if (tour.requiredView === 'spellbook-detail' && targetSpellbookId) {
          navigationHandlerRef.current(tour.requiredView, targetSpellbookId);
        } else {
          navigationHandlerRef.current(tour.requiredView);
        }
      }
    }

    setActiveTour(tour);
    setActiveStepIndex(0);
    setIsMenuOpen(false);
  }, [currentView, targetSpellbookId]);

  const nextStep = useCallback(() => {
    if (!activeTour) return;

    if (activeStepIndex < activeTour.steps.length - 1) {
      setActiveStepIndex(i => i + 1);
    } else {
      setState(s => ({
        ...s,
        completedTours: s.completedTours.includes(activeTour.id)
          ? s.completedTours
          : [...s.completedTours, activeTour.id],
      }));
      setActiveTour(null);
      setActiveStepIndex(0);
    }
  }, [activeTour, activeStepIndex]);

  const prevStep = useCallback(() => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(i => i - 1);
    }
  }, [activeStepIndex]);

  const exitTour = useCallback(() => {
    setActiveTour(null);
    setActiveStepIndex(0);
  }, []);

  const openMenu = useCallback(() => {
    setIsMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const acceptTour = useCallback(() => {
    setState(s => ({ ...s, hasSeenWelcome: true, wantsTour: true }));
    setIsMenuOpen(false);
    // Start the Welcome tour immediately (end-to-end onboarding)
    const tour = TOURS['welcome'];
    if (tour && tour.steps.length > 0) {
      setActiveTour(tour);
      setActiveStepIndex(0);
    }
  }, []);

  const declineTour = useCallback(() => {
    setState(s => ({ ...s, hasSeenWelcome: true, wantsTour: false }));
    setIsMenuOpen(false);
  }, []);

  const markPageTourSeen = useCallback((tourId: TourId) => {
    setState(s => ({
      ...s,
      seenPageTours: s.seenPageTours.includes(tourId)
        ? s.seenPageTours
        : [...s.seenPageTours, tourId],
    }));
  }, []);

  const executeBeforeStepAction = useCallback((action: BeforeStepAction, spellbookId?: string) => {
    if (!navigationHandlerRef.current) return;

    switch (action) {
      case 'navigate-to-browse':
        navigationHandlerRef.current('browse');
        break;
      case 'navigate-to-spellbooks':
        navigationHandlerRef.current('spellbooks');
        break;
      case 'navigate-to-spellbook-detail':
        // Use provided spellbookId or fall back to targetSpellbookId
        const id = spellbookId || targetSpellbookId;
        if (id) {
          navigationHandlerRef.current('spellbook-detail', id);
        }
        break;
    }
  }, [targetSpellbookId]);

  const value: TutorialContextValue = {
    state,
    activeTour,
    activeStepIndex,
    isMenuOpen,
    currentView,
    targetSpellbookId,
    startTour,
    nextStep,
    prevStep,
    exitTour,
    openMenu,
    closeMenu,
    acceptTour,
    declineTour,
    markPageTourSeen,
    setNavigationHandler,
    setCurrentView,
    executeBeforeStepAction,
    setTargetSpellbookId,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial(): TutorialContextValue {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
