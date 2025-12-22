# Table Row Styling Harmonization Plan

## Phase-by-Phase Plan

### Phase 1: Mobile Base Styling - Unselected, Unprepared
Focus ONLY on:
- **Browse Spells table** (.spell-table) - unselected rows
- **Spellbook Detail table** (.spellbook-table) - unselected, unprepared rows
- **Mobile only** (< 768px)
- **Base styling only** - no state changes

Goal: Harmonize the base row appearance between both tables on mobile.

### Phase 2: Mobile - Selected, Unprepared
- Add selected state styling for both tables
- Mobile only (< 768px)
- Still ignoring prepared state

### Phase 3: Mobile - Unselected, Prepared
- Add prepared state styling (Spellbook table only)
- Mobile only (< 768px)

### Phase 4: Mobile - Selected, Prepared
- Add selected+prepared state styling (Spellbook table only)
- Mobile only (< 768px)

### Phase 5: Desktop (≥768px) - Unselected, Unprepared
- Repeat Phase 1 for desktop breakpoint

### Phase 6: Desktop (≥768px) - Selected, Unprepared
- Repeat Phase 2 for desktop breakpoint

### Phase 7: Desktop (≥768px) - Unselected, Prepared
- Repeat Phase 3 for desktop breakpoint

### Phase 8: Desktop (≥768px) - Selected, Prepared
- Repeat Phase 4 for desktop breakpoint

---

**Current Phase: Phase 1 - Mobile Base Styling for Unselected, Unprepared rows**

## Phase 1 Target State

### Desired Mobile Base Row Styling (< 768px)
Both tables should have:
- `border: 1px solid light-dark(...)`
- `border-left: 4px solid var(--color-primary)`
- Same background, padding, border-radius, etc.

### Current Issue
Browse Spells table (.spell-table) has correct styling.
Spellbook Detail table (.spellbook-table) has transparent borders being applied by mystery CSS.
