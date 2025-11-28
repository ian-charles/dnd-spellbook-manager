# Technical Debt

This document tracks known technical debt, code quality issues, and refactoring opportunities in the D&D Spellbook Manager codebase.

## Active Technical Debt


### User has no feedback during potentially long copy operations
**Location**: src/components/SpellbookList.tsx:118-149
**Issue**: User has no feedback during potentially long copy operations
**Priority**: High
**Solution**: Add loading state and show progress indicator during copy operation
**Effort**: Medium (1 hour)








### Completed Refactoring
- [x] **Missing unit tests for App.tsx** (High) - Created `src/App.test.tsx` with comprehensive tests.
- [x] **Missing JSDoc for App.tsx** (Medium) - Added JSDoc to `src/App.tsx`.
- [x] **Complex state management** (Medium) - Refactored mutation logic to `useSpellbookMutations` hook.
- [x] **Missing error message for failed spell additions** (Medium) - Fixed in `useSpellbookMutations`.
- [x] **No cleanup for createModalOpen state** (Medium) - Fixed in `useSpellbookMutations`.
- [x] **Duplicate toast display logic** (Medium) - Centralized in `useSpellbookMutations`.
- [x] **Complex handlers** (Medium) - Extracted to `useSpellbookMutations`.
- [x] **Finally block logic** (Medium) - Fixed in `useSpellbookMutations`.
- [x] **Missing Unicode test for dice notation** (Medium) - Added test in `src/components/SpellDescription.test.tsx`.
- [x] **Missing multiple tables test** (Medium) - Added test in `src/components/SpellDescription.test.tsx`.
- [x] **Missing JSDoc for SpellDescription component** (Medium) - Added JSDoc in `src/components/SpellDescription.tsx`.
- [x] **Hardcoded dice types in SpellDescription regex** (Medium) - Documented as maintainability issue above.

### Git Hooks Setup No Verification of Executable Permissions
**Location**: scripts/setup-git-hooks.js:52-60
**Issue**: No verification that chmod actually made files executable
**Priority**: Medium
**Solution**: Use stat() to verify file permissions
**Effort**: Low (10 minutes)

### Missing JSDoc for complex state management in SpellbookList
**Location**: src/components/SpellbookList.tsx (copyData, contextMenu states)
**Issue**: Complex state objects lack documentation explaining their purpose
**Priority**: Medium
**Solution**: Add JSDoc comments
**Effort**: Low (15 minutes)

### Magic number for touch movement threshold
**Location**: src/components/spellbook-detail/SpellbookSpellsTable.tsx:handleTouchMove
**Issue**: Magic number 10 without explanation
**Priority**: Medium
**Solution**: Extract to named constant TOUCH_MOVE_THRESHOLD
**Effort**: Low (5 minutes)

### Duplicate long-press logic (~40 lines)
**Location**: src/components/SpellbookList.tsx and src/components/spellbook-detail/SpellbookSpellsTable.tsx
**Issue**: Identical long-press handling code in two components
**Priority**: Medium
**Solution**: Extract to useLongPress custom hook
**Effort**: Medium (1 hour)

### Magic number for long-press duration
**Location**: src/components/SpellbookList.tsx:259, src/components/spellbook-detail/SpellbookSpellsTable.tsx:33
**Issue**: Magic number 500 without explanation
**Priority**: Medium
**Solution**: Extract to LONG_PRESS_DURATION constant
**Effort**: Low (5 minutes)



### Missing input validation in E2E helpers
**Location**: src/e2e/helpers.ts
**Issue**: Several helper functions don't validate inputs before using them
**Priority**: High
**Solution**: Add validation for inputs like spellIndex
**Effort**: Low (30 minutes)



### Missing accessibility labels in SpellbookList
**Location**: src/components/SpellbookList.tsx (Copy and Delete buttons)
**Issue**: Action buttons lack aria-label attributes for screen readers
**Priority**: Medium
**Solution**: Add aria-label attributes
**Effort**: Low (10 minutes)
























### Vague Assertion in SpellbookDetailView Tests
**Location**: src/components/SpellbookDetailView.test.tsx:69
**Issue**: Assertion uses magic number 3 without explanation.
**Priority**: Medium
**Solution**: Add error message.
**Effort**: Low (5 minutes)



---

## Completed Refactoring

