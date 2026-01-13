import { useState, useEffect, useCallback } from 'react';
import { useTutorial } from './TutorialProvider';
import { TutorialTooltip } from './TutorialTooltip';
import { ConfirmDialog } from '../ConfirmDialog';
import { lockScroll, unlockScroll } from '../../utils/modalScrollLock';

const HIGHLIGHT_PADDING = 8;

function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    // matchMedia may not be available in test environments
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
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

  // Lock scroll when overlay is active
  useEffect(() => {
    if (activeTour) {
      lockScroll();
      return () => unlockScroll();
    }
  }, [activeTour]);

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

  const spotlightStyle = targetRect && currentStep.placement !== 'center'
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : undefined;

  return (
    <div className="tutorial-overlay" onClick={requestExit}>
      {/* Spotlight cutout or backdrop for center placement */}
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
