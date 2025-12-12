import { useState, useEffect, useRef, useCallback } from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  target?: string;
  rel?: string;
}

export function usePriorityNav(items: NavItem[], containerWidth: number) {
  const [visibleItems, setVisibleItems] = useState<NavItem[]>(items);
  const [overflowItems, setOverflowItems] = useState<NavItem[]>([]);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const measureItems = useCallback(() => {
    if (typeof window === 'undefined') return;

    const MORE_BUTTON_WIDTH = 100; // Approximate width of "More" button
    const GAP = 12; // var(--space-3) gap between items
    let totalWidth = 0;
    const visible: NavItem[] = [];
    const overflow: NavItem[] = [];

    for (const item of items) {
      const element = itemRefs.current.get(item.id);
      if (!element) continue;

      const itemWidth = element.offsetWidth + GAP;
      totalWidth += itemWidth;

      // Check if adding this item would exceed available width
      // Reserve space for "More" button if we have overflow items
      const needsMoreButton = overflow.length > 0 || totalWidth > containerWidth;
      const availableWidth = needsMoreButton
        ? containerWidth - MORE_BUTTON_WIDTH
        : containerWidth;

      if (totalWidth <= availableWidth) {
        visible.push(item);
      } else {
        overflow.push(item);
      }
    }

    setVisibleItems(visible);
    setOverflowItems(overflow);
  }, [items, containerWidth]);

  useEffect(() => {
    measureItems();
  }, [measureItems]);

  const registerItem = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(id, element);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  return {
    visibleItems,
    overflowItems,
    registerItem,
  };
}
