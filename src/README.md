# Source Code

## Purpose
Main application source code for the D&D Spellbook Manager. A React + TypeScript web application for browsing D&D 5e spells and managing personal spellbooks.

## Directory Structure

```
src/
├── components/       # React UI components
├── hooks/            # Custom React hooks
├── services/         # Data access layer (API, IndexedDB)
├── types/            # TypeScript type definitions
├── utils/            # Pure utility functions
├── e2e/              # End-to-end tests (Puppeteer)
└── test/             # Test utilities and setup
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           Components (UI)                │
│  App, SpellTable, SpellbookDetail, etc. │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│       Hooks (State Management)          │
│  useSpells, useSpellbooks, etc.         │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│      Services (Data Access)              │
│  spell.service, storage.service          │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│    External Dependencies                 │
│    API, IndexedDB                        │
└──────────────────────────────────────────┘
```

**Data Flow:** Components → Hooks → Services → External Systems

## Key Patterns

### Component Composition
Components are built from smaller, reusable pieces:
- `SpellTable` uses `SortIcon` and `ExpandableSpellRow`
- Shared components reduce duplication

### Custom Hooks for State
Business logic lives in hooks, not components:
- `useSpells`: Load spell data
- `useSpellbooks`: Manage spellbooks
- `useSpellSorting`: Generic sorting logic

**Benefits:**
- Testable without rendering components
- Reusable across multiple components
- Cleaner component code

### Service Layer
Services abstract data sources:
- `spellService`: Fetches from API
- `storageService`: IndexedDB operations

**Benefits:**
- Easy to mock for testing
- Can swap implementations (e.g., local JSON → REST API)
- Centralizes error handling

## Design Decisions

### Decision: Single Page Application (SPA)
- **Implementation**: Hash-based routing (`#/browse`, `#/spellbooks`)
- **Rationale**: Simpler than server-side routing, works on static hosting
- **Tradeoff**: No deep linking benefits, but sufficient for this use case

### Decision: Client-side data storage (IndexedDB)
- **Rationale**: Offline-first, no backend needed
- **Tradeoff**: Data is local to device, but matches use case (personal spellbooks)

### Decision: React without a state management library
- **Rationale**: Application state is simple enough for built-in hooks
- **Avoided**: Redux, MobX, Zustand
- **Benefit**: Fewer dependencies, less boilerplate

## Module Documentation

Each directory has its own README with detailed documentation:

- **[components/](components/README.md)**: UI component architecture
- **[hooks/](hooks/README.md)**: Custom hooks and patterns
- **[services/](services/README.md)**: Data access layer
- **[types/](types/README.md)**: TypeScript type definitions
- **[utils/](utils/README.md)**: Utility functions

## Testing Strategy

- **Unit tests**: Services, hooks, utilities (Vitest)
- **E2E tests**: User flows (Puppeteer)
- **Coverage**: 151 tests across all layers

## Getting Started

To understand the codebase:

1. Start with [types/](types/README.md) - understand the data model
2. Read [services/](services/README.md) - see how data is fetched/stored
3. Explore [hooks/](hooks/README.md) - understand state management
4. Finally [components/](components/README.md) - see UI layer

## Future Architecture

- **Feature modules**: Group related components/hooks/services together
- **Code splitting**: Lazy load spellbook detail view
- **Web Workers**: Move spell filtering to background thread
