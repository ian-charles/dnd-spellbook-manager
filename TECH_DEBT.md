# Technical Debt

This document tracks known technical debt, code quality issues, and refactoring opportunities in the D&D Spellbook Manager codebase.

## Active Technical Debt

### Code Duplication

#### 1. Sorting Logic Duplication (~90 lines)
**Location**: [SpellTable.tsx:105-150](src/components/SpellTable.tsx#L105-L150), [SpellbookDetail.tsx:70-115](src/components/SpellbookDetail.tsx#L70-L115)

**Issue**: Nearly identical sorting logic exists in both `SpellTable` and `SpellbookDetail` components. This includes:
- Sort state management (sortColumn, sortDirection)
- handleSort function (~15 lines)
- Sorting comparator logic (~30 lines)
- Sort UI rendering

**Impact**:
- ~90 lines of duplicated code
- Changes to sorting behavior require updates in multiple places
- Inconsistent sorting behavior risk

**Proposed Solution**: Create a `useSpellSorting` custom hook that encapsulates:
- Sort state (column, direction)
- Sort handler function
- Sorted data computation
- Return sorted data and sort control props

**Effort**: Medium (2-3 hours)
**Priority**: High

---

#### 2. SortIcon Component Duplication
**Location**: [SpellTable.tsx:187-196](src/components/SpellTable.tsx#L187-L196), [SpellbookDetail.tsx:152-161](src/components/SpellbookDetail.tsx#L152-L161)

**Issue**: Identical `SortIcon` inline component defined in both files.

**Impact**:
- ~10 lines duplicated
- Visual inconsistency risk
- Harder to update sort indicators

**Proposed Solution**: Extract to `src/components/SortIcon.tsx` as a shared component.

**Effort**: Low (30 minutes)
**Priority**: Medium

---

### Type Safety Issues

#### 3. Unsafe 'any' Types in SpellbookDetail
**Location**: [SpellbookDetail.tsx](src/components/SpellbookDetail.tsx)

**Issue**: Several uses of `any` type that bypass TypeScript's type checking.

**Impact**:
- Loss of type safety
- Potential runtime errors
- Reduced IDE autocomplete support

**Proposed Solution**:
- Define proper types for all values
- Use union types where appropriate
- Add proper type guards if needed

**Effort**: Low (1 hour)
**Priority**: Medium

---

### Unclear/Unused Functionality

#### 4. onSpellClick Prop - Defined But Never Used
**Location**: [SpellTable.tsx:11](src/components/SpellTable.tsx#L11)

**Issue**: `onSpellClick?: (spell: Spell) => void` prop is defined in the interface but never passed from any parent component. No functionality exists for clicking spells.

**Impact**:
- Dead code
- Confusing API
- Unclear feature expectations

**Proposed Solution**: Either:
1. Remove the prop entirely (preferred for v1)
2. Implement spell click functionality if needed

**Decision Required**: Ask user if spell clicking should be a feature

**Effort**: Low (30 minutes to remove)
**Priority**: Low

---

## Completed Refactoring

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

*Last Updated: 2025-11-14*
