/**
 * useHashRouter Hook
 *
 * Custom hook for hash-based client-side routing.
 * Provides current route, route params, and navigation helpers.
 *
 * Usage:
 * const { currentView, selectedSpellbookId, navigateToBrowse, navigateToSpellbooks, navigateToSpellbookDetail } = useHashRouter();
 *
 * Routes:
 * - '#' or '#/' -> browse view
 * - '#/spellbooks' -> spellbooks list view
 * - '#/spellbooks/:id' -> spellbook detail view
 */

import { useState, useEffect } from 'react';

export type View = 'browse' | 'spellbooks' | 'spellbook-detail' | 'spell-detail';

export interface RouteState {
  currentView: View;
  selectedSpellbookId: string | null;
  selectedSpellId: string | null;
  queryParams: URLSearchParams;
}

interface NavigateToSpellbookDetailOptions {
  openEdit?: boolean;
}

interface HashRouterReturn {
  currentView: View;
  selectedSpellbookId: string | null;
  selectedSpellId: string | null;
  queryParams: URLSearchParams;
  navigateToBrowse: () => void;
  navigateToSpellbooks: () => void;
  navigateToSpellbookDetail: (spellbookId: string, options?: NavigateToSpellbookDetailOptions) => void;
  navigateToSpellDetail: (spellId: string) => void;
}

export function useHashRouter(): HashRouterReturn {
  const [route, setRoute] = useState<RouteState>({
    currentView: 'browse',
    selectedSpellbookId: null,
    selectedSpellId: null,
    queryParams: new URLSearchParams(),
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window === 'undefined') return;
      try {
        const rawHash = window.location.hash.slice(1); // Remove '#' prefix
        const [path, query] = rawHash.split('?');
        const queryParams = new URLSearchParams(query);

        if (path.startsWith('/spell/')) {
          // Spell detail view: #/spell/:id
          const id = path.split('/')[2];
          setRoute({
            currentView: 'spell-detail',
            selectedSpellbookId: null,
            selectedSpellId: id,
            queryParams,
          });
        } else if (path.startsWith('/spellbooks/')) {
          // Spellbook detail view: #/spellbooks/:id
          const id = path.split('/')[2];
          setRoute({
            currentView: 'spellbook-detail',
            selectedSpellbookId: id,
            selectedSpellId: null,
            queryParams,
          });
        } else if (path === '/spellbooks') {
          // List view: #/spellbooks
          setRoute({
            currentView: 'spellbooks',
            selectedSpellbookId: null,
            selectedSpellId: null,
            queryParams,
          });
        } else {
          // Browse view: # or #/ or anything else
          setRoute({
            currentView: 'browse',
            selectedSpellbookId: null,
            selectedSpellId: null,
            queryParams,
          });
        }
      } catch (error) {
        console.error('Error parsing hash route:', error);
        // Fallback to browse view
        setRoute({
          currentView: 'browse',
          selectedSpellbookId: null,
          selectedSpellId: null,
          queryParams: new URLSearchParams(),
        });
      }
    };

    // Handle initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToBrowse = () => {
    if (typeof window !== 'undefined') window.location.hash = '';
  };

  const navigateToSpellbooks = () => {
    if (typeof window !== 'undefined') window.location.hash = '/spellbooks';
  };

  const navigateToSpellbookDetail = (spellbookId: string, options?: NavigateToSpellbookDetailOptions) => {
    if (typeof window === 'undefined') return;
    const hash = `/spellbooks/${spellbookId}${options?.openEdit ? '?edit=true' : ''}`;
    window.location.hash = hash;
  };

  const navigateToSpellDetail = (spellId: string) => {
    if (typeof window !== 'undefined') window.location.hash = `/spell/${spellId}`;
  };

  return {
    currentView: route.currentView,
    selectedSpellbookId: route.selectedSpellbookId,
    selectedSpellId: route.selectedSpellId,
    queryParams: route.queryParams,
    navigateToBrowse,
    navigateToSpellbooks,
    navigateToSpellbookDetail,
    navigateToSpellDetail,
  };
}
