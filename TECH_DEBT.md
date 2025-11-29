# Technical Debt

This document tracks known technical debt, code quality issues, and refactoring opportunities in the D&D Spellbook Manager codebase.

## Active Technical Debt











### High Priority


### Medium Priority


#### Missing Virtualization for SpellTable
**Location**: src/components/SpellTable.tsx
**Issue**: Renders all spells in the DOM.
**Impact**: Performance degradation as spell list grows (currently ~400 spells).
**Solution**: Implement `react-virtuoso` or similar windowing library.
**Effort**: Medium (2-3 hours)
**Priority**: Medium

- src/hooks/useSpellbookOperations.ts:18-32
- src/hooks/useSpellbookListState.ts:13-18  
- src/hooks/useDialogs.ts:22-30
**Issue**: JSDoc missing or incomplete @returns documentation
**Impact**: Developers must read implementation to understand return values
**Solution**: Add complete @returns documentation listing all returned properties
**Effort**: Low (30 minutes)
**Priority**: Medium

#### Missing Edge Case Test Coverage (~3 hooks)
**Location**:
- src/hooks/useDialogs.test.ts
- src/hooks/useLongPress.test.ts
- src/hooks/useSpellbookListState.test.ts
**Issue**: Tests only cover happy paths, missing edge cases and error scenarios
**Impact**: Edge case bugs may not be caught until production
**Solution**: Add tests for: multiple rapid calls, boundary conditions, cleanup verification, null/undefined handling
**Effort**: Medium (2-3 hours)
**Priority**: Medium

#### Missing Error Path Tests in useSpellbookOperations
**Location**: src/hooks/useSpellbookOperations.test.ts
**Issue**: No tests for failure scenarios (createSpellbook failure, invalid JSON import, etc.)
**Impact**: Error handling code is untested, may fail in production
**Solution**: Add tests for all async operation failures and error paths
**Effort**: Medium (2-3 hours)
**Priority**: Medium

#### Hardcoded UI Strings Not Yet in Constants
**Location**: 
- src/hooks/useSpellbookOperations.ts:124 (" (Copy)" suffix)
- src/components/SpellbookList.test.tsx:51 ('INT' magic string)
**Issue**: Some UI strings and test constants still hardcoded
**Impact**: Inconsistent i18n readiness, harder to maintain
**Solution**: Extract to MESSAGES constant or test constants
**Effort**: Low (15 minutes)
**Priority**: Medium

#### Potential Race Condition in Copy Progress Counter
**Location**: src/hooks/useSpellbookOperations.ts:70-95
**Issue**: `processedSpellCount` mutated in parallel Promise.allSettled callbacks
**Impact**: Works but fragile, could break with future refactoring
**Solution**: Use atomic counter or track results differently
**Effort**: Low (30 minutes)
**Priority**: Medium

#### Unbounded Spellbook Name Length
**Location**: src/components/CreateSpellbookModal.tsx
**Issue**: No maximum length validation for spellbook names
**Impact**: Users can create spellbooks with extremely long names, potentially breaking UI layout or causing performance issues
**Solution**: Add maxLength validation (e.g., 50-100 chars) to input and schema
**Effort**: Low (30 minutes)
**Priority**: Medium

#### Unsafe Large File Import
**Location**: src/hooks/useSpellbookOperations.ts:180
**Issue**: `file.text()` and `JSON.parse()` load entire file into memory without size checks
**Impact**: Large files (e.g., >50MB) could crash the browser tab (DoS risk)
**Solution**: Add file size check before reading (e.g., max 5MB)
**Effort**: Low (15 minutes)
**Priority**: Medium

#### Missing Schema Validation for Imports
**Location**: src/services/exportImport.service.ts
**Issue**: Import only checks top-level structure, not individual spellbook shape
**Impact**: Malformed spellbooks (missing spells array, invalid types) can be imported, causing runtime errors later
**Solution**: Use Zod or similar to validate full spellbook schema during import
**Effort**: Medium (2 hours)
**Priority**: Medium

#### No Cancellation for Long Operations
**Location**: src/hooks/useSpellbookOperations.ts
**Issue**: Copying spellbooks with many spells or importing large files cannot be cancelled
**Impact**: User is stuck waiting or has to refresh page to stop
**Solution**: Implement AbortController for async operations and add Cancel button
**Effort**: Medium (3 hours)
**Priority**: Medium

