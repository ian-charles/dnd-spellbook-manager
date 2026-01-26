import { View } from '../hooks/useHashRouter';

/** Unique identifier for each tour */
export type TourId =
  | 'welcome'
  | 'browse-spells'
  | 'spellbooks';

/** Where the tooltip appears relative to the highlighted element */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'center';

/** Actions that can be triggered before a step is shown */
export type BeforeStepAction =
  | 'navigate-to-browse'
  | 'navigate-to-spellbooks'
  | 'navigate-to-spellbook-detail';

/**
 * A single step in a tour.
 * Each step highlights an element and shows a tooltip with instructions.
 */
export interface TourStep {
  /** Unique identifier for this step (used internally) */
  id: string;

  /** CSS selector for the element to highlight. Optional for center-placement steps. */
  targetSelector?: string;

  /** Optional different CSS selector to use on desktop (>= 768px) */
  desktopSelector?: string;

  /** Heading text shown in the tooltip */
  title: string;

  /** Body text explaining what this UI element does */
  description: string;

  /** Optional different description for desktop users (>= 768px) */
  desktopDescription?: string;

  /** Where to position the tooltip relative to the highlighted element */
  placement: TooltipPlacement;

  /** Optional different placement for desktop (>= 768px) */
  desktopPlacement?: TooltipPlacement;

  /** Mobile tooltip position: 'top' or 'bottom' (default: 'bottom') */
  mobilePlacement?: 'top' | 'bottom';

  /** Extra padding around the highlighted element in pixels (default: 8) */
  highlightPadding?: number;

  /** If true, user can interact with the highlighted element during this step */
  interactive?: boolean;

  /** Action to execute before showing this step (e.g., navigation) */
  beforeStep?: BeforeStepAction;

  /** Which view this step belongs to (defaults to tour's requiredView) */
  requiredView?: View;
}

/**
 * A complete tour containing multiple steps.
 * Tours are shown in the Help menu and can be started individually.
 */
export interface Tour {
  /** Must match one of the TourId values */
  id: TourId;

  /** Display name shown in the Help menu (e.g., "Browse Spells") */
  name: string;

  /** Short description shown under the name in the Help menu */
  description: string;

  /** Which page this tour requires - user will be navigated here when starting */
  requiredView: View;

  /** The steps in this tour, shown in order */
  steps: TourStep[];
}

/** Persisted state saved to localStorage */
export interface TutorialState {
  /** Tour IDs that the user has completed */
  completedTours: TourId[];

  /** Whether the first-visit welcome modal has been dismissed */
  hasSeenWelcome: boolean;

  /** Whether user opted into touring (accepted the welcome tour offer) */
  wantsTour: boolean;

  /** Tour IDs that have been auto-triggered when visiting a page */
  seenPageTours: TourId[];
}

/** Navigation handler for auto-navigating to required views */
export type NavigationHandler = (view: View, spellbookId?: string) => void;

/** Callback invoked before a tour starts, returns the demo spellbook ID if applicable */
export type BeforeTourStartHandler = (tourId: TourId) => Promise<string | null>;

/** Context value provided by TutorialProvider */
export interface TutorialContextValue {
  state: TutorialState;
  activeTour: Tour | null;
  activeStepIndex: number;
  isMenuOpen: boolean;
  startTour: (tourId: TourId) => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  exitTour: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  /** User accepted the tour offer from welcome modal */
  acceptTour: () => void;
  /** User declined the tour offer from welcome modal */
  declineTour: () => void;
  /** Mark a page tour as having been shown (for auto-trigger tracking) */
  markPageTourSeen: (tourId: TourId) => void;
  /** Register navigation handler for auto-navigation to required views */
  setNavigationHandler: (handler: NavigationHandler) => void;
  /** Current view (set by App.tsx for navigation decisions) */
  currentView: View | null;
  /** Set current view (called by App.tsx when view changes) */
  setCurrentView: (view: View) => void;
  /** Execute a beforeStep action (called by TutorialOverlay) */
  executeBeforeStepAction: (action: BeforeStepAction) => void;
  /** Register callback to be invoked before a tour starts (for demo spellbook reset) */
  setBeforeTourStartHandler: (handler: BeforeTourStartHandler) => void;
}
