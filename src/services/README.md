# Services

## Purpose
Service layer for data access and business logic. Services encapsulate external dependencies (API calls, IndexedDB) and provide clean interfaces for components/hooks.

## Key Files

- **[spell.service.ts](spell.service.ts)**: Fetches and searches spell data from API
- **[storage.service.ts](storage.service.ts)**: CRUD operations for spellbooks in IndexedDB
- **[db.ts](db.ts)**: Dexie.js database schema and configuration

## Architecture

```
Components/Hooks
       ↓
   Services (this layer)
       ↓
External Dependencies (API, IndexedDB)
```

**Why a service layer?**
- Decouples UI from data source implementation
- Makes testing easier (can mock services)
- Centralizes business logic (filtering, validation)

## Services

### SpellService

Singleton service for spell data management.

**Key Methods:**
- `loadSpells()`: Fetches spells from API, caches in memory
- `getAllSpells()`: Returns cached spells
- `getSpellById(id)`: Lookup spell by ID
- `searchSpells(filters)`: Advanced filtering with multiple criteria
- `getSchools()`, `getClasses()`, `getSources()`: Metadata for filter UI

**Caching Strategy:**
- Spells loaded once on app init
- Stored in-memory (private `spells` array)
- Only re-fetches if `loadSpells()` called again

### StorageService

Manages spellbook persistence with IndexedDB via Dexie.

**Key Methods:**
- `getSpellbooks()`: List all spellbooks
- `getSpellbook(id)`: Get single spellbook with spells
- `createSpellbook(data)`: Create new spellbook
- `deleteSpellbook(id)`: Delete spellbook
- `addSpellToSpellbook(spellbookId, spellId)`: Add spell
- `toggleSpellPrepared(spellbookId, spellId)`: Toggle prepared flag

**Data Structure:**
```typescript
interface Spellbook {
  id: string;              // UUID
  name: string;
  spells: SpellEntry[];   // Array of spell references
  createdAt: Date;
  updatedAt: Date;
}

interface SpellEntry {
  spellId: string;
  prepared: boolean;
  notes: string;
}
```

## Design Decisions

### Decision: Singleton pattern for SpellService
- **Rationale**: Only one instance needed, spells are global data
- **Implementation**: Export `spellService` instance, not class

### Decision: Separate spell data from spellbooks
- **Rationale**: Spells are read-only reference data, spellbooks are user data
- **Benefit**: Don't duplicate full spell objects in spellbooks, just store IDs

### Decision: Use Dexie.js instead of raw IndexedDB
- **Rationale**: IndexedDB API is verbose and error-prone
- **Benefit**: Promise-based API, easier schema management, better TypeScript support

## Usage

```typescript
// In hooks/useSpells.ts
import { spellService } from '../services/spell.service';

await spellService.loadSpells();
const spells = spellService.getAllSpells();
```

```typescript
// In hooks/useSpellbooks.ts
import { storageService } from '../services/storage.service';

const spellbooks = await storageService.getSpellbooks();
await storageService.createSpellbook({ name: 'My Book' });
```

## Error Handling

Services throw errors that hooks should catch and convert to error state:

```typescript
try {
  await spellService.loadSpells();
} catch (err) {
  setError(err as Error);
}
```

## Future Enhancements

- **Sync service**: Cloud backup for spellbooks
- **Import/export service**: Share spellbooks via JSON
- **Search service**: Full-text search with fuzzy matching
