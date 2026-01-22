import { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TourStep, TooltipPlacement } from '../../types/tutorial';

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialTooltipProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  targetRect: DOMRect | null;
  isMobile: boolean;
  isInteractive: boolean;
  isVisible: boolean;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}

const TOOLTIP_MARGIN = 12;
const ARROW_SIZE = 8;

function calculatePosition(
  targetRect: DOMRect | null,
  tooltipRect: DOMRect,
  placement: TooltipPlacement,
  isMobile: boolean
): TooltipPosition {
  if (!targetRect || placement === 'center') {
    return {
      top: window.innerHeight / 2 - tooltipRect.height / 2,
      left: window.innerWidth / 2 - tooltipRect.width / 2,
      arrowPosition: 'top',
    };
  }

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  let top = 0;
  let left = 0;
  let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  // Mobile always uses bottom placement
  const effectivePlacement = isMobile ? 'bottom' : placement;

  switch (effectivePlacement) {
    case 'top':
      top = targetRect.top - tooltipRect.height - TOOLTIP_MARGIN - ARROW_SIZE;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      arrowPosition = 'bottom';
      break;
    case 'bottom':
      top = targetRect.bottom + TOOLTIP_MARGIN + ARROW_SIZE;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      arrowPosition = 'top';
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left - tooltipRect.width - TOOLTIP_MARGIN - ARROW_SIZE;
      arrowPosition = 'right';
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.right + TOOLTIP_MARGIN + ARROW_SIZE;
      arrowPosition = 'left';
      break;
  }

  // Clamp to viewport with padding
  const padding = 16;
  left = Math.max(padding, Math.min(left, viewport.width - tooltipRect.width - padding));
  top = Math.max(padding, Math.min(top, viewport.height - tooltipRect.height - padding));

  return { top, left, arrowPosition };
}

export function TutorialTooltip({
  step,
  stepIndex,
  totalSteps,
  targetRect,
  isMobile,
  isInteractive,
  isVisible,
  onNext,
  onPrev,
  onExit,
}: TutorialTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    arrowPosition: 'top',
  });

  const updatePosition = useCallback(() => {
    if (!tooltipRef.current) return;
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const placement = !isMobile && step.desktopPlacement ? step.desktopPlacement : step.placement;
    const newPosition = calculatePosition(targetRect, tooltipRect, placement, isMobile);
    setPosition(newPosition);
  }, [targetRect, step, isMobile]);

  useEffect(() => {
    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, { passive: true });

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [updatePosition]);

  // Re-calculate after initial render when tooltip dimensions are known
  useEffect(() => {
    const timer = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(timer);
  }, [updatePosition]);

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  const description = !isMobile && step.desktopDescription
    ? step.desktopDescription
    : step.description;

  // Focus the tooltip on mount for accessibility
  useEffect(() => {
    if (tooltipRef.current) {
      tooltipRef.current.focus();
    }
  }, [stepIndex]);

  // Keyboard navigation (Arrow keys for step navigation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (!isFirstStep) {
            onPrev();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, isFirstStep]);

  // On mobile, CSS handles positioning as a bottom sheet - no inline styles needed
  const tooltipStyle = isMobile
    ? undefined
    : { top: position.top, left: position.left };

  // Determine effective placement for arrow visibility
  const effectivePlacement = !isMobile && step.desktopPlacement ? step.desktopPlacement : step.placement;
  const showArrow = !isMobile && effectivePlacement !== 'center';

  // Determine mobile placement (default: 'bottom')
  const mobileTopPlacement = isMobile && step.mobilePlacement === 'top';

  // Build class name with visibility modifier
  const tooltipClassName = [
    'tutorial-tooltip',
    showArrow ? `tutorial-tooltip-arrow-${position.arrowPosition}` : '',
    isVisible ? 'tutorial-tooltip--visible' : 'tutorial-tooltip--hidden',
    mobileTopPlacement ? 'tutorial-tooltip--mobile-top' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={tooltipRef}
      className={tooltipClassName}
      style={tooltipStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-tooltip-title"
      aria-describedby="tutorial-tooltip-description"
      tabIndex={-1}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="tutorial-tooltip-close"
        onClick={onExit}
        aria-label="Exit tutorial"
      >
        <X size={16} />
      </button>

      <div className="tutorial-tooltip-content">
        <h3 id="tutorial-tooltip-title" className="tutorial-tooltip-title">
          {step.title}
        </h3>
        <p id="tutorial-tooltip-description" className="tutorial-tooltip-description">
          {description}
        </p>
      </div>

      <div className="tutorial-tooltip-footer">
        <span className="tutorial-tooltip-progress">
          {stepIndex + 1} of {totalSteps}
        </span>
        <div className="tutorial-tooltip-buttons">
          {!isFirstStep && (
            <button
              className="tutorial-tooltip-btn tutorial-tooltip-btn-secondary"
              onClick={onPrev}
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          <button
            className="tutorial-tooltip-btn tutorial-tooltip-btn-primary"
            onClick={onNext}
          >
            {isLastStep ? 'Finish' : isInteractive ? 'Continue' : 'Next'}
            {!isLastStep && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
