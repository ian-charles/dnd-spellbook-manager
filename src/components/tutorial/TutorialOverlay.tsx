import { useState, useEffect, useCallback, useRef } from 'react';
import { useTutorial } from './TutorialProvider';
import { TutorialTooltip } from './TutorialTooltip';
import { ConfirmDialog } from '../ConfirmDialog';

const HIGHLIGHT_PADDING = 8;
const FADE_DURATION = 150; // ms for tooltip fade in/out

// Chrome element selectors for dimming overlays
const HEADER_SELECTOR = '.app-header';
const FOOTER_SELECTOR = '.app-footer';

// Scroll positioning: where to place target element's top edge in viewport
const DEFAULT_VIEWPORT_POSITION = 0.25; // 25% down - good visibility with tooltip below
const MOBILE_TOP_TOOLTIP_POSITION = 0.33; // 33% down - more room for tooltip above element
const SCROLL_THRESHOLD_PX = 50; // Minimum offset to trigger scroll - avoids jarring scrolls for nearly-visible elements

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    // matchMedia may not be available in test environments
    if (typeof window === 'undefined' || !window.matchMedia) return;

    // Use min-width for mobile-first consistency with CSS
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
    // When min-width matches, we're NOT mobile (viewport >= breakpoint)
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);

    // Set initial state based on current match
    setIsMobile(!mediaQuery.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Measures header and footer heights for spotlight clamping.
 * Returns { headerHeight, footerHeight } in pixels.
 */
function useChromeHeights(): { headerHeight: number; footerHeight: number } {
  const [heights, setHeights] = useState({ headerHeight: 0, footerHeight: 0 });

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector(HEADER_SELECTOR);
      const footer = document.querySelector(FOOTER_SELECTOR);
      setHeights({
        headerHeight: header?.getBoundingClientRect().height ?? 0,
        footerHeight: footer?.getBoundingClientRect().height ?? 0,
      });
    };

    // Measure on mount and resize
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  return heights;
}

/**
 * Scrolls the target element into view.
 * - Default: positions element's TOP at 25% down the viewport
 * - Mobile with mobilePlacement='top': positions at 33% to give more room for top tooltip
 * Returns whether scrolling is currently in progress.
 * Includes retry logic for when elements aren't immediately available after navigation.
 */
function useScrollToTarget(
  selector: string | undefined,
  isMobile: boolean,
  mobilePlacement: 'top' | 'bottom' | undefined
): boolean {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!selector) {
      setIsScrolling(false);
      return;
    }

    const scrollToElement = (element: Element): boolean => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Mobile with top tooltip: position element lower to give room for tooltip above
      const targetPercent = (isMobile && mobilePlacement === 'top')
        ? MOBILE_TOP_TOOLTIP_POSITION
        : DEFAULT_VIEWPORT_POSITION;
      const targetPosition = viewportHeight * targetPercent;

      // Calculate how much we need to scroll (based on element's top edge)
      const scrollOffset = rect.top - targetPosition;

      // Only scroll if element is significantly off from target position
      if (Math.abs(scrollOffset) > SCROLL_THRESHOLD_PX) {
        setIsScrolling(true);

        window.scrollBy({
          top: scrollOffset,
          behavior: 'smooth',
        });

        return true; // Scrolling initiated
      }
      return false; // No scroll needed
    };

    const tryScroll = () => {
      const element = document.querySelector(selector);
      if (element) {
        if (scrollToElement(element)) {
          // Wait for scroll to complete
          return setTimeout(() => {
            setIsScrolling(false);
          }, 400);
        } else {
          setIsScrolling(false);
        }
        return null;
      }
      return undefined; // Element not found
    };

    // Try immediately
    const immediateResult = tryScroll();
    if (immediateResult !== undefined) {
      // Element was found (either scrolled or no scroll needed)
      return () => {
        if (immediateResult) clearTimeout(immediateResult);
      };
    }

    // Element not found - might be waiting for page render after navigation
    // Retry a few times with increasing delays
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelays = [50, 100, 200, 300, 500]; // ms
    let currentTimer: ReturnType<typeof setTimeout> | null = null;

    const retry = () => {
      if (retryCount >= maxRetries) {
        setIsScrolling(false);
        return;
      }

      currentTimer = setTimeout(() => {
        const result = tryScroll();
        if (result === undefined && retryCount < maxRetries - 1) {
          // Element still not found, keep retrying
          retryCount++;
          retry();
        } else if (result) {
          // Scroll timer returned, store it for cleanup
          currentTimer = result;
        }
      }, retryDelays[retryCount]);
    };

    retry();

    return () => {
      if (currentTimer) clearTimeout(currentTimer);
    };
  }, [selector, isMobile, mobilePlacement]);

  return isScrolling;
}

