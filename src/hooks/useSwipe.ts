import { useRef, useState, useCallback, TouchEvent } from 'react';
import { hapticLight, hapticMedium } from '../utils/haptics';

export interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number; // Percentage of width to trigger action (default 30%)
  maxSwipe?: number; // Maximum swipe distance in pixels (default 150)
}

export interface SwipeState {
  isSwiping: boolean;
  swipeDistance: number; // Negative = left, positive = right
  swipeProgress: number; // 0-100% of threshold
}

/**
 * Custom hook for handling swipe gestures on mobile
 * Returns handlers and current swipe state for visual feedback
 */
export function useSwipe(config: SwipeConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 30, // 30% of element width
    maxSwipe = 150, // Maximum 150px swipe
  } = config;

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const elementWidth = useRef<number>(0);
  const hasTriggeredHaptic = useRef<boolean>(false);
  const swipeStateRef = useRef<SwipeState>({
    isSwiping: false,
    swipeDistance: 0,
    swipeProgress: 0,
  });
  const [swipeState, setSwipeState] = useState<SwipeState>({
    isSwiping: false,
    swipeDistance: 0,
    swipeProgress: 0,
  });

  const handleTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    hasTriggeredHaptic.current = false; // Reset haptic flag on new swipe

    // Get element width for calculating threshold
    const target = e.currentTarget;
    elementWidth.current = target.offsetWidth;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent<HTMLElement>) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Only track horizontal swipes (ignore if more vertical than horizontal)
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // Limit swipe distance to maxSwipe
    const limitedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));

    // Calculate threshold in pixels
    const thresholdPx = (elementWidth.current * threshold) / 100;

    // Calculate progress (0-100%)
    const progress = Math.min(100, (Math.abs(limitedDelta) / thresholdPx) * 100);

    // Trigger light haptic when crossing threshold (100%)
    if (progress >= 100 && !hasTriggeredHaptic.current) {
      hapticLight();
      hasTriggeredHaptic.current = true;
    }

    const newState = {
      isSwiping: true,
      swipeDistance: limitedDelta,
      swipeProgress: progress,
    };
    swipeStateRef.current = newState;
    setSwipeState(newState);
  }, [threshold, maxSwipe]);

  const handleTouchEnd = useCallback(() => {
    const currentState = swipeStateRef.current;

    if (!currentState.isSwiping) {
      return;
    }

    // Calculate threshold in pixels
    const thresholdPx = (elementWidth.current * threshold) / 100;

    // Trigger action if past threshold
    if (Math.abs(currentState.swipeDistance) >= thresholdPx) {
      hapticMedium(); // Confirm action completion with medium haptic
      if (currentState.swipeDistance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (currentState.swipeDistance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    // Reset state
    const resetState = {
      isSwiping: false,
      swipeDistance: 0,
      swipeProgress: 0,
    };
    swipeStateRef.current = resetState;
    setSwipeState(resetState);
  }, [threshold, onSwipeLeft, onSwipeRight]);

  const handleTouchCancel = useCallback(() => {
    // Reset on cancel
    const resetState = {
      isSwiping: false,
      swipeDistance: 0,
      swipeProgress: 0,
    };
    swipeStateRef.current = resetState;
    setSwipeState(resetState);
  }, []);

  return {
    swipeState,
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
    },
  };
}
