/**
 * Layout Component
 *
 * Provides consistent app layout with header, navigation, and main content area.
 * Uses Priority+ navigation pattern: utility items overflow into "More" menu on smaller screens.
 *
 * Props:
 * - currentView: Current active view for navigation highlighting
 * - spellbookCount: Number of spellbooks to display in nav
 * - onNavigateToBrowse: Callback when Browse Spells is clicked
 * - onNavigateToSpellbooks: Callback when My Spellbooks is clicked
 * - children: Main content to render
 */

import { ReactNode } from 'react';
import { Info, Heart, MessageCircleMore, Sun, MoonStar, SunMoon, HelpCircle } from 'lucide-react';
import { View } from '../hooks/useHashRouter';
import { NavMoreMenu } from './NavMoreMenu';
import { NavItem } from '../hooks/usePriorityNav';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';

interface LayoutProps {
  currentView: View;
  spellbookCount: number;
  onNavigateToBrowse: () => void;
  onNavigateToSpellbooks: () => void;
  onAboutClick: () => void;
  onHelpClick: () => void;
  children: ReactNode;
}

export function Layout({
  currentView,
  spellbookCount,
  onNavigateToBrowse,
  onNavigateToSpellbooks,
  onAboutClick,
  onHelpClick,
  children,
}: LayoutProps) {
  const { mode, toggleTheme } = useTheme();

  // Determine icon and label for next mode in the cycle
  let ThemeIcon;
  let themeLabel;
  let nextMode;

  if (mode === 'light') {
    ThemeIcon = MoonStar;
    themeLabel = 'Dark Mode';
    nextMode = 'dark';
  } else if (mode === 'dark') {
    ThemeIcon = SunMoon;
    themeLabel = 'System';
    nextMode = 'auto';
  } else {
    // auto mode
    ThemeIcon = Sun;
    themeLabel = 'Light Mode';
    nextMode = 'light';
  }

  // Define utility navigation items that can overflow into "More" menu
  // Theme toggle is handled separately for mobile (in menu) and desktop (separate button)
  const utilityNavItems: NavItem[] = [
    {
      id: 'help',
      label: 'Help',
      icon: <HelpCircle size={18} />,
      onClick: onHelpClick,
      className: 'nav-link-help',
      ariaLabel: 'Start tutorial',
    },
    {
      id: 'about',
      label: 'About',
      icon: <Info size={18} />,
      onClick: onAboutClick,
      className: 'nav-link-about',
      ariaLabel: 'About The Spellbookery',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      icon: <MessageCircleMore size={18} />,
      href: 'https://forms.gle/9Lx1Ghq2iCha7e5P8',
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'nav-link-feedback',
      ariaLabel: 'Provide feedback',
    },
    {
      id: 'donate',
      label: 'Donate',
      icon: <Heart size={18} />,
      href: 'https://ko-fi.com/iantheguy',
      target: '_blank',
      rel: 'noopener noreferrer',
      className: 'nav-link-donate',
      ariaLabel: 'Support on Ko-fi',
    },
    {
      id: 'theme',
      label: themeLabel,
      icon: <ThemeIcon size={18} />,
      onClick: toggleTheme,
      className: 'nav-link-theme',
      ariaLabel: `Switch to ${nextMode} mode`,
    },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>The Spellbookery</h1>
          <p className="app-subtitle">A D&D Magic Manager</p>
        </div>
        <nav className="app-nav">
          {/* Primary navigation - always visible */}
          <button
            className={`nav-link ${currentView === 'browse' ? 'active' : ''}`}
            onClick={onNavigateToBrowse}
            aria-current={currentView === 'browse' ? 'page' : undefined}
          >
            Browse Spells
          </button>
          <button
            className={`nav-link ${currentView === 'spellbooks' || currentView === 'spellbook-detail'
                ? 'active'
                : ''
              }`}
            onClick={onNavigateToSpellbooks}
            data-testid="nav-spellbooks"
            aria-current={
              currentView === 'spellbooks' || currentView === 'spellbook-detail'
                ? 'page'
                : undefined
            }
          >
            My Spellbooks ({spellbookCount})
          </button>

          {/* Utility nav items - visible on desktop, in "More" menu on tablet */}
          {/* Theme toggle is rendered separately, so filter it out here */}
          {utilityNavItems.filter(item => item.id !== 'theme').map((item) => {
            if (item.href) {
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.target}
                  rel={item.rel}
                  className={`nav-link ${item.className} desktop-only`}
                  aria-label={item.ariaLabel}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              );
            }

            return (
              <button
                key={item.id}
                className={`nav-link ${item.className} desktop-only`}
                onClick={item.onClick}
                aria-label={item.ariaLabel}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Theme toggle - desktop only (rightmost) */}
          <ThemeToggle variant="desktop" className="desktop-only theme-toggle-desktop-nav" />

          {/* "More" menu - rightmost button on smaller screens */}
          <NavMoreMenu items={utilityNavItems} className="tablet-only" />
        </nav>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