/** Refs for click-blocking panels */
interface BlockerRefs {
  top: React.RefObject<HTMLDivElement>;
  bottom: React.RefObject<HTMLDivElement>;
  left: React.RefObject<HTMLDivElement>;
  right: React.RefObject<HTMLDivElement>;
  spotlight: React.RefObject<HTMLDivElement>;
}

/** Chrome bounds for clamping spotlight */
interface ChromeBounds {
  headerHeight: number;
  footerHeight: number;
}

/**
 * Clamps spotlight bounds to stay within the safe zone between header and footer.
 * - Top edge: max(original, headerHeight)
 * - Bottom edge: min(original, viewportHeight - footerHeight)
 */
function clampSpotlightBounds(
  top: number,
  left: number,
  width: number,
  height: number,
  chromeBounds: ChromeBounds
): { top: number; left: number; width: number; height: number } {
  const viewportHeight = window.innerHeight;
  const { headerHeight, footerHeight } = chromeBounds;

  // Calculate original bottom
  const originalBottom = top + height;

  // Clamp top: can't go above header bottom
  const clampedTop = Math.max(top, headerHeight);

  // Clamp bottom: can't go below footer top
  const maxBottom = viewportHeight - footerHeight;
  const clampedBottom = Math.min(originalBottom, maxBottom);

  // Recalculate height based on clamped bounds
  const clampedHeight = Math.max(0, clampedBottom - clampedTop);

  return {
    top: clampedTop,
    left,
    width,
    height: clampedHeight,
  };
}

/**
 * Hook that tracks target element rect.
 * Returns initial rect via state (triggers transition on step change),
 * and updates spotlight ref directly during scroll (no transition).
 *
 * @param isScrolling - When true, delays capturing rect until scroll completes
 * @param isInteractive - When true, skips MutationObserver updates to avoid tracking
 *                        mid-animation positions (e.g., during swipe gestures)
 * @param blockerRefs - Refs for the four click-blocking panels + spotlight blocker
 * @param chromeBounds - Header/footer heights for clamping spotlight bounds
 */
