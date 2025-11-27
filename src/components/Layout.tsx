/**
 * Layout Component
 *
 * Provides consistent app layout with header, navigation, and main content area.
 * Handles the visual structure but delegates navigation logic to parent.
 *
 * Props:
 * - currentView: Current active view for navigation highlighting
 * - spellbookCount: Number of spellbooks to display in nav
 * - onNavigateToBrowse: Callback when Browse Spells is clicked
 * - onNavigateToSpellbooks: Callback when My Spellbooks is clicked
 * - children: Main content to render
 */

import { ReactNode } from 'react';
import { View } from '../hooks/useHashRouter';

interface LayoutProps {
  currentView: View;
  spellbookCount: number;
  onNavigateToBrowse: () => void;
  onNavigateToSpellbooks: () => void;
  children: ReactNode;
}

export function Layout({
  currentView,
  spellbookCount,
  onNavigateToBrowse,
  onNavigateToSpellbooks,
  children,
}: LayoutProps) {
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>The Spellbookery</h1>
          <p className="app-subtitle">A D&D Magic Manager</p>
        </div>
        <nav className="app-nav">
          <button
            className={`nav-link ${currentView === 'browse' ? 'active' : ''}`}
            onClick={onNavigateToBrowse}
          >
            Browse Spells
          </button>
          <button
            className={`nav-link ${
              currentView === 'spellbooks' || currentView === 'spellbook-detail'
                ? 'active'
                : ''
            }`}
            onClick={onNavigateToSpellbooks}
            data-testid="nav-spellbooks"
          >
            My Spellbooks ({spellbookCount})
          </button>
        </nav>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
