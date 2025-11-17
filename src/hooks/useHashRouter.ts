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

interface RouteState {
  currentView: View;
  selectedSpellbookId: string | null;
}

interface HashRouterReturn {
  currentView: View;
  selectedSpellbookId: string | null;
  navigateToBrowse: () => void;
  navigateToSpellbooks: () => void;
  navigateToSpellbookDetail: (spellbookId: string) => void;
}

export function useHashRouter(): HashRouterReturn {
  const [route, setRoute] = useState<RouteState>({
    currentView: 'browse',
    selectedSpellbookId: null,
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove '#' prefix

      if (hash.startsWith('/spellbooks/')) {
        // Detail view: #/spellbooks/:id
        const id = hash.split('/')[2];
        setRoute({
          currentView: 'spellbook-detail',
          selectedSpellbookId: id,
        });
      } else if (hash === '/spellbooks') {
        // List view: #/spellbooks
        setRoute({
          currentView: 'spellbooks',
          selectedSpellbookId: null,
        });
      } else {
        // Browse view: # or #/ or anything else
        setRoute({
          currentView: 'browse',
          selectedSpellbookId: null,
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

  return {
    currentView: route.currentView,
    selectedSpellbookId: route.selectedSpellbookId,
    navigateToBrowse,
    navigateToSpellbooks,
    navigateToSpellbookDetail,
  };
}