#### State Updates on Unmounted Component
**Location**: src/hooks/useSpellbookOperations.ts:93
**Issue**: `setCopyProgress` called in `finally` block even if component unmounted
**Impact**: "Can't perform a React state update on an unmounted component" console warnings
**Solution**: Add `isMounted` ref check before setting state
**Effort**: Low (30 minutes)
**Priority**: Medium

#### Loose Numeric Parsing in Create Modal
**Location**: src/components/CreateSpellbookModal.tsx
**Issue**: `parseInt` allows trailing non-numeric characters (e.g., "12abc" -> 12)
**Impact**: Users can input invalid formats that are accepted as valid numbers
**Solution**: Use strict regex validation `^\d+$` before parsing
**Effort**: Low (15 minutes)
**Priority**: Medium

#### Lack of Transactional Integrity in Bulk Ops
**Location**: src/hooks/useSpellbookMutations.ts, src/hooks/useSpellbookOperations.ts
**Issue**: Bulk operations (create+copy, add multiple) are not transactional. Partial failure leaves data in inconsistent state.
**Impact**: Users may end up with half-copied spellbooks or partial additions without easy rollback.
**Solution**: Implement rollback logic or use IndexedDB transactions where possible.
**Effort**: High (4-6 hours)
**Priority**: Medium

#### Naive Markdown Table Parsing
**Location**: src/components/SpellDescription.tsx
**Issue**: Table parsing uses simple `split('|')`, which breaks on escaped pipes `\|` within cells.
**Impact**: Spells with complex descriptions containing pipes will render broken tables.
**Solution**: Implement a proper markdown parser or improved regex splitting.
**Effort**: Medium (2 hours)
**Priority**: Low

#### Unbounded Parallel Requests in Bulk Ops
**Location**: src/hooks/useSpellbookMutations.ts
**Issue**: `Promise.allSettled` triggers all requests simultaneously.
**Impact**: Selecting "All Spells" (400+) and adding to a spellbook could freeze the browser or hit storage limits.
**Solution**: Implement batching (e.g., chunks of 10) or sequential processing.
**Effort**: Medium (2 hours)
**Priority**: Medium













#### Console Logs in Production Code
**Location**: src/services/spell.service.ts
**Issue**: Service contains `console.log` and `console.error` statements.
**Impact**: Clutters console in production, not a proper logging solution.
**Solution**: Remove logs or use a proper logging service.
**Effort**: Low (15 minutes)
**Priority**: Low

#### Inline Styles in SpellbookList
**Location**: src/components/SpellbookList.tsx
**Issue**: Context menu uses inline styles for positioning.
**Impact**: Harder to maintain, violates separation of concerns (CSS vs JS).
**Solution**: Move styles to `SpellbookList.css` and use CSS variables or classes.
**Effort**: Low (30 minutes)
**Priority**: Low

#### Direct Hash Manipulation
**Location**: src/components/SpellbookList.tsx
**Issue**: Component directly reads and writes `window.location.hash`.
**Impact**: Fragile routing logic, tightly coupled to hash routing implementation.
**Solution**: Use `useHashRouter` hook or similar abstraction.
**Effort**: Medium (1 hour)
**Priority**: Medium

#### Duplicate Regex Comments
**Location**: src/components/SpellDescription.tsx
**Issue**: Duplicate comments for regex definitions.
**Impact**: Minor code clutter.
**Solution**: Consolidate comments.
**Effort**: Low (5 minutes)
**Priority**: Low



#### Missing Unit Tests for SpellbookListTable
**Location**: src/components/spellbook-list/SpellbookListTable.tsx
**Issue**: Touch event handling and rendering logic is not tested in isolation.
**Impact**: Mobile interactions (swiping/touching) might break.
**Solution**: Create `src/components/spellbook-list/SpellbookListTable.test.tsx`.
**Effort**: Low (1 hour)
**Priority**: Medium

#### Missing Unit Tests for SpellbookListHeader
**Location**: src/components/spellbook-list/SpellbookListHeader.tsx
**Issue**: Header logic (export/import states, button disabling) is not tested in isolation.
**Impact**: UI states might be incorrect.
**Solution**: Create `src/components/spellbook-list/SpellbookListHeader.test.tsx`.
**Effort**: Low (30 minutes)
**Priority**: Medium

#### Missing Unit Tests for Layout
**Location**: src/components/Layout.tsx
**Issue**: Basic layout component lacks tests.
**Impact**: Layout regressions.
**Solution**: Create `src/components/Layout.test.tsx`.
**Effort**: Low (30 minutes)
**Priority**: Medium

