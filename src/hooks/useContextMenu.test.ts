/**
 * useContextMenu Hook Tests
 *
 * Testing Strategy:
 * - Uses React Testing Library's renderHook to test hook state and behavior.
 * - Mocks MouseEvent and TouchEvent to simulate user interactions.
 * - Verifies state transitions (open/close) and coordinate handling.
 * - Tests click-outside behavior using document event dispatch.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useContextMenu } from './useContextMenu';

describe('useContextMenu', () => {
    it('should initialize with null state', () => {
        const { result } = renderHook(() => useContextMenu<string>());
        expect(result.current.contextMenu, 'Context menu should be initially null').toBeNull();
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

        expect(result.current.contextMenu, 'Context menu should match mouse event coordinates').toEqual({
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

        expect(result.current.contextMenu, 'Context menu should match touch event coordinates').toEqual({
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
        expect(result.current.contextMenu, 'Context menu should be open').not.toBeNull();

        act(() => {
            result.current.closeContextMenu();
        });
        expect(result.current.contextMenu, 'Context menu should be closed').toBeNull();
    });

    it('should close context menu when clicking outside', () => {
        const { result } = renderHook(() => useContextMenu<string>());

        act(() => {
            result.current.setContextMenu({ data: 'test', x: 0, y: 0 });
        });

        act(() => {
            document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        expect(result.current.contextMenu, 'Context menu should close on outside click').toBeNull();
    });

    it('should handle empty touch list gracefully', () => {
        const { result } = renderHook(() => useContextMenu<string>());
        const mockTouchEvent = {
            touches: [],
        } as unknown as React.TouchEvent;

        act(() => {
            result.current.openContextMenu(mockTouchEvent, 'touch-data');
        });

        expect(result.current.contextMenu, 'Context menu should not open with empty touches').toBeNull();
    });

    it('should handle negative coordinates', () => {
        const { result } = renderHook(() => useContextMenu<string>());
        const mockMouseEvent = {
            clientX: -100,
            clientY: -200,
        } as unknown as React.MouseEvent;

        act(() => {
            result.current.openContextMenu(mockMouseEvent, 'test-data');
        });

        expect(result.current.contextMenu, 'Context menu should accept negative coordinates').toEqual({
            data: 'test-data',
            x: -100,
            y: -200,
        });
    });

    it('should handle rapid open/close cycles', () => {
        const { result } = renderHook(() => useContextMenu<string>());
        const mockMouseEvent = { clientX: 0, clientY: 0 } as unknown as React.MouseEvent;

        act(() => {
            result.current.openContextMenu(mockMouseEvent, 'data1');
            result.current.closeContextMenu();
            result.current.openContextMenu(mockMouseEvent, 'data2');
        });

        expect(result.current.contextMenu, 'Context menu should show last opened data').toEqual({
            data: 'data2',
            x: 0,
            y: 0,
        });
    });
});
