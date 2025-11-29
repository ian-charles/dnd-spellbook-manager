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

export type View = 'browse' | 'spellbooks' | 'spellbook-detail';

export interface RouteState {
  currentView: View;
  selectedSpellbookId: string | null;
  queryParams: URLSearchParams;
}

interface HashRouterReturn {
  currentView: View;
  selectedSpellbookId: string | null;
  queryParams: URLSearchParams;
  navigateToBrowse: () => void;
  navigateToSpellbooks: () => void;
  navigateToSpellbookDetail: (spellbookId: string) => void;
  navigateToCopySpellbook: (spellbookId: string) => void;
}

export function useHashRouter(): HashRouterReturn {
  const [route, setRoute] = useState<RouteState>({
    currentView: 'browse',
    selectedSpellbookId: null,
    queryParams: new URLSearchParams(),
  });

  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.slice(1); // Remove '#' prefix
      const [path, query] = rawHash.split('?');
      const queryParams = new URLSearchParams(query);

      if (path.startsWith('/spellbooks/')) {
        // Detail view: #/spellbooks/:id
        const id = path.split('/')[2];
        setRoute({
          currentView: 'spellbook-detail',
          selectedSpellbookId: id,
          queryParams,
        });
      } else if (path === '/spellbooks') {
        // List view: #/spellbooks
        setRoute({
          currentView: 'spellbooks',
          selectedSpellbookId: null,
          queryParams,
        });
      } else {
        // Browse view: # or #/ or anything else
        setRoute({
          currentView: 'browse',
          selectedSpellbookId: null,
          queryParams,
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
    window.location.hash = '';
  };

  const navigateToSpellbooks = () => {
    window.location.hash = '/spellbooks';
  };

  const navigateToSpellbookDetail = (spellbookId: string) => {
    window.location.hash = `/spellbooks/${spellbookId}`;
  };

  const navigateToCopySpellbook = (spellbookId: string) => {
    window.location.hash = `/spellbooks?copy=${spellbookId}`;
  };

  return {
    currentView: route.currentView,
    selectedSpellbookId: route.selectedSpellbookId,
    queryParams: route.queryParams,
    navigateToBrowse,
    navigateToSpellbooks,
    navigateToSpellbookDetail,
    navigateToCopySpellbook,
  };
}