function useTargetRect(
  selector: string | undefined,
  spotlightRef: React.RefObject<HTMLDivElement>,
  padding: number,
  isScrolling: boolean,
  isInteractive: boolean,
  blockerRefs: BlockerRefs | undefined,
  chromeBounds: ChromeBounds
): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Update spotlight and blocker positions directly via refs (no React re-render, no transition)
  const updateSpotlightPosition = useCallback(() => {
    if (!selector) return;

    const element = document.querySelector(selector);
    if (!element) return;

    const newRect = element.getBoundingClientRect();

    // Calculate unclamped spotlight bounds
    const unclampedTop = newRect.top - padding;
    const unclampedLeft = newRect.left - padding;
    const unclampedWidth = newRect.width + padding * 2;
    const unclampedHeight = newRect.height + padding * 2;

    // Clamp spotlight to stay within header/footer safe zone
    const clamped = clampSpotlightBounds(
      unclampedTop,
      unclampedLeft,
      unclampedWidth,
      unclampedHeight,
      chromeBounds
    );

    // Update spotlight position
    if (spotlightRef.current) {
      // Disable transition for scroll updates
      spotlightRef.current.style.transition = 'none';
      // Directly update DOM, bypassing React state
      spotlightRef.current.style.top = `${clamped.top}px`;
      spotlightRef.current.style.left = `${clamped.left}px`;
      spotlightRef.current.style.width = `${clamped.width}px`;
      spotlightRef.current.style.height = `${clamped.height}px`;
    }

    // Update blocker panel positions (use clamped bounds)
    if (blockerRefs) {
      const spotTop = clamped.top;
      const spotLeft = clamped.left;
      const spotWidth = clamped.width;
      const spotHeight = clamped.height;

      // Top blocker: full width, from top to spotlight top
      if (blockerRefs.top.current) {
        blockerRefs.top.current.style.top = '0';
        blockerRefs.top.current.style.left = '0';
        blockerRefs.top.current.style.right = '0';
        blockerRefs.top.current.style.height = `${Math.max(0, spotTop)}px`;
      }

      // Bottom blocker: full width, from spotlight bottom to viewport bottom
      if (blockerRefs.bottom.current) {
        blockerRefs.bottom.current.style.top = `${spotTop + spotHeight}px`;
        blockerRefs.bottom.current.style.left = '0';
        blockerRefs.bottom.current.style.right = '0';
        blockerRefs.bottom.current.style.bottom = '0';
      }

      // Left blocker: from spotlight top to bottom, left edge to spotlight left
      if (blockerRefs.left.current) {
        blockerRefs.left.current.style.top = `${spotTop}px`;
        blockerRefs.left.current.style.left = '0';
        blockerRefs.left.current.style.width = `${Math.max(0, spotLeft)}px`;
        blockerRefs.left.current.style.height = `${spotHeight}px`;
      }

      // Right blocker: from spotlight top to bottom, spotlight right to viewport right
      if (blockerRefs.right.current) {
        blockerRefs.right.current.style.top = `${spotTop}px`;
        blockerRefs.right.current.style.left = `${spotLeft + spotWidth}px`;
        blockerRefs.right.current.style.right = '0';
        blockerRefs.right.current.style.height = `${spotHeight}px`;
      }

      // Spotlight blocker: covers the spotlight area when not interactive
      if (blockerRefs.spotlight.current) {
        blockerRefs.spotlight.current.style.top = `${spotTop}px`;
        blockerRefs.spotlight.current.style.left = `${spotLeft}px`;
        blockerRefs.spotlight.current.style.width = `${spotWidth}px`;
        blockerRefs.spotlight.current.style.height = `${spotHeight}px`;
      }
    }
  }, [selector, spotlightRef, padding, blockerRefs, chromeBounds]);

  // Update React state only when scrolling completes (captures correct post-scroll position)
  // Includes retry logic for when elements aren't immediately available after navigation
  useEffect(() => {
    // Don't capture rect while scrolling - wait for it to finish
    if (isScrolling) return;

    if (!selector) {
      setRect(null);
      return;
    }

    const findElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        setRect(element.getBoundingClientRect());
        return true;
      }
      return false;
    };

    // Try immediately
    if (findElement()) return;

    // Element not found - might be waiting for page render after navigation
    // Retry a few times with increasing delays
    setRect(null);
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelays = [50, 100, 200, 300, 500]; // ms

    const retry = () => {
      if (retryCount >= maxRetries) return;

      const timer = setTimeout(() => {
        if (!findElement() && retryCount < maxRetries - 1) {
          retryCount++;
          retry();
        }
      }, retryDelays[retryCount]);

      return () => clearTimeout(timer);
    };

    const cleanup = retry();
    return cleanup;
  }, [selector, isScrolling]);

  // Listen to scroll/resize and update position directly (no state, no transition)
  useEffect(() => {
    if (!selector) return;

    window.addEventListener('scroll', updateSpotlightPosition, { passive: true });
    window.addEventListener('resize', updateSpotlightPosition);

    // Skip MutationObserver for interactive steps - the element's base position doesn't
    // change during interaction, only CSS transforms are applied temporarily (e.g., swipe).
    // Tracking mutations would capture mid-animation positions and cause misalignment.
    let observer: MutationObserver | null = null;
    if (!isInteractive) {
      observer = new MutationObserver(updateSpotlightPosition);
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      window.removeEventListener('scroll', updateSpotlightPosition);
      window.removeEventListener('resize', updateSpotlightPosition);
      observer?.disconnect();
    };
  }, [selector, updateSpotlightPosition, isInteractive]);

  return rect;
}

