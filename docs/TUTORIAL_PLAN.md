# Tutorial System - Implementation Status

This document tracks the implementation status of the tutorial/guided tour system for The Spellbookery.

---

## Completed Features

### Three-Tour Architecture ✅

Restructured the tutorial system into three distinct tours:

1. **Welcome Tour** (`welcome`)
   - Complete end-to-end onboarding for new users
   - Auto-starts when user accepts tour offer on first visit
   - Flows: Browse → Spellbook Detail → Spellbooks List
   - NOT shown in Help menu (first-time users only)

2. **Browse Spells Tour** (`browse-spells`)
   - Focused refresher on spell browsing/filtering/selection
   - Available from Help menu
   - Standalone tour on Browse page

3. **Spellbooks Tour** (`spellbooks`)
   - Focused refresher on spellbook detail + list management
   - Available from Help menu
   - Starts on demo spellbook, transitions to list view

**Files**: `src/types/tutorial.ts`, `src/constants/tours.ts`, `src/components/tutorial/TutorialProvider.tsx`, `src/components/tutorial/TutorialMenu.tsx`

---

### Click Blocking Outside Spotlight ✅

Implemented four-panel click blocker system that surrounds the spotlight, leaving a hole for interactive areas.

**How it works**:
- Four transparent divs with `pointer-events: auto` positioned around the spotlight
- When `interactive: false`, a fifth panel covers the spotlight area
- When `interactive: true`, the spotlight area is left open for clicks
- Blocker positions update during scroll via refs (no React re-render)

**Files**: `src/components/tutorial/TutorialOverlay.tsx`, `src/components/tutorial/Tutorial.css`

---

### Reverse Navigation (Back Button) ✅

Added `requiredView` field to tour steps to enable proper backward navigation.

**How it works**:
- Each step can specify which view it belongs to (`requiredView`)
- When user clicks "Back", the system checks if navigation is needed
- Navigates to the correct page before showing the previous step

**Files**: `src/types/tutorial.ts`, `src/constants/tours.ts`, `src/components/tutorial/TutorialProvider.tsx`

---

### Spotlight Clamping to Header/Footer Safe Zone ✅

The spotlight is clamped so it never visually extends into the header or footer areas.

**How it works**:
- `clampSpotlightBounds()` function constrains spotlight position:
  - Top edge: `max(targetTop - padding, headerHeight)`
  - Bottom edge: `min(targetBottom + padding, viewportHeight - footerHeight)`
- Applied in both initial render (React state) and scroll updates (direct DOM)
- Blocker panels use the same clamped bounds
- Pulsing glow border on interactive steps stays within bounds

**Why this approach**:
- Previous attempts used chrome dimming overlays (z-index 1502 above spotlight)
- Semi-transparent overlay: spotlight glow bled through
- Opaque overlay: completely hid header/footer content
- Clamping the spotlight itself is cleaner - no extra layers needed

**Files**: `src/components/tutorial/TutorialOverlay.tsx`, `src/components/tutorial/Tutorial.css` (removed chrome dimming CSS)

---

### Modal z-index Consistency ✅

Updated FilterModal and AboutModal to use `z-index: var(--z-modal)` (2000) so they appear above the tutorial overlay.

**Files**: `src/components/FilterModal.css`, `src/components/AboutModal.css`

---

### Mobile-Specific Tooltip Placement ✅

Added `mobilePlacement` option for tour steps to position the tooltip at top or bottom on mobile.

**How it works**:
- Steps can specify `mobilePlacement: 'top'` to show tooltip above content
- Useful when spotlighting elements near the bottom of the screen
- Scroll positioning adjusts to give room for top-placed tooltips

**Files**: `src/types/tutorial.ts`, `src/constants/tours.ts`, `src/components/tutorial/TutorialTooltip.tsx`, `src/components/tutorial/Tutorial.css`

---

### Desktop-Specific Selector and Placement ✅

Added `desktopSelector` and `desktopPlacement` options for responsive tour behavior.

**How it works**:
- `desktopSelector`: Use a different element selector on desktop (e.g., checkbox column)
- `desktopPlacement`: Use a different tooltip placement on desktop
- `desktopDescription`: Show different description text on desktop

**Files**: `src/types/tutorial.ts`, `src/constants/tours.ts`, `src/components/tutorial/TutorialOverlay.tsx`, `src/components/tutorial/TutorialTooltip.tsx`

---

### Interactive Steps with Pulsing Border ✅

Steps marked as `interactive: true` show a pulsing border around the spotlight.

**How it works**:
- CSS animation pulses an `inset` box-shadow from 3px to 5px
- Uses `--color-primary` for the glow color
- MutationObserver is disabled for interactive steps to avoid tracking mid-animation positions

**Files**: `src/components/tutorial/Tutorial.css`, `src/components/tutorial/TutorialOverlay.tsx`

---

### Demo Spellbook ✅

A demo spellbook is created for new users to explore during the tour.

**Details**:
- Name: "Sir Demo the Demonstrative (L3 Wizard)"
- Contains 9 spells, none prepared
- Created on first page load
- Used by Welcome Tour and Spellbooks tour

**Files**: `src/constants/demoSpellbook.ts`, `src/hooks/useSpellbooks.ts`

---

## Architecture Overview

### Z-Index Layers

| Layer | Z-Index | Purpose |
|-------|---------|---------|
| Tutorial Menu | 2000 | Modal level |
| Modals | 2000 | FilterModal, AboutModal, etc. |
| Tooltip | 1600 | Above all tutorial layers |
| Spotlight | 1501 | Above regular overlays, clamped to safe zone |
| Blockers/Backdrop | 1500 | Click blocking |
| App Header | 100 | Fixed header |

### Key Components

- **TutorialProvider**: Context provider managing tour state, navigation, step progression
- **TutorialOverlay**: Renders spotlight, blockers, tooltip; handles scroll tracking
- **TutorialTooltip**: Positioned tooltip with navigation buttons
- **TutorialMenu**: Help menu for selecting tours

### Key Hooks (in TutorialOverlay)

- `useIsMobile()`: Responsive breakpoint detection
- `useChromeHeights()`: Measures header/footer for spotlight clamping
- `useScrollToTarget()`: Scrolls target element into view
- `useTargetRect()`: Tracks target element position, updates spotlight and blockers

---

## Tour Step Configuration

```typescript
interface TourStep {
  id: string;
  title: string;
  description: string;
  desktopDescription?: string;
  targetSelector?: string;
  desktopSelector?: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  desktopPlacement?: TooltipPlacement;
  mobilePlacement?: 'top' | 'bottom';
  highlightPadding?: number;
  interactive?: boolean;
  beforeStep?: BeforeStepAction;
  requiredView?: View;
}
```

---

*Last Updated: 2026-01-23*