### ✅ Missing upper bound validation in E2E helpers (Completed 2025-11-27)
- **Fixed**: Added validation checks to helper functions
- **Result**: Robust input handling

### ✅ Missing error messages in SpellTable test assertions (Completed 2025-11-27)
- **Fixed**: Added descriptive error messages to assertions
- **Result**: Easier debugging

### ✅ Missing error messages in E2E test assertions (Completed 2025-11-27)
- **Fixed**: Added descriptive error messages to assertions
- **Result**: Easier debugging

### ✅ Magic number 7 without explanation in SpellTable tests (Completed 2025-11-27)
- **Fixed**: Added descriptive error message explaining colspan
- **Result**: Clearer test intent

### ✅ Fragile test assertions using exact string matching (Completed 2025-11-27)
- **Fixed**: Updated assertions to be more robust
- **Result**: Less flaky tests

### ✅ Missing test for displayTitle empty string edge case (Completed 2025-11-27)
- **Fixed**: Added test case to `CreateSpellbookModal.test.tsx`
- **Result**: Edge case covered by unit test

### ✅ Missing comprehensive validation tests for CreateSpellbookModal (Completed 2025-11-27)
- **Fixed**: Added comprehensive tests for duplicate names, ability selection, and numeric ranges
- **Result**: Full validation coverage

### ✅ Missing file-level JSDoc in CreateSpellbookModal.test.tsx (Completed 2025-11-27)
- **Fixed**: Added file-level JSDoc explaining testing strategy
- **Result**: Improved documentation

### ✅ Testid naming inconsistency (Completed 2025-11-27)
- **Fixed**: Updated `src/e2e/config.ts` to match component implementation
- **Result**: Consistent testid naming

### ✅ Unit Tests for SpellbookList Component (Completed 2025-11-18)
- **Created**: [src/components/SpellbookList.test.tsx](src/components/SpellbookList.test.tsx) with 28 comprehensive unit tests
- **Test Coverage**:
  - Loading states (spinner display)
  - Empty state rendering (no spellbooks message)
  - Spellbook list display with correct data (name, spell count, prepared count)
  - Create spellbook flow (happy path, validation, error handling)
  - Delete spellbook flow (confirmation dialog, cancellation)
  - Import spellbooks (success, failure cases, file handling)
  - Export spellbooks (success, disabled when empty)
  - Dialog state management (create, confirm delete, alerts)
  - File input handling (hidden input, proper MIME types, reset after import)
  - Input validation and clearing
- **Result**: Component went from 0% to full unit test coverage, addressing critical technical debt from pre-commit hook review. All 28 tests passing with no skipped tests.

