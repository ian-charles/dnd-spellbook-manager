# Custom Hooks

## Purpose
Reusable React hooks for state management and side effects in the D&D Spellbook Manager. These hooks encapsulate complex logic and provide clean interfaces for components to interact with spell data, spellbooks, and UI state.

## Key Files

- **[useSpells.ts](useSpells.ts)**: Loads and manages spell data from the service layer
  - Handles initial data loading and error states
  - Returns spell list with loading/error status

- **[useSpellbooks.ts](useSpellbooks.ts)**: Full CRUD operations for spellbooks with IndexedDB persistence
  - Create, read, update, delete spellbooks
  - Add/remove spells from spellbooks
  - Toggle prepared status
  - Update spell notes

- **[useSpellSorting.ts](useSpellSorting.ts)**: Generic sorting logic for spell arrays
  - Supports both simple `Spell[]` and enriched objects
  - Manages sort column and direction state
  - Returns memoized sorted data

## Abstractions

### useSpellSorting

Generic hook that accepts any array and extracts spell data for sorting.

**Key Features:**
- **Generic type parameter**: Works with `Spell[]` or enriched objects like `{spell: Spell, prepared: boolean, notes: string}`
- **`getSpell` option**: Function to extract the Spell object from custom types
- **Memoization**: Uses `useMemo` to prevent unnecessary re-sorts
- **Sortable columns**: name, level, school, castingTime, range, duration, source

**Why generic?** Eliminates duplication between SpellTable (sorts `Spell[]`) and SpellbookDetail (sorts enriched spell objects with prepared/notes data).

## Design Decisions

### Decision: Use `useMemo` for sorting
- **Rationale**: Prevent expensive re-sorts on every render. Sorting only happens when data, sortColumn, or sortDirection changes.
- **Tradeoff**: Small memory overhead for memoized array, but significant performance gain for large spell lists.

### Decision: Generic useSpellSorting instead of two separate hooks
- **Rationale**: DRY principle - avoid maintaining identical sorting logic in multiple places
- **Tradeoff**: Slightly more complex interface (requires `getSpell` parameter for enriched objects), but eliminates ~90 lines of duplicate code

### Decision: Hooks return object with named properties, not arrays
- **Rationale**: More readable at call site (`const { sortedData, handleSort } = ...`) and allows adding new return values without breaking existing code
- **Tradeoff**: Slightly more verbose than array destructuring

## Usage Examples

### useSpells

```typescript
import { useSpells } from './hooks/useSpells';

function BrowseTab() {
  const { spells, loading, error } = useSpells();

  if (loading) return <div>Loading spells...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <SpellTable spells={spells} />;
}
```

### useSpellbooks

```typescript
import { useSpellbooks } from './hooks/useSpellbooks';

function SpellbooksTab() {
  const {
    spellbooks,
    createSpellbook,
    deleteSpellbook,
    addSpellToSpellbook
  } = useSpellbooks();

  const handleCreate = async () => {
    await createSpellbook({ name: 'New Spellbook' });
  };

  return <SpellbookList spellbooks={spellbooks} onCreate={handleCreate} />;
}
```

### useSpellSorting - Simple Case

```typescript
import { useSpellSorting } from './hooks/useSpellSorting';

function SpellTable({ spells }) {
  const { sortedData, sortColumn, sortDirection, handleSort } = useSpellSorting(spells);

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => handleSort('name')}>
            Name {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map(spell => <tr key={spell.id}>...</tr>)}
      </tbody>
    </table>
  );
}
```

### useSpellSorting - Enriched Data

```typescript
import { useSpellSorting } from './hooks/useSpellSorting';

interface EnrichedSpell {
  spell: Spell;
  prepared: boolean;
  notes: string;
}

function SpellbookDetail({ enrichedSpells }: { enrichedSpells: EnrichedSpell[] }) {
  const { sortedData, sortColumn, sortDirection, handleSort } = useSpellSorting(
    enrichedSpells,
    { getSpell: (item) => item.spell }
  );

  return (
    <table>
      {sortedData.map(({ spell, prepared }) => (
        <tr key={spell.id} className={prepared ? 'prepared' : ''}>
          {spell.name}
        </tr>
      ))}
    </table>
  );
}
```

## Testing

All hooks have comprehensive test coverage in `src/hooks/*.test.ts`:

- **useSpellbooks.test.ts**: 18 tests covering CRUD operations, error handling, and state updates
- Tests use Vitest and `@testing-library/react` with `renderHook` and `waitFor`

## Future Enhancements

- **useSpellFiltering**: Extract filtering logic from App.tsx into a reusable hook
- **useDebounce**: For search input to reduce API calls
- **useLocalStorage**: Persist user preferences (sort order, filters)
