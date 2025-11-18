# Technical Debt

This document tracks known technical debt, code quality issues, and refactoring opportunities in the D&D Spellbook Manager codebase.

## Active Technical Debt

### Magic Strings Should Be Constants
**Location - App.tsx**:
- Line 94: "✓ Spell added to spellbook!" (toast message)
- Line 100: "Failed to Add Spell" (alert title)
- Line 111: "Loading spells from the archive..." (loading message)
- Line 122: "Error loading spells" (error heading)
- Line 203: "✓ Spell added to spellbook!" (DUPLICATE - toast JSX)

**Location - SpellbookList.tsx**:
- Line 52: "Creation Failed", "Failed to create spellbook. Please try again."
- Line 68: "Delete Failed", "Failed to delete spellbook. Please try again."
- Line 84: "Export Failed", "Failed to export spellbooks. Please try again."
- Line 108: "Import Completed with Errors", "Imported:", "Skipped:", "Errors:"
- Line 119: "Import Successful"
- Line 130: "Import Failed", "Failed to import spellbooks:"
- Line 148: "Loading spellbooks..."
- Line 161: "Export", "No spellbooks to export", "Export all spellbooks"
- Line 169: "Import"
- Line 191: "You don't have any spellbooks yet.", 'Click "New Spellbook" to create your first one!'
- Line 220: "Create New Spellbook"
- Line 224: "Spellbook Name"
- Line 229: "e.g., My Wizard Spells"

**Location - SpellbookDetailView.tsx**:
- Line 66: "Loading spellbook..."

**Issue**: User-facing messages hardcoded as magic strings throughout the codebase (20+ locations)

**Impact**: 20+ locations across 3 files, inconsistency risk, harder to maintain, i18n support would require finding all hardcoded strings, App.tsx:203 duplicates line 94

**Solution**: Create constants file for user messages (e.g., `src/constants/messages.ts` or `src/constants/ui.ts`) with:
```typescript
export const MESSAGES = {
  LOADING: {
    SPELLS: 'Loading spells from the archive...',
    SPELLBOOKS: 'Loading spellbooks...',
    SPELLBOOK: 'Loading spellbook...',
  },
  SUCCESS: {
    SPELL_ADDED: '✓ Spell added to spellbook!',
  },
  // etc...
};
```

**Effort**: Low (30-45 minutes)

**Priority**: Medium - Improves maintainability and sets foundation for future i18n support

---

