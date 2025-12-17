import { useState, useEffect, useCallback } from 'react';

interface ContextMenuState<T> {
    data: T;
    x: number;
    y: number;
}

/**
 * Custom hook for managing context menu state.
 * 
 * Handles opening, closing, and click-outside behavior for context menus.
 * 
 * @returns Object containing context menu state and handlers
 */
export function useContextMenu<T>() {
    const [contextMenu, setContextMenu] = useState<ContextMenuState<T> | null>(null);

    useEffect(() => {
        if (!contextMenu) return;

        const handleClickOutside = () => setContextMenu(null);
        const handleScroll = () => setContextMenu(null);

        document.addEventListener('click', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true); // capture phase to catch all scroll events

        return () => {
            document.removeEventListener('click', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [contextMenu]);

    const openContextMenu = useCallback((e: React.TouchEvent | React.MouseEvent, data: T) => {
        // e.preventDefault(); // Optional: prevent default behavior if needed

        let clientX: number;
        let clientY: number;

        if ('touches' in e) {
            if (e.touches.length === 0) return;
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        setContextMenu({
            data,
            x: clientX,
            y: clientY,
        });
    }, []);

    const closeContextMenu = useCallback(() => {
        setContextMenu(null);
    }, []);

    return {
        contextMenu,
        openContextMenu,
        closeContextMenu,
        setContextMenu,
    };
}
