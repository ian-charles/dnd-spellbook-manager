# Components

## Purpose
React UI components for the D&D Spellbook Manager. Components are organized by feature and follow a composition pattern with shared components extracted for reusability.

## Key Files

### Main View Components
- **[App.tsx](../App.tsx)**: Root component, routing between Browse/Spellbooks views
- **[SpellTable.tsx](SpellTable.tsx)**: Sortable table view of spells with expandable rows
- **[SpellbookList.tsx](SpellbookList.tsx)**: Grid of spellbook cards
- **[SpellbookDetail.tsx](SpellbookDetail.tsx)**: Detail view showing spells in a spellbook

### Shared Components
- **[ExpandableSpellRow.tsx](ExpandableSpellRow.tsx)**: Expandable row showing full spell details
- **[SortIcon.tsx](SortIcon.tsx)**: Sort direction indicator (⇅, ↑, ↓)
- **[FilterPanel.tsx](FilterPanel.tsx)**: Multi-select filters for level, school, class, etc.

## Component Architecture

### Composition Pattern
Components are composed from smaller pieces rather than being monolithic:

```
SpellTable
├── SortIcon (column headers)
└── ExpandableSpellRow (per spell)
```

###  Controlled vs Uncontrolled
- **Controlled**: FilterPanel, SpellTable sorting (state managed by parent)
- **Uncontrolled**: ExpandableSpellRow expansion state (internal)

## Design Decisions

### Decision: Expandable rows instead of modal dialogs
- **Rationale**: Better UX for quick spell reference without losing context
- **Tradeoff**: More complex CSS, but better accessibility (keyboard navigation)

### Decision: Extract SortIcon component
- **Rationale**: Used in both SpellTable and SpellbookDetail, ensures consistency
- **Before**: Inline component defined separately in each file (~10 lines duplicated)
- **After**: Single source of truth

### Decision: Table view only (removed card view)
- **Rationale**: Table is more space-efficient and supports sorting/filtering better
- **Previous**: Had SpellList component with card layout (deleted as unused)

## Props Patterns

### Common Patterns
- **Callback props**: Prefix with `on` (e.g., `onSpellClick`, `onFilterChange`)
- **Data props**: Plain names (e.g., `spells`, `spellbooks`)
- **Optional callbacks**: Use `?:` for features that may not be available

Example:
```typescript
interface SpellTableProps {
  spells: Spell[];                                    // Required data
  onAddToSpellbook?: (spellId: string) => void;     // Optional action
}
```

## CSS Organization

Each component has a corresponding CSS file:
- **Component-specific**: `.spell-table`, `.spellbook-list`
- **Shared utilities**: `.btn-primary`, `.badge-concentration`
- **BEM-like naming**: `.spell-table-container`, `.spell-row--expanded`

## Testing

E2E tests in `src/e2e/`:
- `spell-tooltip.test.ts`: Expandable row interactions
- `spell-sorting.test.ts`: Table sorting functionality
- `spellbook-management.test.ts`: CRUD operations
