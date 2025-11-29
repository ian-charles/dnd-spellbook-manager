import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useLongPress } from './useLongPress';

describe('useLongPress', () => {
    it('should trigger onLongPress after delay', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));

        const touchEvent = {
            touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.onTouchStart(touchEvent);
        });

        expect(onLongPress).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(onLongPress).toHaveBeenCalledWith(touchEvent);
        vi.useRealTimers();
    });

    it('should cancel long press on move beyond threshold', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress, threshold: 10 }));

        const touchStart = {
            touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.onTouchStart(touchStart);
        });

        // Move slightly (within threshold)
        act(() => {
            result.current.onTouchMove({
                touches: [{ clientX: 105, clientY: 105 }],
            } as unknown as React.TouchEvent);
        });

        // Move beyond threshold
        act(() => {
            result.current.onTouchMove({
                touches: [{ clientX: 120, clientY: 120 }],
            } as unknown as React.TouchEvent);
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(onLongPress).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('should cancel long press on touch end', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress }));

        act(() => {
            result.current.onTouchStart({
                touches: [{ clientX: 100, clientY: 100 }],
            } as unknown as React.TouchEvent);
        });

        act(() => {
            result.current.onTouchEnd();
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(onLongPress).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
    it('should clean up timer on unmount', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result, unmount } = renderHook(() => useLongPress({ onLongPress, delay: 500 }));

        act(() => {
            result.current.onTouchStart({
                touches: [{ clientX: 100, clientY: 100 }],
            } as unknown as React.TouchEvent);
        });

        unmount();

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(onLongPress).not.toHaveBeenCalled();
        vi.useRealTimers();
    });
});
