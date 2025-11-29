import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useContextMenu } from './useContextMenu';

describe('useContextMenu', () => {
    it('should initialize with null state', () => {
        const { result } = renderHook(() => useContextMenu<string>());
        expect(result.current.contextMenu).toBeNull();
    });

    it('should open context menu with mouse event', () => {
        const { result } = renderHook(() => useContextMenu<string>());
        const mockMouseEvent = {
            clientX: 100,
            clientY: 200,
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.openContextMenu(mockMouseEvent, 'test-data');
        });

        expect(result.current.contextMenu).toEqual({
            data: 'test-data',
            x: 100,
            y: 200,
        });
    });

    it('should open context menu with touch event', () => {
        const { result } = renderHook(() => useContextMenu<string>());
        const mockTouchEvent = {
            touches: [{ clientX: 50, clientY: 60 }],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.openContextMenu(mockTouchEvent, 'touch-data');
        });

        expect(result.current.contextMenu).toEqual({
            data: 'touch-data',
            x: 50,
            y: 60,
        });
    });

    it('should close context menu', () => {
        const { result } = renderHook(() => useContextMenu<string>());

        act(() => {
            result.current.setContextMenu({ data: 'test', x: 0, y: 0 });
        });
        expect(result.current.contextMenu).not.toBeNull();

        act(() => {
            result.current.closeContextMenu();
        });
        expect(result.current.contextMenu).toBeNull();
    });

    it('should close context menu when clicking outside', () => {
        const { result } = renderHook(() => useContextMenu<string>());

        act(() => {
            result.current.setContextMenu({ data: 'test', x: 0, y: 0 });
        });

        act(() => {
            document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(result.current.contextMenu).toBeNull();
    });
});
