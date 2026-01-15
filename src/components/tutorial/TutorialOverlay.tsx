import { useState, useEffect, useCallback } from 'react';
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

function useTargetRect(selector: string | undefined): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateRect = useCallback(() => {
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
  }, [selector]);

  useEffect(() => {
    updateRect();

    window.addEventListener('scroll', updateRect, { passive: true });
    window.addEventListener('resize', updateRect);

    const observer = new MutationObserver(updateRect);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', updateRect);
      window.removeEventListener('resize', updateRect);
      observer.disconnect();
    };
  }, [updateRect]);

  return rect;
}

export function TutorialOverlay() {
  const { activeTour, activeStepIndex, nextStep, prevStep, exitTour } = useTutorial();
  const isMobile = useIsMobile();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentStep = activeTour?.steps[activeStepIndex];
  const selector = !isMobile && currentStep?.desktopSelector
    ? currentStep.desktopSelector
    : currentStep?.targetSelector;

  // Scroll target element into view when step changes
  const isScrolling = useScrollToTarget(selector);

  const targetRect = useTargetRect(selector);

  // Request exit - shows confirmation if not on first step
  const requestExit = useCallback(() => {
    if (activeStepIndex === 0) {
      exitTour();
    } else {
      setShowExitConfirm(true);
    }
  }, [activeStepIndex, exitTour]);

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

  const padding = currentStep.highlightPadding ?? HIGHLIGHT_PADDING;

  // Only show spotlight after scrolling completes to avoid "chasing" animation
  const showSpotlight = !isScrolling && targetRect && currentStep.placement !== 'center';

  const spotlightStyle = showSpotlight
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : undefined;

  return (
    <div className="tutorial-overlay" onClick={requestExit}>
      {/* Spotlight cutout or backdrop (backdrop shown while scrolling or for center placement) */}
      {spotlightStyle ? (
        <div
          className="tutorial-spotlight"
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
