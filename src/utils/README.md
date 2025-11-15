# Utility Functions

## Purpose
Pure utility functions for formatting, transformation, and shared logic. All functions are pure (no side effects) and easily testable.

## Key Files

- **[spellFormatters.ts](spellFormatters.ts)**: Format spell data for display

## Functions

### getLevelText(level: number): string

Formats spell level as display text.

**Examples:**
```typescript
getLevelText(0)  // 'Cantrip'
getLevelText(1)  // '1'
getLevelText(9)  // '9'
```

**Why not "Level 1"?** Saves horizontal space in table columns.

---

### getComponentsText(spell: Spell): string

Formats spell components as comma-separated abbreviations.

**Examples:**
```typescript
getComponentsText({ components: { verbal: true, somatic: true, material: false } })
// 'V, S'

getComponentsText({ components: { verbal: false, somatic: true, material: true } })
// 'S, M'
```

**Use case:** Compact table display.

---

### getComponentsWithMaterials(spell: Spell): string

Formats components with material description in parentheses.

**Examples:**
```typescript
getComponentsWithMaterials({
  components: { verbal: true, somatic: true, material: true },
  materials: 'a tiny ball of bat guano and sulfur'
})
// 'V, S, M (a tiny ball of bat guano and sulfur)'
```

**Use case:** Expanded spell detail views.

---

### filterClasses(classes: string[]): string[]

Removes "Ritual Caster" from class list.

**Rationale:** "Ritual Caster" is a feat, not a class. Including it clutters the display.

**Example:**
```typescript
filterClasses(['Wizard', 'Sorcerer', 'Ritual Caster'])
// ['Wizard', 'Sorcerer']
```

## Design Decisions

### Decision: Pure functions only
- **Rationale**: Easier to test, no hidden dependencies
- **Benefit**: Can use anywhere without worrying about side effects

### Decision: Extract formatters from components
- **Before**: Each component had its own copy of `getLevelText`, etc.
- **Problem**: 51 lines of duplicate code across 3 components
- **After**: Single source of truth, DRY principle

### Decision: Separate utils from services
- **Utils**: Pure functions, no I/O
- **Services**: I/O operations (API, database)

## Testing

Test utilities with simple unit tests:

```typescript
import { getLevelText } from './spellFormatters';

describe('getLevelText', () => {
  it('formats cantrips', () => {
    expect(getLevelText(0)).toBe('Cantrip');
  });

  it('formats leveled spells', () => {
    expect(getLevelText(3)).toBe('3');
  });
});
```

## Future Utilities

- **dateFormatters.ts**: Format dates for display
- **validators.ts**: Input validation functions
- **arrayUtils.ts**: Array manipulation helpers
