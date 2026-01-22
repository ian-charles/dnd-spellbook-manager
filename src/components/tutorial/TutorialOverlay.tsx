import { useState, useEffect, useCallback, useRef } from 'react';
import { useTutorial } from './TutorialProvider';
import { TutorialTooltip } from './TutorialTooltip';
import { ConfirmDialog } from '../ConfirmDialog';

const HIGHLIGHT_PADDING = 8;
const FADE_DURATION = 150; // ms for tooltip fade in/out

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
 * Scrolls the target element into view, positioning its TOP at approximately 25% down the viewport.
 * Returns whether scrolling is currently in progress.
 * Includes retry logic for when elements aren't immediately available after navigation.
 */
function useScrollToTarget(selector: string | undefined): boolean {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!selector) {
      setIsScrolling(false);
      return;
    }

    const scrollToElement = (element: Element): boolean => {
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Target: position the TOP of the element at 25% down from the top of the viewport
      const targetPosition = viewportHeight * 0.25;

      // Calculate how much we need to scroll (based on element's top edge)
      const scrollOffset = rect.top - targetPosition;

      // Only scroll if element is significantly off from target position
      // (more than 50px away from ideal position)
      if (Math.abs(scrollOffset) > 50) {
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
  }, [selector]);

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

/**
 * Hook that tracks target element rect.
 * Returns initial rect via state (triggers transition on step change),
 * and updates spotlight ref directly during scroll (no transition).
 *
 * @param isScrolling - When true, delays capturing rect until scroll completes
 * @param isInteractive - When true, skips MutationObserver updates to avoid tracking
 *                        mid-animation positions (e.g., during swipe gestures)
 * @param blockerRefs - Refs for the four click-blocking panels + spotlight blocker
 */
function useTargetRect(
  selector: string | undefined,
  spotlightRef: React.RefObject<HTMLDivElement>,
  padding: number,
  isScrolling: boolean,
  isInteractive: boolean,
  blockerRefs?: BlockerRefs
): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Update spotlight and blocker positions directly via refs (no React re-render, no transition)
  const updateSpotlightPosition = useCallback(() => {
    if (!selector) return;

    const element = document.querySelector(selector);
    if (!element) return;

    const newRect = element.getBoundingClientRect();

    // Update spotlight position
    if (spotlightRef.current) {
      // Disable transition for scroll updates
      spotlightRef.current.style.transition = 'none';
      // Directly update DOM, bypassing React state
      spotlightRef.current.style.top = `${newRect.top - padding}px`;
      spotlightRef.current.style.left = `${newRect.left - padding}px`;
      spotlightRef.current.style.width = `${newRect.width + padding * 2}px`;
      spotlightRef.current.style.height = `${newRect.height + padding * 2}px`;
    }

    // Update blocker panel positions
    if (blockerRefs) {
      const spotTop = newRect.top - padding;
      const spotLeft = newRect.left - padding;
      const spotWidth = newRect.width + padding * 2;
      const spotHeight = newRect.height + padding * 2;

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
  }, [selector, spotlightRef, padding, blockerRefs]);

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

  // Scroll target element into view when step changes
  const isScrolling = useScrollToTarget(selector);

  // Track target rect - updates state when scrolling completes (with transition),
  // updates ref directly during user scroll (no transition)
  const targetRect = useTargetRect(selector, spotlightRef, padding, isScrolling, isInteractive, blockerRefs);

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

  // Initial style from React state (includes transition for step changes)
  // Scroll updates are applied directly to ref with transition disabled
  const spotlightStyle = showSpotlight
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
        transition: 'all 0.2s ease-out',
      }
    : undefined;

  // Spotlight class - add interactive modifier for pulsing border
  const spotlightClass = isInteractive
    ? 'tutorial-spotlight tutorial-spotlight--interactive'
    : 'tutorial-spotlight';

  // Calculate blocker panel styles (for initial render; scroll updates via refs)
  const blockerStyles = showSpotlight && targetRect
    ? {
        top: {
          top: 0,
          left: 0,
          right: 0,
          height: Math.max(0, targetRect.top - padding),
        },
        bottom: {
          top: targetRect.top - padding + targetRect.height + padding * 2,
          left: 0,
          right: 0,
          bottom: 0,
        },
        left: {
          top: targetRect.top - padding,
          left: 0,
          width: Math.max(0, targetRect.left - padding),
          height: targetRect.height + padding * 2,
        },
        right: {
          top: targetRect.top - padding,
          left: targetRect.left - padding + targetRect.width + padding * 2,
          right: 0,
          height: targetRect.height + padding * 2,
        },
        spotlight: {
          top: targetRect.top - padding,
          left: targetRect.left - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
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