### ✅ Unit Tests for useSpellSorting Hook + Secondary Sort (Completed 2025-11-18)
- **Created**: [src/hooks/useSpellSorting.test.ts](src/hooks/useSpellSorting.test.ts) with 23 comprehensive tests
- **Updated**: [src/hooks/useSpellSorting.ts](src/hooks/useSpellSorting.ts#L100-L105) - added secondary sort by name
- **Test Coverage**:
  - Default sorting behavior (name ascending)
  - Sort direction toggling on same column
  - Column switching resets to ascending
  - Custom `getSpell` extractor with enriched objects
  - Edge cases (empty array, single item, duplicates)
  - Secondary sort by name for all columns
  - Reactive updates when data changes
- **Feature Enhancement**: All sorts now use spell name as tiebreaker (always ascending)
- **Result**: Hook fully tested with 23 unit tests, improved UX with consistent alphabetical tiebreakers



### ✅ Comprehensive JSDoc for LoadingButton (Completed 2025-11-18)
- **Updated**: [src/components/LoadingButton.tsx:11-28](src/components/LoadingButton.tsx#L11) - comprehensive JSDoc for all props
- **Changes**:
  - Added detailed documentation explaining loading prop disables button and shows spinner
  - Documented that loadingText replaces children when loading is true
  - Clarified children prop is hidden during loading state
  - Improved developer experience with clear prop interaction documentation
- **Result**: Developers can now understand full component behavior without reading implementation

### ✅ Git Hooks Added to Repository (Completed 2025-11-18)
- **Created**: [scripts/git-hooks/pre-commit](scripts/git-hooks/pre-commit) - AI code review + test runner
- **Created**: [scripts/git-hooks/post-commit](scripts/git-hooks/post-commit) - auto-push to remote
- **Created**: [scripts/setup-git-hooks.sh](scripts/setup-git-hooks.sh) - automated setup script
- **Changes**:
  - Git hooks now tracked in repository at `scripts/git-hooks/`
  - Setup script copies hooks to `.git/hooks/` and makes them executable
  - Team members can run `./scripts/setup-git-hooks.sh` after cloning
- **Result**: Consistent git workflow automation across all developers

### ✅ Magic Strings Extracted to Constants (Completed 2025-11-17)
- **Created**: [src/constants/messages.ts](src/constants/messages.ts) with 60+ message constants
- **Updated**: [src/App.tsx](src/App.tsx) - 8 magic strings replaced
- **Updated**: [src/components/SpellbookList.tsx](src/components/SpellbookList.tsx) - 13 magic strings replaced
- **Updated**: [src/components/SpellbookDetailView.tsx](src/components/SpellbookDetailView.tsx) - 4 magic strings replaced
- **Eliminated**: 25+ hardcoded UI messages across 3 components
- **Eliminated**: Duplicate "✓ Spell added to spellbook!" at App.tsx:203
- **Removed**: Change detector tests (anti-pattern) - constants don't need tests that just verify string equality
- **Result**: Single source of truth for all user-facing text, foundation for i18n, type-safe message access

### ✅ Inline Loading JSX Extracted to LoadingButton Component (Completed 2025-11-17)
- **Created**: [src/components/LoadingButton.tsx](src/components/LoadingButton.tsx) - reusable loading button component
- **Created**: [src/components/LoadingButton.test.tsx](src/components/LoadingButton.test.tsx) with 15 unit tests
- **Updated**: [src/components/SpellbookList.tsx](src/components/SpellbookList.tsx) - 2 inline loading JSX patterns refactored
- **Eliminated**: Duplicated `<LoadingSpinner size="small" inline /> Text...` pattern at 2 locations
- **Fixed**: Refactored 2 tests to test behavior instead of implementation details (CSS classes)
- **Result**: DRY principle applied, single source of truth for loading button UI, consistent loading UX, TDD best practices followed
- **Test Results**: 466/466 tests passing (15 new tests for LoadingButton)
- **Known Issues**: 1 remaining medium-priority tech debt item (missing comprehensive JSDoc)

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

### ✅ Race condition in spell copying (Completed 2025-11-26)
- **Fixed**: Added try-finally block to `handleCreateSpellbook` in `SpellbookList.tsx`
- **Result**: `onRefreshSpellbooks` is always called

### ✅ Testid naming inconsistency (Completed 2025-11-26)
- **Fixed**: Updated `src/e2e/config.ts` to use `spellbook-name-input`
- **Result**: Consistent testids across components and tests

- [x] **Skipped Flaky E2E Tests** (Completed 2025-11-26)
- **Updated**: [src/e2e/spell-sorting.test.ts](src/e2e/spell-sorting.test.ts)
- **Fixed**: Updated selectors to target new button-based headers
- **Result**: All sorting tests passing reliably
- **Benefit**: Restored confidence in sorting functionality

### ✅ Hardcoded Timeout Values in E2E Tests (Completed 2025-11-26)
- **Fixed**: Replaced all hardcoded timeouts with `TIMEOUTS` constants in all E2E test files
- **Result**: Consistent timeout management and easier maintenance

### ✅ Missing input validation in E2E helpers (Completed 2025-11-26)
- **Fixed**: Added validation for non-negative indices in `src/e2e/helpers.ts`
- **Result**: More robust helper functions and clearer error messages

### ✅ Poor error messages in SpellTable tests (Completed 2025-11-26)
- **Fixed**: Added descriptive error messages to assertions in `SpellTable.test.tsx`
- **Result**: Easier debugging of test failures

### ✅ Removed Dead Code (Completed 2025-11-14)
- **Deleted**: [src/components/SpellList.tsx](src/components/SpellList.tsx) and [src/components/SpellList.css](src/components/SpellList.css) (~90 lines)
- **Removed**: `onSpellClick` prop from [src/components/SpellTable.tsx](src/components/SpellTable.tsx) and [src/App.tsx](src/App.tsx)
- **Removed**: `handleSpellClick` function from [src/App.tsx](src/App.tsx) (stub with console.log only)
- **Total eliminated**: ~95 lines of unused code
- **Benefit**: Cleaner codebase, reduced maintenance burden, clearer API


### ✅ Magic numbers in E2E timeout usage (Completed 2025-11-26)
- **Fixed**: Replaced hardcoded timeouts with `TIMEOUTS` constants in all E2E test files
- **Result**: Consistent timeout management

### ✅ Inconsistent error messages in SpellTable tests (Completed 2025-11-26)
- **Fixed**: Added descriptive error messages to assertions in `SpellTable.test.tsx`
- **Result**: Easier debugging of test failures

### ✅ Test file missing strategy documentation (Completed 2025-11-26)
- **Fixed**: Added file-level JSDoc to `SpellbookList.test.tsx`
- **Result**: Clearer testing strategy documentation
### ✅ Missing JSDoc for SpellDescription usage (Completed 2025-11-28)
- **Fixed**: Added JSDoc to `SpellDescription` usage in `SpellTable.tsx` and `SpellbookDetailView.tsx`
- **Result**: Improved code documentation

### ✅ E2E Testing Cleanup (Completed 2025-11-28)
- **Fixed**: Removed all E2E tests and related configuration as per user request
- **Result**: Simplified project structure and removed maintenance burden of flaky E2E tests

### ✅ Missing Test Coverage for Error Paths in App.test.tsx (Completed 2025-11-28)
- **Fixed**: Added error handling tests for `handleCreateSpellbook`
- **Result**: Improved test coverage for error scenarios

### ✅ Test Environment Inconsistency (Completed 2025-11-28)
- **Fixed**: Updated `vitest.config.ts` to use `jsdom` environment globally
- **Result**: Consistent test environment for React components

### ✅ Potential memory leak in SpellTable expansion state (Completed 2025-11-28)
- **Fixed**: Added logic to reset `expandedSpellId` when `spells` prop changes
- **Result**: Prevented potential memory leaks

### ✅ Unclear assertion in SpellbookList.test.tsx (Completed 2025-11-28)
- **Fixed**: Clarified assertion for N/A values
- **Result**: Clearer test intent

### ✅ Missing JSDoc for SortIcon usage (Completed 2025-11-28)
- **Fixed**: Added JSDoc to `SortIcon` component
- **Result**: Improved documentation

### ✅ Missing test for displayTitle empty string edge case (Completed 2025-11-28)
- **Fixed**: Confirmed existing test coverage in `CreateSpellbookModal.test.tsx`
- **Result**: Verified edge case coverage

### ✅ Magic number 7 without explanation in SpellTable tests (Completed 2025-11-28)
- **Fixed**: Added comment explaining the magic number
- **Result**: Improved test readability

### ✅ Inconsistent Checkbox State Management in SpellTable (Completed 2025-11-28)
- **Fixed**: Updated checkbox rendering logic to rely on `onSelectionChange`
- **Result**: Consistent UI state

### ✅ Hardcoded Claude CLI Path (Completed 2025-11-28)
- **Fixed**: Updated `pre-commit-review` to use `CLAUDE_CODE_BIN` env var
- **Result**: Improved flexibility

### ✅ Silent Ed Command Failures (Completed 2025-11-28)
- **Fixed**: Added logging for `ed` command failures
- **Result**: Better debugging for git hooks

### ✅ Mobile Breakpoint Documentation (Completed 2025-11-28)
- **Fixed**: Added comment explaining mobile breakpoint
- **Result**: Improved documentation

### ✅ Cross-Platform Temp File Path (Completed 2025-11-28)
- **Fixed**: Updated `pre-commit` to use `TMPDIR`
- **Result**: Improved cross-platform compatibility

### ✅ Process Cleanup Race Condition (Completed 2025-11-28)
- **Fixed**: Added `wait` command in `pre-commit` cleanup
- **Result**: More robust process termination

### ✅ Git Hooks Missing Inline Documentation (Completed 2025-11-28)
- **Fixed**: Added inline comments to `setup-git-hooks.js`
- **Result**: Improved code readability

### ✅ Post-Commit Hook Missing Remote Check (Completed 2025-11-28)
- **Fixed**: Added check for git remote in `post-commit`
- **Result**: Prevented errors when no remote is configured

### ✅ Git Hooks Setup No Verification of Executable Permissions (Completed 2025-11-28)
- **Fixed**: Added verification logic to `setup-git-hooks.js`
- **Result**: More robust hook installation
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

*Last Updated: 2025-11-18*
