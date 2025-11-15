# Type Definitions

## Purpose
TypeScript type definitions and interfaces for the D&D Spellbook Manager. Provides type safety across the application and documents the data structures.

## Key Files

- **[spell.ts](spell.ts)**: Spell data structure from API
- **[spellbook.ts](spellbook.ts)**: User spellbook and spell entry types

## Type Definitions

### Spell

Complete spell data from D&D 5e SRD API.

```typescript
interface Spell {
  id: string;              // Lowercase kebab-case (e.g., 'fireball')
  name: string;            // Display name (e.g., 'Fireball')
  level: number;           // 0-9 (0 = cantrip)
  school: string;          // 'Evocation', 'Abjuration', etc.
  castingTime: string;     // '1 action', '1 bonus action', etc.
  range: string;           // '150 feet', 'Self', 'Touch', etc.
  duration: string;        // 'Instantaneous', 'Concentration, up to 1 minute', etc.
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
  };
  materials?: string;      // Material component description (if any)
  description: string;     // Full spell description (markdown)
  higherLevels?: string;   // "At Higher Levels" text (if applicable)
  ritual: boolean;         // Can be cast as ritual
  concentration: boolean;  // Requires concentration
  classes: string[];       // ['Wizard', 'Sorcerer']
  source: string;          // 'PHB', 'XGE', etc.
}
```

### Spellbook

User-created spellbook with spell references.

```typescript
interface Spellbook {
  id: string;              // UUID v4
  name: string;            // User-chosen name
  spells: SpellEntry[];    // Array of spell references
  createdAt: Date;
  updatedAt: Date;
}

interface SpellEntry {
  spellId: string;         // References Spell.id
  prepared: boolean;       // Prepared for casting
  notes: string;           // User notes (optional)
}
```

## Design Decisions

### Decision: Spell IDs are kebab-case strings
- **Rationale**: Matches D&D 5e SRD API format, URL-friendly
- **Example**: `'acid-arrow'`, `'mage-armor'`

### Decision: Spellbooks store spell IDs, not full spell objects
- **Rationale**: Spells are reference data (don't change), spellbooks are user data
- **Benefit**: Smaller storage footprint, single source of truth for spell data
- **Tradeoff**: Need to "enrich" spellbook data by looking up spells

### Decision: Separate `prepared` and `notes` per spell entry
- **Rationale**: Different spellbooks may prepare the same spell differently
- **Use case**: Wizard has same spell in multiple spellbooks with different notes

### Decision: `components` as object instead of string array
- **Rationale**: Type-safe access to each component type
- **Before** (bad): `components: ['V', 'S', 'M']` - magic strings
- **After** (good): `components.verbal`, `components.somatic` - typed booleans

## Type Guards

When working with data from storage or API, use type predicates:

```typescript
function isValidSpell(data: unknown): data is Spell {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'level' in data
    // ... more checks
  );
}
```

## Usage

```typescript
import { Spell } from './types/spell';
import { Spellbook, SpellEntry } from './types/spellbook';

// Component props
interface SpellTableProps {
  spells: Spell[];
}

// Service methods
async function getSpellbook(id: string): Promise<Spellbook | undefined> {
  // ...
}
```

## Future Types

- `Character`: Character data for spell slot tracking
- `SearchFilters`: Type-safe search filter object
- `SpellSlot`: Spell slot availability per level