### Completed Refactoring
- [x] **Prop Drilling in SpellFilters** (Medium) - Refactored to controlled component using `useFilterReducer` in `App.tsx`.
- [x] **Potential useEffect Dependency Issue in SpellFilters** (Medium) - Removed internal `useEffect` by lifting state.
- [x] **Missing Unit Tests for SpellFilters** (High) - Created `src/components/SpellFilters.test.tsx` with comprehensive tests.
- [x] **Missing JSDoc for SpellFilters** (Medium) - Added comprehensive JSDoc.
- [x] **Magic Numbers in SpellFilters** (Medium) - Extracted `MIN_SPELL_LEVEL` and `MAX_SPELL_LEVEL` constants.
- [x] **Duplicate Expansion Logic** (Low) - Extracted `SpellExpansionRow` component.
- [x] **Missing Accessibility Labels in SpellFilters** (Medium) - Added `aria-label` and `aria-pressed` attributes.
- [x] **Accessibility Issues in CreateSpellbookModal** (Medium) - Implemented focus trap using `useFocusTrap` hook.
- [x] **Race Conditions in Storage Service** (High) - Refactored `storage.service.ts` to use atomic updates.
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






































---

## Completed Refactoring

### ✅ App.tsx Complexity ("God Component") (Completed 2025-11-28)
- **Refactored**: Extracted `BrowseView` component to handle browse view logic.
- **Result**: Reduced `App.tsx` complexity and improved modularity.

### ✅ SpellFilters Performance (No Debounce) (Completed 2025-11-28)
- **Refactored**: Implemented debouncing for search input in `src/components/SpellFilters.tsx`.
- **Result**: Improved performance by reducing re-renders during typing.

### ✅ Coupled UI/Logic in useSpellbookMutations (Completed 2025-11-28)
- **Refactored**: Decoupled UI feedback from mutation logic by using `onSuccess`, `onError`, and `onInfo` callbacks.
- **Result**: Hook is now UI-agnostic and easier to test.

### ✅ Complex Form Logic in CreateSpellbookModal (Completed 2025-11-28)
- **Refactored**: Extracted form logic to `src/hooks/useCreateSpellbookForm.ts`.
- **Result**: Simplified component and improved testability with dedicated hook tests.

### ✅ Incomplete Edge Case Coverage in useSpellSelection (Completed 2025-11-28)
- **Updated**: `src/hooks/useSpellSelection.test.ts`
- **Result**: Added tests for clearing selections and redundant updates.

### ✅ Incomplete Edge Case Coverage in useContextMenu (Completed 2025-11-28)
- **Updated**: `src/hooks/useContextMenu.test.ts` and `src/hooks/useContextMenu.ts`
- **Result**: Added tests for empty touches, negative coordinates, and rapid cycles. Fixed bug with empty touch list.

### ✅ Excessive Use of !important in CSS (Completed 2025-11-28)
- **Refactored**: Removed `!important` from `SpellbookDetail.css` by fixing selector specificity and column hiding logic.
- **Result**: Cleaner CSS that relies on standard cascade rules.

### ✅ Missing File-Level JSDoc in Test Files (Completed 2025-11-28)
- **Updated**: `src/hooks/useContextMenu.test.ts`, `src/hooks/useSpellSelection.test.ts`, `src/utils/spellFormatters.test.ts`
- **Result**: Added clear testing strategies to file headers.

### ✅ Missing Error Messages in Test Assertions (Completed 2025-11-28)
- **Updated**: `src/hooks/useContextMenu.test.ts`, `src/hooks/useSpellSelection.test.ts`, `src/utils/spellFormatters.test.ts`
- **Result**: Assertions now include descriptive error messages for better debugging.

### ✅ Hardcoded Game Rules in CreateSpellbookModal (Completed 2025-11-28)
- **Refactored**: Moved validation limits to `src/constants/gameRules.ts` and updated component and tests.
- **Result**: Single source of truth for game rules.

### ✅ Missing Unit Tests for SpellbookSpellsTable (Completed 2025-11-28)
- **Created**: `src/components/spellbook-detail/SpellbookSpellsTable.test.tsx`
- **Coverage**: Rendering, sorting, row interactions, and mobile context menu behavior (long press, actions).
- **Result**: Critical mobile interactions are now fully tested.

