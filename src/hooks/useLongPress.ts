import { useRef, useCallback, useEffect } from 'react';

interface UseLongPressOptions {
    onLongPress: (e: React.TouchEvent) => void;
    threshold?: number;
    delay?: number;
}

/**
 * Custom hook for handling long-press touch events.
 * 
 * @param options Configuration options
 * @param options.onLongPress Callback fired when long press is detected
 * @param options.threshold Movement threshold in pixels to cancel long press (default: 10)
 * @param options.delay Duration in ms to trigger long press (default: 500)
 * @returns Object containing touch event handlers
 */
export function useLongPress({ onLongPress, threshold = 10, delay = 500 }: UseLongPressOptions) {
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);
    const longPressStartPos = useRef<{ x: number; y: number } | null>(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
            }
        };
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Ignore multi-touch
        if (e.touches.length > 1) return;

        const touch = e.touches[0];
        longPressStartPos.current = { x: touch.clientX, y: touch.clientY };

        longPressTimer.current = setTimeout(() => {
            onLongPress(e);
        }, delay);
    }, [onLongPress, delay]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!longPressStartPos.current) return;

        if (e.touches.length === 0) {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
            longPressStartPos.current = null;
            return;
        }

        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - longPressStartPos.current.x);
        const deltaY = Math.abs(touch.clientY - longPressStartPos.current.y);

        // Cancel long press if user moves finger too much
        if (deltaX > threshold || deltaY > threshold) {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
            longPressStartPos.current = null;
        }
    }, [threshold]);

    const handleTouchEnd = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        longPressStartPos.current = null;
    }, []);

    return {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
    };
}
