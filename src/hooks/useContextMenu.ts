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
        const handleClickOutside = () => setContextMenu(null);
        if (contextMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [contextMenu]);

    const openContextMenu = useCallback((e: React.TouchEvent | React.MouseEvent, data: T) => {
        // e.preventDefault(); // Optional: prevent default behavior if needed

        let clientX: number;
        let clientY: number;

        if ('touches' in e) {
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
