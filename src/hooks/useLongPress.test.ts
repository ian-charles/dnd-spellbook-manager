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

    it('should ignore multi-touch events', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress }));

        act(() => {
            result.current.onTouchStart({
                touches: [{ clientX: 100, clientY: 100 }, { clientX: 200, clientY: 200 }],
            } as unknown as React.TouchEvent);
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(onLongPress).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('should handle onTouchMove with empty touches list', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress }));

        act(() => {
            result.current.onTouchStart({
                touches: [{ clientX: 100, clientY: 100 }],
            } as unknown as React.TouchEvent);
        });

        act(() => {
            result.current.onTouchMove({
                touches: [],
            } as unknown as React.TouchEvent);
        });

        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Should not crash and should probably not trigger if move logic fails safely
        // But if empty touches means "no finger", it might be interpreted as end or just ignored.
        // Assuming implementation checks touches[0], empty list might throw or return undefined.
        // If it returns undefined for clientX, distance calc might be NaN.
        // Let's assume it should safely ignore or cancel.
        // Based on typical implementation, accessing [0] on empty array returns undefined.
        expect(onLongPress).not.toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('should handle zero delay', () => {
        vi.useFakeTimers();
        const onLongPress = vi.fn();
        const { result } = renderHook(() => useLongPress({ onLongPress, delay: 0 }));

        const touchEvent = {
            touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.onTouchStart(touchEvent);
        });

        act(() => {
            vi.advanceTimersByTime(0);
        });

        expect(onLongPress).toHaveBeenCalledWith(touchEvent);
        vi.useRealTimers();
    });
});
