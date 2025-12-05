import { renderHook, act } from '@testing-library/react';
import { useSwipe } from './useSwipe';
import { TouchEvent } from 'react';

// Helper to create mock touch event
const createTouchEvent = (clientX: number, clientY: number = 0): Partial<TouchEvent<HTMLElement>> => ({
  touches: [{ clientX, clientY }] as Touch[],
  currentTarget: {
    offsetWidth: 300, // Mock element width
  } as HTMLElement,
  preventDefault: vi.fn(),
});

describe('useSwipe', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSwipe({}));

    expect(result.current.swipeState).toEqual({
      isSwiping: false,
      swipeDistance: 0,
      swipeProgress: 0,
    });
  });

  it('should track rightward swipe', () => {
    const { result } = renderHook(() => useSwipe({}));

    // Start touch at x=100
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(100) as any);
    });

    // Move to x=150 (50px right)
    act(() => {
      result.current.swipeHandlers.onTouchMove(createTouchEvent(150) as any);
    });

    expect(result.current.swipeState.isSwiping).toBe(true);
    expect(result.current.swipeState.swipeDistance).toBe(50);
    expect(result.current.swipeState.swipeProgress).toBeGreaterThan(0);
  });

  it('should track leftward swipe', () => {
    const { result } = renderHook(() => useSwipe({}));

    // Start touch at x=150
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(150) as any);
    });

    // Move to x=100 (50px left)
    act(() => {
      result.current.swipeHandlers.onTouchMove(createTouchEvent(100) as any);
    });

    expect(result.current.swipeState.isSwiping).toBe(true);
    expect(result.current.swipeState.swipeDistance).toBe(-50);
    expect(result.current.swipeState.swipeProgress).toBeGreaterThan(0);
  });

  it('should ignore vertical swipes', () => {
    const { result } = renderHook(() => useSwipe({}));

    // Start touch
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(100, 100) as any);
    });

    // Move mostly vertical (10px horizontal, 50px vertical)
    act(() => {
      result.current.swipeHandlers.onTouchMove(createTouchEvent(110, 150) as any);
    });

    // Should not register as swiping since vertical movement is greater
    expect(result.current.swipeState.isSwiping).toBe(false);
  });

  it('should limit swipe distance to maxSwipe', () => {
    const { result } = renderHook(() => useSwipe({ maxSwipe: 100 }));

    // Start touch
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(0) as any);
    });

    // Try to swipe 200px (should be limited to 100px)
    act(() => {
      result.current.swipeHandlers.onTouchMove(createTouchEvent(200) as any);
    });

    expect(result.current.swipeState.swipeDistance).toBe(100);
  });

  it('should trigger onSwipeRight when threshold is met', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight, threshold: 30 })
    );

    // Start touch at x=0
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(0) as any);
    });

    // Swipe right 100px (33% of 300px width = past 30% threshold)
    act(() => {
      result.current.swipeHandlers.onTouchMove(createTouchEvent(100) as any);
    });

    // End touch
    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(onSwipeRight).toHaveBeenCalled();
  });

  it('should trigger onSwipeLeft when threshold is met', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeLeft, threshold: 30 })
    );

    // Start touch at x=200
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(200) as any);
    });

    // Swipe left 100px (33% of 300px width = past 30% threshold)
    act(() => {
      result.current.swipeHandlers.onTouchMove(createTouchEvent(100) as any);
    });

    // End touch
    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(onSwipeLeft).toHaveBeenCalled();
  });

  it('should NOT trigger action if threshold not met', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight, threshold: 30 })
    );

    // Start touch
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(0) as any);
    });

    // Swipe only 50px (16% of 300px width = below 30% threshold)
    act(() => {
      result.current.swipeHandlers.onTouchMove(createTouchEvent(50) as any);
    });

    // End touch
    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('should reset state after touch end', () => {
    const { result } = renderHook(() => useSwipe({}));

    // Start and move
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(0) as any);
      result.current.swipeHandlers.onTouchMove(createTouchEvent(50) as any);
    });

    expect(result.current.swipeState.isSwiping).toBe(true);

    // End touch
    act(() => {
      result.current.swipeHandlers.onTouchEnd();
    });

    expect(result.current.swipeState).toEqual({
      isSwiping: false,
      swipeDistance: 0,
      swipeProgress: 0,
    });
  });

  it('should reset state on touch cancel', () => {
    const { result } = renderHook(() => useSwipe({}));

    // Start and move
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(0) as any);
      result.current.swipeHandlers.onTouchMove(createTouchEvent(50) as any);
    });

    expect(result.current.swipeState.isSwiping).toBe(true);

    // Cancel touch
    act(() => {
      result.current.swipeHandlers.onTouchCancel();
    });

    expect(result.current.swipeState).toEqual({
      isSwiping: false,
      swipeDistance: 0,
      swipeProgress: 0,
    });
  });

  it('should calculate swipe progress correctly', () => {
    const { result } = renderHook(() => useSwipe({ threshold: 30 }));

    // Start touch
    act(() => {
      result.current.swipeHandlers.onTouchStart(createTouchEvent(0) as any);
    });

    // Swipe to 30% of width (90px of 300px)
    act(() => {
      result.current.swipeHandlers.onTouchMove(createTouchEvent(90) as any);
    });

    // Progress should be 100% (at threshold)
    expect(result.current.swipeState.swipeProgress).toBe(100);

    // Swipe to 15% of width (45px of 300px)
    act(() => {
      result.current.swipeHandlers.onTouchMove(createTouchEvent(45) as any);
    });

    // Progress should be 50% (halfway to threshold)
    expect(result.current.swipeState.swipeProgress).toBe(50);
  });
});