### Inline Loading State JSX
**Location**:
- [src/components/SpellbookList.tsx:176-178](src/components/SpellbookList.tsx#L176) - Import button loading state
- [src/components/SpellbookList.tsx:281-283](src/components/SpellbookList.tsx#L281) - Create button loading state

**Issue**: Loading button content duplicated inline across components

**Impact**: 2 locations with duplicated pattern `<LoadingSpinner size="small" inline /> Text...`, inconsistent loading UI pattern

**Solution**: Extract to reusable component or helper function:
```typescript
// Option 1: LoadingButton component
<LoadingButton loading={importing} loadingText="Importing..." onClick={handleImport}>
  Import
</LoadingButton>

// Option 2: Helper function
{renderButtonContent(importing, 'Import', 'Importing...')}
```

**Effort**: Low (1 hour)

**Priority**: Medium - Reduces duplication, improves consistency

---

## Completed Refactoring

### ✅ E2E Test Updates & Mobile Expansion Fix (Completed 2025-11-15)
- **Updated**: All 6 E2E test files with new CSS class names and scroll behavior
- **Fixed**: React Fragment key warning in [src/components/SpellTable.tsx](src/components/SpellTable.tsx:88)
- **Changes**:
  - Replaced all `.spell-expanded-row` with `.spell-expansion-row`
  - Replaced all `.spell-expanded-content` with `.spell-inline-expansion`
  - Added `scrollIntoView()` calls before clicking elements in tests
  - Added proper `Fragment` component with `key` prop to fix React warning
- **Result**: Mobile expansion now works correctly, all tests updated with realistic user behavior
- **Deployed**: Production revision dnd-spellbook-00015-2m5

### ✅ Desktop Spell Expansion Restructure (Completed 2025-11-15)
- **Changed**: [src/components/SpellTable.tsx](src/components/SpellTable.tsx) and [src/components/SpellTable.css](src/components/SpellTable.css)
- **What**: Restructured desktop spell expansion from inline element to separate table row with colspan
- **Why**: Fixed layout issues where expansion was either too wide (2809px) or too narrow (232px)
- **Result**:
  - Expansion now spans full table width (1167px on 1920px viewport)
  - 4-column grid layout for spell details
  - Light/dark mode colors using CSS variables
  - Clean, professional appearance
- **Deployed**: Production revision dnd-spellbook-00014-hhm

### ✅ Spell Formatting Utilities (Completed 2025-11-14)
- **Created**: [src/utils/spellFormatters.ts](src/utils/spellFormatters.ts)
- **Eliminated**: ~51 lines of duplicate code across 3 components
- **Functions**: `getLevelText`, `getComponentsText`, `getComponentsWithMaterials`, `filterClasses`

### ✅ Removed Unused Hooks (Completed 2025-11-14)
- **Removed from** [src/hooks/useSpells.ts](src/hooks/useSpells.ts):
  - `useSpellSearch` - 15 lines
  - `useSpell` - 20 lines
- **Removed from** [src/hooks/useSpellbooks.ts](src/hooks/useSpellbooks.ts):
  - `useSpellbook` - 84 lines
- **Total eliminated**: 119 lines of unused code

### ✅ Sorting Logic Refactoring (Completed 2025-11-14)
- **Created**: [src/hooks/useSpellSorting.ts](src/hooks/useSpellSorting.ts)
- **Updated**: [src/components/SpellTable.tsx](src/components/SpellTable.tsx), [src/components/SpellbookDetail.tsx](src/components/SpellbookDetail.tsx)
- **Eliminated**: ~90 lines of duplicate sorting code
- **Features**: Generic hook supporting both `Spell[]` and enriched spell arrays with `useMemo` optimization

### ✅ SortIcon Component Extraction (Completed 2025-11-14)
- **Created**: [src/components/SortIcon.tsx](src/components/SortIcon.tsx) and [src/components/SortIcon.css](src/components/SortIcon.css)
- **Updated**: [src/components/SpellTable.tsx](src/components/SpellTable.tsx), [src/components/SpellbookDetail.tsx](src/components/SpellbookDetail.tsx)
- **Eliminated**: ~10 lines of duplicate component code
- **Benefit**: Consistent sort icons across all sortable tables

### ✅ Type Safety Improvements in SpellbookDetail (Completed 2025-11-14)
- **Updated**: [src/components/SpellbookDetail.tsx](src/components/SpellbookDetail.tsx)
- **Changes**:
  - Created `EnrichedSpell` interface to replace `any` types
  - Changed `spellbook` state from `any` to `Spellbook | null`
  - Added proper type predicate in `.filter()` using `entry is EnrichedSpell`
  - Removed all unsafe `any` types from the component
- **Benefit**: Full TypeScript type checking, better IDE support, reduced runtime error risk

### ✅ Removed Dead Code (Completed 2025-11-14)
- **Deleted**: [src/components/SpellList.tsx](src/components/SpellList.tsx) and [src/components/SpellList.css](src/components/SpellList.css) (~90 lines)
- **Removed**: `onSpellClick` prop from [src/components/SpellTable.tsx](src/components/SpellTable.tsx) and [src/App.tsx](src/App.tsx)
- **Removed**: `handleSpellClick` function from [src/App.tsx](src/App.tsx) (stub with console.log only)
- **Total eliminated**: ~95 lines of unused code
- **Benefit**: Cleaner codebase, reduced maintenance burden, clearer API

---

## Code Quality Warnings

### Test Warnings
- **React act() warnings**: Tests have warnings about state updates not being wrapped in `act()`. These are cosmetic and don't affect functionality, but should be addressed for cleaner test output.
- **Location**: [src/hooks/useSpellbooks.test.ts](src/hooks/useSpellbooks.test.ts)
- **Priority**: Low

---

## Future Considerations (Someday/Maybe)

### Spell Notes Feature
- **Status**: Schema supports it, UI exists, but deprioritized for v1
- **Location**: Schema in [src/types/spellbook.ts](src/types/spellbook.ts), UI in various components
- **Decision**: Keep in schema for future, but don't invest in UX improvements for v1

---

## Guidelines for Updating This Document

1. **When adding tech debt**: Include location, issue description, impact, proposed solution, effort estimate, and priority
2. **When completing refactoring**: Move item to "Completed Refactoring" section with completion date
3. **When discovering new debt**: Add it immediately to prevent forgetting
4. **Priority levels**:
   - **High**: Affects code quality significantly, high duplication, or high change risk
   - **Medium**: Moderate impact, would improve codebase but not urgent
   - **Low**: Nice to have, minor improvements

---

*Last Updated: 2025-11-17*