### ✅ Missing Tests for useSpellbookMutations (Completed 2025-11-28)
- **Created**: `src/hooks/useSpellbookMutations.test.ts`
- **Coverage**: Comprehensive tests for `handleAddToSpellbook` (success, partial/total failure, validation) and `handleCreateSpellbook` (success, pending spells, error handling).
- **Result**: Critical mutation logic is now fully tested.

### ✅ Missing Unit Tests for Logic Hooks (Completed 2025-11-28)
- **Created**:
    - `src/hooks/useSpellbookDetailLogic.test.ts`: Covers loading, filtering, sorting, and interactions.
    - `src/hooks/useSpellFiltering.test.ts`: Covers filter state updates and service integration.
    - `src/hooks/useSpellSelection.test.ts`: Covers selection state management.
    - `src/hooks/useContextMenu.test.ts`: Covers mouse/touch events and click-outside behavior.
- **Result**: Core business logic hooks have high test coverage.

### ✅ Missing Unit Tests for Spell Formatters (Completed 2025-11-28)
- **Created**: `src/utils/spellFormatters.test.ts`
- **Coverage**: Tested `getLevelText`, `getComponentsText`, `getComponentsWithMaterials`, and `filterClasses`.
- **Result**: Utility functions are verified correct.

### ✅ Prop Drilling in SpellbookDetailView (Completed 2025-11-28)
- **Refactored**: Implemented `SpellbookDetailContext` and `useSpellbookDetail` hook.
- **Result**: `SpellbookDetailView` now consumes context, significantly reducing prop drilling.

### ✅ Complex Logic in SpellbookDetail Container (Completed 2025-11-28)
- **Refactored**: Extracted logic into `useSpellbookDetailLogic` hook.
- **Result**: `SpellbookDetail` component is cleaner and logic is testable.

### ✅ Inefficient Loop in handleSelectAllPrepared (Completed 2025-11-28)
- **Optimized**: Logic moved to `useSpellbookDetailLogic` and optimized.
- **Result**: Improved performance for bulk operations.

### ✅ Inconsistent Context Menu Logic (Completed 2025-11-28)
- **Refactored**: Created `useContextMenu` hook and applied it to `SpellbookList` and `SpellbookSpellsTable`.
- **Result**: Consistent behavior and reduced code duplication.

### ✅ Complex State Management in App.tsx (Completed 2025-11-28)
- **Refactored**: Extracted state management to `useSpellFiltering` and `useSpellSelection` hooks.
- **Result**: `App.tsx` is simplified and easier to maintain.

### ✅ Inefficient Data Reloading in useSpellbooks (Completed 2025-11-28)
- **Optimized**: Implemented `reloadSpellbook` for partial updates.
- **Result**: Reduced unnecessary data fetching.

### ✅ User has no feedback during potentially long copy operations (Completed 2025-11-28)
- **Fixed**: Added loading state and progress indicator to `SpellbookList.tsx`
- **Result**: Improved UX during copy operations

### ✅ Missing JSDoc for complex state management in SpellbookList (Completed 2025-11-28)
- **Fixed**: Added JSDoc comments to `copyData` and `contextMenu` states
- **Result**: Improved code documentation

### ✅ Missing accessibility labels in SpellbookList (Completed 2025-11-28)
- **Fixed**: Verified that `SpellbookListTable` buttons have `aria-label` attributes
- **Result**: Accessible action buttons

### ✅ Duplicate long-press logic (Completed 2025-11-28)
- **Refactored**: Extracted logic to `src/hooks/useLongPress.ts`
- **Updated**: `SpellbookList.tsx` and `SpellbookSpellsTable.tsx`
- **Result**: DRY principle applied, consistent behavior

### ✅ Magic number for touch movement threshold (Completed 2025-11-28)
- **Fixed**: Moved to default parameter in `useLongPress` hook
- **Result**: Configurable and documented

### ✅ Magic number for long-press duration (Completed 2025-11-28)
- **Fixed**: Moved to default parameter in `useLongPress` hook
- **Result**: Configurable and documented

### ✅ Missing input validation in E2E helpers (Completed 2025-11-28)
- **Fixed**: E2E tests were removed, rendering this obsolete.
- **Result**: N/A

### ✅ Vague Assertion in SpellbookDetailView Tests (Completed 2025-11-28)
- **Fixed**: Verified assertions are clear (checking length of mock arrays).
- **Result**: No action needed.


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
