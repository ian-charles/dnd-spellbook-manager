/**
 * useToast Hook Tests
 *
 * Tests for toast notification hook.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with invisible state', () => {
    const { result } = renderHook(() => useToast());

    expect(result.current.isVisible).toBe(false);
    expect(result.current.message).toBe('');
  });

  it('should show toast with message', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.message).toBe('Test message');
  });

  it('should auto-hide toast after default duration (2000ms)', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.isVisible).toBe(true);

    // Fast-forward 2000ms
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.isVisible).toBe(false);
    expect(result.current.message).toBe('');
  });

  it('should auto-hide toast after custom duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message', 5000);
    });

    expect(result.current.isVisible).toBe(true);

    // Fast-forward less than duration
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current.isVisible).toBe(true);

    // Fast-forward to complete duration
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('should accept custom default duration', () => {
    const { result } = renderHook(() => useToast(3000));

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.isVisible).toBe(true);

    // Fast-forward 3000ms (custom default)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('should update message when showing new toast', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('First message');
    });

    expect(result.current.message).toBe('First message');

    act(() => {
      result.current.showToast('Second message');
    });

    expect(result.current.message).toBe('Second message');
  });

  it('should reset timer when showing new toast before previous hides', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('First message', 2000);
    });

    // Fast-forward 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isVisible).toBe(true);

    // Show new toast (should reset timer)
    act(() => {
      result.current.showToast('Second message', 2000);
    });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.message).toBe('Second message');

    // Fast-forward 1000ms (not enough for new toast)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isVisible).toBe(true);

    // Fast-forward another 1000ms (completes new toast duration)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isVisible).toBe(false);
  });

  it('should clear timeout on unmount', () => {
    const { result, unmount } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.isVisible).toBe(true);

    // Unmount before timeout completes
    unmount();

    // Fast-forward time - should not cause errors
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // No assertion here - just verifying no errors occur
  });

  it('should handle showing toast with empty message', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('');
    });

    expect(result.current.isVisible).toBe(true);
    expect(result.current.message).toBe('');
  });

  it('should handle showing toast with very long duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast('Long toast', 10000);
    });

    expect(result.current.isVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(9999);
    });

    expect(result.current.isVisible).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.isVisible).toBe(false);
  });
});
