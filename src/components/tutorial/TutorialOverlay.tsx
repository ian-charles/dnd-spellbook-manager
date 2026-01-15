import { useState, useEffect, useCallback, useRef } from 'react';
import { useTutorial } from './TutorialProvider';
import { TutorialTooltip } from './TutorialTooltip';
import { ConfirmDialog } from '../ConfirmDialog';

const HIGHLIGHT_PADDING = 8;

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
 */
function useScrollToTarget(selector: string | undefined): boolean {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    if (!selector) {
      setIsScrolling(false);
      return;
    }

    const element = document.querySelector(selector);
    if (!element) {
      setIsScrolling(false);
      return;
    }

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

      // Wait for scroll to complete, then show spotlight
      // Smooth scroll typically takes 300-500ms, we use 400ms as a safe estimate
      const timer = setTimeout(() => {
        setIsScrolling(false);
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setIsScrolling(false);
    }
  }, [selector]);

  return isScrolling;
}

/**
 * Hook that tracks target element rect.
 * Returns initial rect via state (triggers transition on step change),
 * and updates spotlight ref directly during scroll (no transition).
 *
 * @param isScrolling - When true, delays capturing rect until scroll completes
 * @param isInteractive - When true, skips MutationObserver updates to avoid tracking
 *                        mid-animation positions (e.g., during swipe gestures)
 */
function useTargetRect(
  selector: string | undefined,
  spotlightRef: React.RefObject<HTMLDivElement>,
  padding: number,
  isScrolling: boolean,
  isInteractive: boolean
): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Update spotlight position directly via ref (no React re-render, no transition)
  const updateSpotlightPosition = useCallback(() => {
    if (!selector || !spotlightRef.current) return;

    const element = document.querySelector(selector);
    if (element) {
      const newRect = element.getBoundingClientRect();
      // Disable transition for scroll updates
      spotlightRef.current.style.transition = 'none';
      // Directly update DOM, bypassing React state
      spotlightRef.current.style.top = `${newRect.top - padding}px`;
      spotlightRef.current.style.left = `${newRect.left - padding}px`;
      spotlightRef.current.style.width = `${newRect.width + padding * 2}px`;
      spotlightRef.current.style.height = `${newRect.height + padding * 2}px`;
    }
  }, [selector, spotlightRef, padding]);

  // Update React state only when scrolling completes (captures correct post-scroll position)
  useEffect(() => {
    // Don't capture rect while scrolling - wait for it to finish
    if (isScrolling) return;

    if (!selector) {
      setRect(null);
      return;
    }

    const element = document.querySelector(selector);
    if (element) {
      setRect(element.getBoundingClientRect());
    } else {
      setRect(null);
    }
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
  const { activeTour, activeStepIndex, nextStep, prevStep, exitTour } = useTutorial();
  const isMobile = useIsMobile();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const currentStep = activeTour?.steps[activeStepIndex];
  const selector = !isMobile && currentStep?.desktopSelector
    ? currentStep.desktopSelector
    : currentStep?.targetSelector;

  const padding = currentStep?.highlightPadding ?? HIGHLIGHT_PADDING;
  const isInteractive = currentStep?.interactive === true;

  // Scroll target element into view when step changes
  const isScrolling = useScrollToTarget(selector);

  // Track target rect - updates state when scrolling completes (with transition),
  // updates ref directly during user scroll (no transition)
  const targetRect = useTargetRect(selector, spotlightRef, padding, isScrolling, isInteractive);

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

  return (
    <div className="tutorial-overlay">
      {/* Spotlight or backdrop */}
      {spotlightStyle ? (
        <div
          ref={spotlightRef}
          className={spotlightClass}
          style={spotlightStyle}
        />
      ) : (
        <div className="tutorial-backdrop" />
      )}

      {/* Tooltip */}
      <TutorialTooltip
        step={currentStep}
        stepIndex={activeStepIndex}
        totalSteps={activeTour.steps.length}
        targetRect={targetRect}
        isMobile={isMobile}
        isInteractive={isInteractive}
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