export function TutorialOverlay() {
  const { activeTour, activeStepIndex, nextStep, prevStep, exitTour, executeBeforeStepAction, currentView } = useTutorial();
  const isMobile = useIsMobile();
  const { headerHeight, footerHeight } = useChromeHeights();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(true);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const prevStepIndexRef = useRef<number>(activeStepIndex);

  // Refs for click-blocking panels
  const blockerRefs: BlockerRefs = {
    top: useRef<HTMLDivElement>(null),
    bottom: useRef<HTMLDivElement>(null),
    left: useRef<HTMLDivElement>(null),
    right: useRef<HTMLDivElement>(null),
    spotlight: useRef<HTMLDivElement>(null),
  };

  const currentStep = activeTour?.steps[activeStepIndex];
  const selector = !isMobile && currentStep?.desktopSelector
    ? currentStep.desktopSelector
    : currentStep?.targetSelector;

  // Fade out tooltip when step changes
  useEffect(() => {
    // Skip on initial mount or if no step change
    if (prevStepIndexRef.current === activeStepIndex) return;
    prevStepIndexRef.current = activeStepIndex;

    // Fade out immediately when step changes
    setIsTooltipVisible(false);
  }, [activeStepIndex]);

  // Execute beforeStep action when step changes
  // Note: beforeStep should only run when entering a step that requires navigation,
  // but NOT when we're already on the correct view (e.g., after going back and forward again)
  useEffect(() => {
    if (!currentStep?.beforeStep) return;

    // Determine the required view for this step
    const stepRequiredView = currentStep.requiredView || activeTour?.requiredView;

    // Only execute beforeStep if we're not already on the correct view
    // This prevents re-navigation when going back then forward
    if (stepRequiredView && currentView === stepRequiredView) {
      return;
    }

    setIsNavigating(true);
    executeBeforeStepAction(currentStep.beforeStep);
  }, [currentStep, activeTour?.requiredView, activeStepIndex, executeBeforeStepAction, currentView]);

  // Clear navigating state when view changes (navigation completed)
  useEffect(() => {
    if (isNavigating) {
      // Small delay to let the new view render
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentView, isNavigating]);

  const padding = currentStep?.highlightPadding ?? HIGHLIGHT_PADDING;
  const isInteractive = currentStep?.interactive === true;
  const mobilePlacement = currentStep?.mobilePlacement;

  // Scroll target element into view when step changes
  const isScrolling = useScrollToTarget(selector, isMobile, mobilePlacement);

  // Chrome bounds for spotlight clamping
  const chromeBounds: ChromeBounds = { headerHeight, footerHeight };

  // Track target rect - updates state when scrolling completes (with transition),
  // updates ref directly during user scroll (no transition)
  const targetRect = useTargetRect(selector, spotlightRef, padding, isScrolling, isInteractive, blockerRefs, chromeBounds);

  // Fade tooltip back in after scroll completes and everything is settled
  useEffect(() => {
    // Don't fade in while still scrolling or navigating
    if (isScrolling || isNavigating) return;

    // If tooltip is hidden and we're settled, fade it back in
    if (!isTooltipVisible) {
      const timer = setTimeout(() => {
        setIsTooltipVisible(true);
      }, FADE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isScrolling, isNavigating, isTooltipVisible]);

  // Request exit - always shows confirmation
  const requestExit = useCallback(() => {
    setShowExitConfirm(true);
  }, []);

  const confirmExit = useCallback(() => {
    setShowExitConfirm(false);
    exitTour();
  }, [exitTour]);

  const cancelExit = useCallback(() => {
    setShowExitConfirm(false);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!activeTour) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        requestExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTour, requestExit]);

  if (!activeTour || !currentStep) {
    return null;
  }

  // Show a simple backdrop while navigating between views
  if (isNavigating) {
    return (
      <div className="tutorial-overlay">
        <div className="tutorial-backdrop" />
      </div>
    );
  }

  // Only show spotlight after scrolling completes to avoid "chasing" animation
  const showSpotlight = !isScrolling && targetRect && currentStep.placement !== 'center';

  // Calculate clamped spotlight bounds for initial render
  const clampedBounds = showSpotlight
    ? clampSpotlightBounds(
        targetRect.top - padding,
        targetRect.left - padding,
        targetRect.width + padding * 2,
        targetRect.height + padding * 2,
        chromeBounds
      )
    : null;

  // Initial style from React state (includes transition for step changes)
  // Scroll updates are applied directly to ref with transition disabled
  const spotlightStyle = clampedBounds
    ? {
        top: clampedBounds.top,
        left: clampedBounds.left,
        width: clampedBounds.width,
        height: clampedBounds.height,
        transition: 'all 0.2s ease-out',
      }
    : undefined;

  // Spotlight class - add interactive modifier for pulsing border
  const spotlightClass = isInteractive
    ? 'tutorial-spotlight tutorial-spotlight--interactive'
    : 'tutorial-spotlight';

  // Calculate blocker panel styles (for initial render; scroll updates via refs)
  // Uses clamped bounds to match spotlight
  const blockerStyles = clampedBounds
    ? {
        top: {
          top: 0,
          left: 0,
          right: 0,
          height: Math.max(0, clampedBounds.top),
        },
        bottom: {
          top: clampedBounds.top + clampedBounds.height,
          left: 0,
          right: 0,
          bottom: 0,
        },
        left: {
          top: clampedBounds.top,
          left: 0,
          width: Math.max(0, clampedBounds.left),
          height: clampedBounds.height,
        },
        right: {
          top: clampedBounds.top,
          left: clampedBounds.left + clampedBounds.width,
          right: 0,
          height: clampedBounds.height,
        },
        spotlight: {
          top: clampedBounds.top,
          left: clampedBounds.left,
          width: clampedBounds.width,
          height: clampedBounds.height,
        },
      }
    : null;

  // Determine if we need a full-screen blocker (center placement or no spotlight)
  const showFullBlocker = !showSpotlight;

  return (
    <div className="tutorial-overlay">
      {/* Click-blocking panels - four panels around spotlight leave hole for interactive area */}
      {blockerStyles && (
        <>
          <div
            ref={blockerRefs.top}
            className="tutorial-blocker"
            style={blockerStyles.top}
          />
          <div
            ref={blockerRefs.bottom}
            className="tutorial-blocker"
            style={blockerStyles.bottom}
          />
          <div
            ref={blockerRefs.left}
            className="tutorial-blocker"
            style={blockerStyles.left}
          />
          <div
            ref={blockerRefs.right}
            className="tutorial-blocker"
            style={blockerStyles.right}
          />
          {/* Block spotlight area when NOT interactive */}
          {!isInteractive && (
            <div
              ref={blockerRefs.spotlight}
              className="tutorial-blocker"
              style={blockerStyles.spotlight}
            />
          )}
        </>
      )}

      {/* Full-screen blocker + backdrop for center-placement steps (no spotlight) */}
      {showFullBlocker && (
        <>
          <div className="tutorial-backdrop" />
          <div className="tutorial-blocker tutorial-blocker--full" />
        </>
      )}

      {/* Spotlight (only when targeting an element) */}
      {spotlightStyle && (
        <div
          ref={spotlightRef}
          className={spotlightClass}
          style={spotlightStyle}
        />
      )}

      {/* Tooltip */}
      <TutorialTooltip
        step={currentStep}
        stepIndex={activeStepIndex}
        totalSteps={activeTour.steps.length}
        targetRect={targetRect}
        isMobile={isMobile}
        isInteractive={isInteractive}
        isVisible={isTooltipVisible}
        onNext={nextStep}
        onPrev={prevStep}
        onExit={requestExit}
      />

      {/* Exit confirmation dialog */}
      <ConfirmDialog
        isOpen={showExitConfirm}
        title="Exit Tutorial?"
        message="Are you sure you want to exit? You can restart this tour anytime from the Help menu."
        confirmLabel="Exit"
        cancelLabel="Continue"
        variant="warning"
        onConfirm={confirmExit}
        onCancel={cancelExit}
      />
    </div>
  );
}
